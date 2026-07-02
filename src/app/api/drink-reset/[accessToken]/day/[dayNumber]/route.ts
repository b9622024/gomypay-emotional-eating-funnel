import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { authorizeWorkbook,validDay } from "@/lib/workbook";
import { rateLimit,requestIp } from "@/lib/rate-limit";

const bodySchema=z.object({data:z.record(z.unknown())});
export async function POST(req:Request,{params}:{params:Promise<{accessToken:string;dayNumber:string}>}){
  const {accessToken,dayNumber}=await params;
  if(!await rateLimit(`drink-reset-write:${requestIp(req)}`,120,60_000))return NextResponse.json({error:"儲存太頻繁，請稍候"},{status:429});
  const day=validDay(dayNumber),owner=await authorizeWorkbook(accessToken);
  if(!day||!owner)return NextResponse.json({error:"無法儲存這份紀錄"},{status:404});
  const parsed=bodySchema.safeParse(await req.json().catch(()=>null));
  if(!parsed.success)return NextResponse.json({error:"資料格式不正確"},{status:400});
  const entry=await prisma.drinkResetEntry.upsert({where:{accessToken_dayNumber:{accessToken,dayNumber:day}},update:{data:parsed.data.data as Prisma.InputJsonValue},create:{accessToken,dayNumber:day,data:parsed.data.data as Prisma.InputJsonValue,orderId:owner.orderId,customerId:owner.customerId},select:{dayNumber:true,isCompleted:true,updatedAt:true}});
  return NextResponse.json(entry);
}
