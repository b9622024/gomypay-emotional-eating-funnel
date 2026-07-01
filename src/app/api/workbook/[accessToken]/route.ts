import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authorizeWorkbook } from "@/lib/workbook";
import { rateLimit,requestIp } from "@/lib/rate-limit";

export async function GET(req:Request,{params}:{params:Promise<{accessToken:string}>}){
  const {accessToken}=await params;
  if(!await rateLimit(`workbook-read:${requestIp(req)}`,60,60_000))return NextResponse.json({error:"請稍後再試"},{status:429});
  const owner=await authorizeWorkbook(accessToken);
  if(!owner)return NextResponse.json({error:"無權存取"},{status:404});
  const entries=await prisma.workbookEntry.findMany({where:{accessToken},orderBy:{dayNumber:"asc"},select:{dayNumber:true,data:true,isCompleted:true,completedAt:true,updatedAt:true}});
  return NextResponse.json({days:Array.from({length:7},(_,i)=>{const entry=entries.find(x=>x.dayNumber===i+1);return {dayNumber:i+1,data:entry?.data??{},isCompleted:entry?.isCompleted??false,completedAt:entry?.completedAt??null,updatedAt:entry?.updatedAt??null}})});
}
