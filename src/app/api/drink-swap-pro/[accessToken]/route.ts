import {Prisma} from "@prisma/client";
import {NextResponse} from "next/server";
import {z} from "zod";
import {defaultDrinkRules,drinkItems} from "@/content/drinkData";
import {drinkSwapProContent as c} from "@/content/drinkSwapPro";
import {prisma} from "@/lib/db";
import {buildDrinkAnalysis} from "@/lib/drink-swap-analysis";
import {rateLimit,requestIp} from "@/lib/rate-limit";
import {authorizeProductAccess} from "@/lib/workbook";

const body=z.object({drinkId:z.string(),feeling:z.enum(["甜","奶香","咀嚼感","提神","冰涼","犒賞感","飽足感"]),sugarHabit:z.enum(["全糖","半糖","微糖","無糖"]),toppings:z.array(z.string()).max(6),cupSize:z.enum(["大杯","中杯","小杯"]),context:z.string().max(30)});
const select={id:true,category:true,originalChoice:true,sugarHabit:true,toppingsHabit:true,cupSize:true,suggestedSwap:true,suggestedReason:true,orderScript:true,nextStep:true,drinkId:true,feeling:true,context:true,analysisResult:true,createdAt:true} as const;

export async function GET(req:Request,{params}:{params:Promise<{accessToken:string}>}){const {accessToken}=await params;if(!await rateLimit(`pro-drink-r:${requestIp(req)}`,60,60000))return NextResponse.json({error:"請稍後再試"},{status:429});if(!await authorizeProductAccess(accessToken,"sugary_drink_swap_pro"))return NextResponse.json({error:c.invalid},{status:404});const [records,favorites,profile,observations]=await Promise.all([prisma.drinkSwapProRecord.findMany({where:{accessToken},orderBy:{createdAt:"desc"},take:30,select}),prisma.drinkSwapProFavorite.findMany({where:{accessToken},orderBy:{createdAt:"desc"},take:30}),prisma.drinkSwapProProfile.findUnique({where:{accessToken}}),prisma.drinkSwapProObservation.findMany({where:{accessToken},orderBy:{dayNumber:"asc"}})]);return NextResponse.json({records,favorites,rules:profile?.rules??defaultDrinkRules,observations})}

export async function POST(req:Request,{params}:{params:Promise<{accessToken:string}>}){const {accessToken}=await params;if(!await rateLimit(`pro-drink-w:${requestIp(req)}`,60,60000))return NextResponse.json({error:"請稍後再試"},{status:429});if(!await authorizeProductAccess(accessToken,"sugary_drink_swap_pro"))return NextResponse.json({error:c.invalid},{status:404});const parsed=body.safeParse(await req.json().catch(()=>null));if(!parsed.success)return NextResponse.json({error:"請完成飲料、感覺與目前版本"},{status:400});const drink=drinkItems.find(x=>x.id===parsed.data.drinkId);if(!drink)return NextResponse.json({error:"找不到這杯飲料"},{status:400});const analysis=buildDrinkAnalysis(parsed.data);if("error" in analysis)return NextResponse.json({error:analysis.error},{status:400});const record=await prisma.drinkSwapProRecord.create({data:{accessToken,drinkId:drink.id,category:drink.category,originalChoice:drink.name,sugarHabit:parsed.data.sugarHabit,toppingsHabit:parsed.data.toppings as Prisma.InputJsonValue,cupSize:parsed.data.cupSize,feeling:parsed.data.feeling,context:parsed.data.context,suggestedSwap:analysis.recommendedVersion,suggestedReason:analysis.summary,orderScript:analysis.oneThingRule,nextStep:analysis.oneThingRule,analysisResult:analysis as unknown as Prisma.InputJsonValue},select});return NextResponse.json({record,analysis},{status:201})}
