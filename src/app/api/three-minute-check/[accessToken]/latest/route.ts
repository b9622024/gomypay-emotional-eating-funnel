import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { rateLimit,requestIp } from "@/lib/rate-limit";
import { authorizeWorkbook } from "@/lib/workbook";

export async function GET(req:Request,{params}:{params:Promise<{accessToken:string}>}){
  const {accessToken}=await params;
  if(!await rateLimit(`three-minute-latest:${requestIp(req)}`,60,60_000))return NextResponse.json({error:"請稍後再試"},{status:429});
  if(!await authorizeWorkbook(accessToken))return NextResponse.json({error:"這個工具包連結無效或尚未開通"},{status:404});
  const record=await prisma.threeMinuteCheckIn.findFirst({where:{accessToken},orderBy:{createdAt:"desc"}});
  return NextResponse.json({record});
}
