import { randomInt } from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { proAddonByCode } from "@/content/proAddons";
import { prisma } from "@/lib/db";
import { rateLimit, requestIp } from "@/lib/rate-limit";

const body = z.object({ accessToken: z.string().min(20).max(200), productCode: z.enum(["sugary_drink_swap_pro", "anti_binge_meal_plan_7d"]) });
function orderNo() { const d = new Date(), p = (n: number) => String(n).padStart(2, "0"); return `PA${p(d.getFullYear()%100)}${p(d.getMonth()+1)}${p(d.getDate())}${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}${String(randomInt(10000)).padStart(4,"0")}`; }

export async function POST(req: Request) {
  try {
    if (!await rateLimit(`pro-addon:${requestIp(req)}`, 6, 60_000)) return NextResponse.json({ error: "請稍後再試" }, { status: 429 });
    const parsed = body.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "購買資料不完整" }, { status: 400 });
    const source = await prisma.entitlement.findUnique({ where: { accessToken: parsed.data.accessToken }, include: { order: true } });
    if (!source || source.order.status !== "paid") return NextResponse.json({ error: "找不到有效的工具包購買紀錄" }, { status: 403 });
    const ownsMain = await prisma.entitlement.findFirst({ where: { customerId: source.customerId, productCode: "emotional_eating_reset_7d", order: { status: "paid" } }, select: { id: true } });
    if (!ownsMain) return NextResponse.json({ error: "此加購入口僅提供工具包使用者" }, { status: 403 });
    const owned = await prisma.entitlement.findFirst({ where: { customerId: source.customerId, productCode: parsed.data.productCode, order: { status: "paid" } }, select: { id: true } });
    if (owned) return NextResponse.json({ error: "你已經擁有這項進階道具，請直接回工具包使用" }, { status: 409 });
    const addon = proAddonByCode(parsed.data.productCode);
    if (!addon) return NextResponse.json({ error: "找不到加購商品" }, { status: 400 });
    const product = await prisma.product.findUnique({ where: { code: addon.productCode } });
    if (!product?.isActive) return NextResponse.json({ error: "商品目前暫停購買" }, { status: 400 });
    const pending = await prisma.order.findFirst({ where: { customerId: source.customerId, status: "pending", amount: addon.standalonePrice, items: { some: { productCode: addon.productCode, price: addon.standalonePrice } } }, orderBy: { createdAt: "desc" }, select: { orderNo: true, amount: true } });
    if (pending) return NextResponse.json({ ...pending, status: "pending", paymentRequired: true });
    const order = await prisma.order.create({ data: { orderNo: orderNo(), customerId: source.customerId, amount: addon.standalonePrice, buyerMemo: `${addon.title}（購後單獨加購）`, items: { create: { productCode: addon.productCode, name: addon.title, price: addon.standalonePrice, quantity: 1 } } }, select: { orderNo: true, amount: true } });
    return NextResponse.json({ ...order, status: "pending", paymentRequired: true }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "目前無法建立加購訂單" }, { status: 400 });
  }
}
