import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { buildDinnerFormulaResult, type DinnerFormulaInput, type DinnerJourneyContext } from "@/lib/dinner-formula-analysis";
import { prisma } from "@/lib/db";
import { authorizeWorkbook } from "@/lib/workbook";
import { rateLimit, requestIp } from "@/lib/rate-limit";

const reportBody = z.object({
  fullnessAfterDinner: z.number().int().min(0).max(10),
  cravingAfterDinner: z.enum(["有", "沒有", "一點點"]),
  hadSweetDrink: z.boolean(),
  didClosingAction: z.enum(["有", "沒有", "部分有"]),
  reflection: z.string().trim().max(1000).optional().nullable(),
});

const text = z.string().trim().min(1).max(300);
const upgradeBody = z.object({
  mode: z.literal("upgrade"),
  proteinChoice: text.optional(),
  vegetableChoice: text.optional(),
  carbChoice: text.optional(),
  drinkChoice: text.optional(),
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

export async function PATCH(req: Request, { params }: { params: Promise<{ accessToken: string; entryId: string }> }) {
  const { accessToken, entryId } = await params;
  if (!await rateLimit(`dinner-report:${requestIp(req)}`, 60, 60_000)) {
    return NextResponse.json({ error: "請稍後再試" }, { status: 429 });
  }
  if (!await authorizeWorkbook(accessToken)) {
    return NextResponse.json({ error: "無法更新晚餐回報" }, { status: 404 });
  }
  const raw = await req.json().catch(() => null);
  const reportParsed = reportBody.safeParse(raw);
  const upgradeParsed = upgradeBody.safeParse(raw);
  const entry = await prisma.dinnerFormulaEntry.findFirst({ where: { id: entryId, accessToken }, select });
  if (!entry) return NextResponse.json({ error: "找不到這筆晚餐紀錄" }, { status: 404 });

  if (reportParsed.success) {
    const updated = await prisma.dinnerFormulaEntry.update({
      where: { id: entryId },
      data: { ...reportParsed.data, reflection: reportParsed.data.reflection || null },
      select: {
        id: true,
        fullnessAfterDinner: true,
        cravingAfterDinner: true,
        hadSweetDrink: true,
        didClosingAction: true,
        reflection: true,
        updatedAt: true,
      },
    });
    return NextResponse.json({ entry: updated });
  }

  if (upgradeParsed.success) {
    const merged = { ...entry, ...upgradeParsed.data };
    const input: DinnerFormulaInput = {
      hungerScore: merged.hungerScore,
      fatigueScore: merged.fatigueScore,
      stressScore: merged.stressScore,
      currentStates: Array.isArray(merged.currentStates) ? merged.currentStates.map(String) : [],
      mealScene: merged.mealScene,
      proteinChoice: merged.proteinChoice,
      vegetableChoice: merged.vegetableChoice,
      carbChoice: merged.carbChoice,
      drinkChoice: merged.drinkChoice,
      closingAction: merged.closingAction,
      daytimeIntakeStatus: merged.daytimeIntakeStatus as DinnerFormulaInput["daytimeIntakeStatus"],
      dinnerTimeBand: merged.dinnerTimeBand as DinnerFormulaInput["dinnerTimeBand"],
      tonightConcerns: Array.isArray(merged.tonightConcerns) ? merged.tonightConcerns as DinnerFormulaInput["tonightConcerns"] : [],
    };
    const dinnerFormulaResult = buildDinnerFormulaResult(input, (entry.contextData ?? null) as DinnerJourneyContext | null);
    const updated = await prisma.dinnerFormulaEntry.update({
      where: { id: entryId },
      data: {
        proteinChoice: input.proteinChoice,
        vegetableChoice: input.vegetableChoice,
        carbChoice: input.carbChoice,
        drinkChoice: input.drinkChoice,
        generatedSuggestion: dinnerFormulaResult.analysisSummary,
        dinnerFormulaResult: dinnerFormulaResult as Prisma.InputJsonValue,
      },
      select,
    });
    return NextResponse.json({ entry: updated });
  }

  return NextResponse.json({ error: "請完成晚餐後回報，或套用一個晚餐升級" }, { status: 400 });
}
