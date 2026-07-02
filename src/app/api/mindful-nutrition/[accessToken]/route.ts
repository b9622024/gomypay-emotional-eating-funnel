import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authorizeWorkbook } from "@/lib/workbook";
import { rateLimit,requestIp } from "@/lib/rate-limit";
import { buildMindfulNutritionSummary,type NutritionDayState } from "@/content/mindfulNutritionTracker";

export async function GET(req:Request,{params}:{params:Promise<{accessToken:string}>}){const {accessToken}=await params;if(!await rateLimit(`nutrition-read:${requestIp(req)}`,60,60_000))return NextResponse.json({error:"請稍後再試"},{status:429});if(!await authorizeWorkbook(accessToken))return NextResponse.json({error:"無法開啟這份營養追蹤器"},{status:404});const entries=await prisma.mindfulNutritionEntry.findMany({where:{accessToken},orderBy:{dayNumber:"asc"},select:{dayNumber:true,data:true,isCompleted:true,completedAt:true,updatedAt:true}});const mapped:Record<number,NutritionDayState>={};const days=Array.from({length:7},(_,i)=>{const entry=entries.find(x=>x.dayNumber===i+1);const item={dayNumber:i+1,data:(entry?.data??{}) as Record<string,unknown>,isCompleted:entry?.isCompleted??false,completedAt:entry?.completedAt?.toISOString()??null,updatedAt:entry?.updatedAt??null};mapped[i+1]=item;return item});return NextResponse.json({days,summary:buildMindfulNutritionSummary(mapped)});}
