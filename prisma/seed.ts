import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const products = [
  { code: "emotional_eating_reset_7d", name: "下班後嘴饞止損包：7 天情緒性進食＋含糖飲料重置計畫", price: 199, description: "7 天行動計畫與 8 份實用工具。" },
  { code: "ai_energy_assessment", name: "AI 能量減脂初評", price: 1, description: "找出情緒、壓力、睡眠、外食與營養缺口。" },
  { code: "sugary_drink_swap_pro", name: "含糖飲料替換清單 Pro", price: 99, description: "手搖飲與日常飲品替換工具。" },
  { code: "anti_binge_meal_plan_7d", name: "7 天外食防暴食菜單", price: 199, description: "外食情境的省力搭配菜單。" },
  { code: "coaching_deposit_3d", name: "3 天嘴饞止損陪跑預約金", price: 399, description: "教練協助檢視嘴饞觸發點與調整方向。" }
];
async function main() { for (const p of products) await prisma.product.upsert({ where: { code: p.code }, update: p, create: p }); }
main().finally(() => prisma.$disconnect());
