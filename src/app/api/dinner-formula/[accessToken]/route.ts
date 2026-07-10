import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { dinnerFormulaContent } from "@/content/dinnerFormula";
import { prisma } from "@/lib/db";
import {
  buildDinnerFormulaResult,
  type DinnerJourneyContext,
  type DinnerTimeBand,
  type DaytimeIntakeStatus,
  type TonightConcern,
} from "@/lib/dinner-formula-analysis";
import { getBreakthroughState } from "@/lib/breakthrough-plan";
import { authorizeWorkbook } from "@/lib/workbook";
import { rateLimit, requestIp } from "@/lib/rate-limit";
import { buildDinnerSummary } from "@/content/dinnerFormula";

const text = z.string().trim().min(1).max(300);
const score = z.number().int().min(0).max(10);
const daytimeIntakeStatus = z.enum([
  "breakfast_and_lunch_stable",
  "breakfast_insufficient",
  "lunch_insufficient",
  "both_insufficient",
  "almost_no_food",
]);
const dinnerTimeBand = z.enum(["early_dinner", "normal_dinner", "late_dinner"]);
const tonightConcern = z.enum([
  "still_hungry_later",
  "overeating",
  "sugary_drink",
  "emotional_reward",
  "screen_eating",
]);
const body = z.object({
  hungerScore: score,
  fatigueScore: score,
  stressScore: score,
  currentStates: z.array(z.string().max(30)).min(1).max(10),
  mealScene: z.string().refine(x => x in dinnerFormulaContent.scenes),
  proteinChoice: text,
  vegetableChoice: text,
  carbChoice: text,
  drinkChoice: text,
  closingAction: text,
  daytimeIntakeStatus: daytimeIntakeStatus.default("breakfast_and_lunch_stable"),
  dinnerTimeBand: dinnerTimeBand.default("normal_dinner"),
  tonightConcerns: z.array(tonightConcern).max(2).default([]),
});

const select = {
  id: true,
  hungerScore: true,
  fatigueScore: true,
  stressScore: true,
  currentStates: true,
  mealScene: true,
  proteinChoice: true,
  vegetableChoice: true,
  carbChoice: true,
  drinkChoice: true,
  closingAction: true,
  generatedSuggestion: true,
  daytimeIntakeStatus: true,
  dinnerTimeBand: true,
  tonightConcerns: true,
  contextData: true,
  dinnerFormulaResult: true,
  fullnessAfterDinner: true,
  cravingAfterDinner: true,
  hadSweetDrink: true,
  didClosingAction: true,
  reflection: true,
  createdAt: true,
  updatedAt: true,
} as const;

const arr = (value: unknown) => Array.isArray(value) ? value.map(String) : [];
const num = (value: unknown) => typeof value === "number" && Number.isFinite(value) ? value : null;

function resultByLevel(entries: Array<{ levelNumber: number; analysisResult: Prisma.JsonValue | null }>) {
  return Object.fromEntries(entries.map(entry => [entry.levelNumber, (entry.analysisResult ?? {}) as Record<string, unknown>]));
}

async function buildJourneyContext(accessToken: string): Promise<DinnerJourneyContext | null> {
  const state = await getBreakthroughState(accessToken).catch(() => null);
  if (!state) return null;
  const byLevel = resultByLevel(state.entries.map(entry => ({
    levelNumber: entry.levelNumber,
    analysisResult: entry.analysisResult,
  })));
  const l1 = byLevel[1] ?? {};
  const l2 = byLevel[2] ?? {};
  const l3 = byLevel[3] ?? {};
  const l4 = byLevel[4] ?? {};
  const l5 = byLevel[5] ?? {};
  const l1Scores = (l1.sourceScores ?? {}) as Record<string, unknown>;
  return {
    characterName: state.characters.primary?.characterName ?? null,
    originalTypeName: state.characters.primary?.originalTypeName ?? null,
    timePatternType: String(l1.timePatternType ?? ""),
    hungerScore: num(l1.hungerScore) ?? num(l1Scores.hunger),
    fatigueScore: num(l1.fatigueScore) ?? num(l1Scores.fatigue),
    stressScore: num(l1.stressScore) ?? num(l1Scores.stress),
    triggerType: String(l2.triggerType ?? ""),
    highRiskScenes: arr(l2.highRiskScenes),
    decodedSignalType: String(l3.decodedSignalType ?? ""),
    selectedBranch: String(l4.selectedBranch ?? state.progress.selectedBranch ?? ""),
    secondaryBranch: String(l4.secondaryBranch ?? ""),
    totalNutritionScore: num(l5.totalNutritionScore),
    nutritionGapTypes: arr(l5.nutritionGapTypes),
    lowestItems: arr(l5.lowestItems),
  };
}

export async function GET(req: Request, { params }: { params: Promise<{ accessToken: string }> }) {
  const { accessToken } = await params;
  if (!await rateLimit(`dinner-read:${requestIp(req)}`, 60, 60_000)) {
    return NextResponse.json({ error: "請稍後再試" }, { status: 429 });
  }
  if (!await authorizeWorkbook(accessToken)) {
    return NextResponse.json({ error: "無法開啟晚餐選擇器" }, { status: 404 });
  }
  const entries = await prisma.dinnerFormulaEntry.findMany({
    where: { accessToken },
    orderBy: { createdAt: "desc" },
    take: 7,
    select,
  });
  return NextResponse.json({ entries, summary: buildDinnerSummary(entries) });
}

export async function POST(req: Request, { params }: { params: Promise<{ accessToken: string }> }) {
  const { accessToken } = await params;
  if (!await rateLimit(`dinner-write:${requestIp(req)}`, 60, 60_000)) {
    return NextResponse.json({ error: "操作太頻繁，請稍候" }, { status: 429 });
  }
  const owner = await authorizeWorkbook(accessToken);
  if (!owner) return NextResponse.json({ error: "無法儲存晚餐選擇" }, { status: 404 });

  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "請完成今晚的晚餐選擇" }, { status: 400 });

  const x = parsed.data;
  const scene = dinnerFormulaContent.scenes[x.mealScene];
  if (
    !scene.protein.includes(x.proteinChoice) ||
    !scene.vegetable.includes(x.vegetableChoice) ||
    !scene.carb.includes(x.carbChoice) ||
    !scene.drink.includes(x.drinkChoice) ||
    !dinnerFormulaContent.closingActions.includes(x.closingAction as never)
  ) {
    return NextResponse.json({ error: "晚餐選項不正確，請重新選擇" }, { status: 400 });
  }

  const contextData = await buildJourneyContext(accessToken);
  const dinnerFormulaResult = buildDinnerFormulaResult({
    ...x,
    daytimeIntakeStatus: x.daytimeIntakeStatus as DaytimeIntakeStatus,
    dinnerTimeBand: x.dinnerTimeBand as DinnerTimeBand,
    tonightConcerns: x.tonightConcerns as TonightConcern[],
  }, contextData);
  const generatedSuggestion = dinnerFormulaResult.analysisSummary;

  const entry = await prisma.dinnerFormulaEntry.create({
    data: {
      ...x,
      currentStates: x.currentStates as Prisma.InputJsonValue,
      tonightConcerns: x.tonightConcerns as Prisma.InputJsonValue,
      contextData: (contextData ?? {}) as Prisma.InputJsonValue,
      dinnerFormulaResult: dinnerFormulaResult as Prisma.InputJsonValue,
      generatedSuggestion,
      accessToken,
      customerId: owner.customerId,
      orderId: owner.orderId,
    },
    select,
  });
  return NextResponse.json({ entry }, { status: 201 });
}
