import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { determineThreeMinuteResult,type ThreeMinuteData } from "@/content/threeMinuteCheck";
import { prisma } from "@/lib/db";
import { rateLimit,requestIp } from "@/lib/rate-limit";
import { authorizeWorkbook } from "@/lib/workbook";

const text=z.string().trim().max(1000).optional().nullable();
const score=z.number().int().min(0).max(10).default(0);
const bodySchema=z.object({id:z.string().cuid().optional(),complete:z.boolean().optional(),cravingItem:text,location:text,beforeActivity:text,bodySignals:z.array(z.string().max(50)).max(20).default([]),hungerScore:score,mouthCravingScore:score,fatigueScore:score,stressScore:score,comfortNeedScore:score,sugaryDrinkScore:score,emotionTags:z.array(z.string().max(50)).max(20).default([]),needType:text,chosenAction:text,cravingChange:text,finalChoice:text,selfReminder:text});
const selection={id:true,cravingItem:true,location:true,beforeActivity:true,bodySignals:true,hungerScore:true,mouthCravingScore:true,fatigueScore:true,stressScore:true,comfortNeedScore:true,sugaryDrinkScore:true,emotionTags:true,needType:true,chosenAction:true,cravingChange:true,finalChoice:true,selfReminder:true,resultType:true,createdAt:true,updatedAt:true} as const;

export async function GET(req:Request,{params}:{params:Promise<{accessToken:string}>}){
  const {accessToken}=await params;
  if(!await rateLimit(`three-minute-read:${requestIp(req)}`,60,60_000))return NextResponse.json({error:"請稍後再試"},{status:429});
  if(!await authorizeWorkbook(accessToken))return NextResponse.json({error:"這個工具包連結無效或尚未開通"},{status:404});
  const records=await prisma.threeMinuteCheckIn.findMany({where:{accessToken},orderBy:{createdAt:"desc"},take:10,select:selection});
  return NextResponse.json({records});
}

export async function POST(req:Request,{params}:{params:Promise<{accessToken:string}>}){
  const {accessToken}=await params;
  if(!await rateLimit(`three-minute-write:${requestIp(req)}`,120,60_000))return NextResponse.json({error:"儲存太頻繁，請稍候"},{status:429});
  const owner=await authorizeWorkbook(accessToken);
  if(!owner)return NextResponse.json({error:"這個工具包連結無效或尚未開通"},{status:404});
  const parsed=bodySchema.safeParse(await req.json().catch(()=>null));
  if(!parsed.success)return NextResponse.json({error:"填寫資料格式不正確"},{status:400});
  const input=parsed.data;
  if(input.id&&!await prisma.threeMinuteCheckIn.findFirst({where:{id:input.id,accessToken},select:{id:true}}))return NextResponse.json({error:"找不到這筆紀錄"},{status:404});
  const resultType=input.complete?determineThreeMinuteResult(input as ThreeMinuteData):null;
  const data={cravingItem:input.cravingItem||null,location:input.location||null,beforeActivity:input.beforeActivity||null,bodySignals:input.bodySignals as Prisma.InputJsonValue,hungerScore:input.hungerScore,mouthCravingScore:input.mouthCravingScore,fatigueScore:input.fatigueScore,stressScore:input.stressScore,comfortNeedScore:input.comfortNeedScore,sugaryDrinkScore:input.sugaryDrinkScore,emotionTags:input.emotionTags as Prisma.InputJsonValue,needType:input.needType||null,chosenAction:input.chosenAction||null,cravingChange:input.cravingChange||null,finalChoice:input.finalChoice||null,selfReminder:input.selfReminder||null,resultType};
  const record=input.id?await prisma.threeMinuteCheckIn.update({where:{id:input.id},data,select:selection}):await prisma.threeMinuteCheckIn.create({data:{...data,accessToken,customerId:owner.customerId,orderId:owner.orderId},select:selection});
  return NextResponse.json({record},{status:input.id?200:201});
}
