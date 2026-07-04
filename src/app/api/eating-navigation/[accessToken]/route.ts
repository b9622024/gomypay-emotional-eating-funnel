import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { authorizeProductAccess } from "@/lib/workbook";
import { analyzeMealCombination, analyzeNavigationMode, analyzePostMealReview, generateThreeRouteSuggestions } from "@/lib/eating-navigation-analysis";

const scan = z.object({ hungerScore: z.number().min(0).max(10), fatigueScore: z.number().min(0).max(10), rushScore: z.number().min(0).max(10), previousIntakeFlags: z.array(z.string()), currentGoal: z.string(), optionalTime: z.string(), characterType: z.string().optional() });
const create = z.object({ statusScan: scan, sceneId: z.string(), selectedItemIds: z.array(z.string()).min(1) });
const review = z.object({ id: z.string(), finalSelectedItems: z.array(z.string()), satietyAfter: z.number().min(0).max(5), energyAfter: z.enum(["worse", "same", "better"]), stillCraving: z.enum(["none", "mild", "strong"]), saveAsFavorite: z.boolean().optional(), note: z.string().max(1000).optional() });

export async function GET(_: Request, { params }: { params: Promise<{ accessToken: string }> }) {
  const { accessToken } = await params;
  if (!await authorizeProductAccess(accessToken, "anti_binge_meal_plan_7d")) return NextResponse.json({ error: "無權存取" }, { status: 404 });
  const [sessions, favorites] = await Promise.all([
    prisma.eatingNavigationSession.findMany({ where: { accessToken }, orderBy: { createdAt: "desc" }, take: 20 }),
    prisma.eatingNavigationFavorite.findMany({ where: { accessToken }, orderBy: { createdAt: "desc" } }),
  ]);
  return NextResponse.json({ sessions, favorites });
}

export async function POST(req: Request, { params }: { params: Promise<{ accessToken: string }> }) {
  const { accessToken } = await params;
  const owner = await authorizeProductAccess(accessToken, "anti_binge_meal_plan_7d");
  if (!owner) return NextResponse.json({ error: "無權存取" }, { status: 404 });
  const parsed = create.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "請完成狀態、場景與餐點選擇" }, { status: 400 });
  const favorites = await prisma.eatingNavigationFavorite.findMany({ where: { accessToken, sceneId: parsed.data.sceneId }, orderBy: { createdAt: "desc" }, take: 3 });
  const modes = analyzeNavigationMode(parsed.data.statusScan);
  const analysis = analyzeMealCombination({ status: parsed.data.statusScan, sceneId: parsed.data.sceneId, selectedItemIds: parsed.data.selectedItemIds });
  const suggestions = generateThreeRouteSuggestions({ status: parsed.data.statusScan, sceneId: parsed.data.sceneId, analysis, favoriteTitles: favorites.map(x => x.title) });
  const session = await prisma.eatingNavigationSession.create({ data: { accessToken, customerId: owner.customerId, orderId: owner.orderId, statusScan: parsed.data.statusScan as Prisma.InputJsonValue, navigationModes: modes as unknown as Prisma.InputJsonValue, sceneId: parsed.data.sceneId, selectedItems: parsed.data.selectedItemIds as Prisma.InputJsonValue, analysisResult: analysis as unknown as Prisma.InputJsonValue, threeRouteSuggestions: suggestions as unknown as Prisma.InputJsonValue } });
  return NextResponse.json({ session, modes, analysis, suggestions }, { status: 201 });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ accessToken: string }> }) {
  const { accessToken } = await params;
  if (!await authorizeProductAccess(accessToken, "anti_binge_meal_plan_7d")) return NextResponse.json({ error: "無權存取" }, { status: 404 });
  const parsed = review.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "回顧資料不完整" }, { status: 400 });
  const existing = await prisma.eatingNavigationSession.findFirst({ where: { id: parsed.data.id, accessToken } });
  if (!existing) return NextResponse.json({ error: "找不到紀錄" }, { status: 404 });
  const recent = await prisma.eatingNavigationSession.findMany({ where: { accessToken, sceneId: existing.sceneId, id: { not: existing.id } }, orderBy: { createdAt: "desc" }, take: 6, select: { selectedItems: true, postMealReview: true } });
  const target = [...parsed.data.finalSelectedItems].sort().join("|");
  const repeatSuccessCount = recent.filter(item => {
    const selected = Array.isArray(item.selectedItems) ? [...(item.selectedItems as string[])].sort().join("|") : "";
    const post = item.postMealReview as any;
    return selected === target && post?.satietyAfter >= 4 && ["none", "mild"].includes(post?.stillCraving);
  }).length;
  const analysis = existing.analysisResult as any;
  const post = analyzePostMealReview({ ...parsed.data, analysis, repeatSuccessCount });
  const session = await prisma.eatingNavigationSession.update({ where: { id: existing.id }, data: { finalSelectedItems: parsed.data.finalSelectedItems as Prisma.InputJsonValue, postMealReview: { ...parsed.data, ...post } as unknown as Prisma.InputJsonValue } });
  return NextResponse.json({ session, post });
}
