import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { authorizeWorkbook,validDay } from "@/lib/workbook";
import { rateLimit,requestIp } from "@/lib/rate-limit";
const body=z.object({data:z.record(z.unknown()).optional()});
export async function POST(req:Request,{params}:{params:Promise<{accessToken:string;dayNumber:string}>}){const {accessToken,dayNumber}=await params;if(!await rateLimit(`nutrition-complete:${requestIp(req)}`,30,60_000))return NextResponse.json({error:"請稍後再試"},{status:429});const day=validDay(dayNumber),owner=await authorizeWorkbook(accessToken);if(!day||!owner)return NextResponse.json({error:"無法完成這份紀錄"},{status:404});const parsed=body.safeParse(await req.json().catch(()=>({})));if(!parsed.success)return NextResponse.json({error:"資料格式不正確"},{status:400});const existing=await prisma.mindfulNutritionEntry.findUnique({where:{accessToken_dayNumber:{accessToken,dayNumber:day}}}),completedAt=existing?.completedAt??new Date(),data=(parsed.data.data??existing?.data??{}) as Prisma.InputJsonValue;const entry=await prisma.mindfulNutritionEntry.upsert({where:{accessToken_dayNumber:{accessToken,dayNumber:day}},update:{data,isCompleted:true,completedAt},create:{accessToken,dayNumber:day,data,isCompleted:true,completedAt,customerId:owner.customerId,orderId:owner.orderId},select:{dayNumber:true,isCompleted:true,completedAt:true,updatedAt:true}});return NextResponse.json(entry);}
