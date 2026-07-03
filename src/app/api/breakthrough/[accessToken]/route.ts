import { NextResponse } from "next/server";
import { z } from "zod";
import { completeBreakthroughLevel, getBreakthroughState } from "@/lib/breakthrough-plan";
import { rateLimit, requestIp } from "@/lib/rate-limit";

const body = z.object({
  levelNumber: z.number().int().min(1).max(7),
  userNotes: z.string().max(3000).optional(),
  selectedBranch: z.enum(["drink", "nutrition", "stress", "swap"]).optional(),
  userInputs: z.record(z.unknown()).optional(),
  map: z.record(z.unknown()).optional(),
});

export async function GET(req: Request, { params }: { params: Promise<{ accessToken: string }> }) {
  const { accessToken } = await params;
  if (!await rateLimit(`breakthrough-r:${requestIp(req)}`, 60, 60000)) return NextResponse.json({ error: "請稍後再試" }, { status: 429 });
  const state = await getBreakthroughState(accessToken);
  return state ? NextResponse.json(state) : NextResponse.json({ error: "無權存取" }, { status: 404 });
}

export async function POST(req: Request, { params }: { params: Promise<{ accessToken: string }> }) {
  const { accessToken } = await params;
  if (!await rateLimit(`breakthrough-w:${requestIp(req)}`, 30, 60000)) return NextResponse.json({ error: "請稍後再試" }, { status: 429 });
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "關卡資料不正確" }, { status: 400 });
  try { return NextResponse.json(await completeBreakthroughLevel(accessToken, parsed.data)); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "無法完成關卡" }, { status: 400 }); }
}
