import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { authorizeWorkbook } from "@/lib/workbook";
import { rateLimit, requestIp } from "@/lib/rate-limit";

const body=z.object({selectedGender:z.enum(["female","male"])});
export async function GET(req:Request,{params}:{params:Promise<{accessToken:string}>}){
  const {accessToken}=await params;
  if(!await rateLimit(`character-r:${requestIp(req)}`,60,60000))return NextResponse.json({error:"請稍後再試"},{status:429});
  if(!await authorizeWorkbook(accessToken))return NextResponse.json({error:"無權存取"},{status:404});
  const progress=await prisma.breakthroughPlanProgress.findUnique({where:{accessToken},select:{selectedGender:true,characterCreated:true}});
  return NextResponse.json(progress??{selectedGender:null,characterCreated:false});
}
export async function POST(req:Request,{params}:{params:Promise<{accessToken:string}>}){
  const {accessToken}=await params;
  if(!await rateLimit(`character-w:${requestIp(req)}`,20,60000))return NextResponse.json({error:"請稍後再試"},{status:429});
  if(!await authorizeWorkbook(accessToken))return NextResponse.json({error:"無權存取"},{status:404});
  const parsed=body.safeParse(await req.json().catch(()=>null));
  if(!parsed.success)return NextResponse.json({error:"請先選擇女性或男性角色"},{status:400});
  const progress=await prisma.breakthroughPlanProgress.upsert({where:{accessToken},update:{selectedGender:parsed.data.selectedGender},create:{accessToken,selectedGender:parsed.data.selectedGender,completedLevels:[],collectedClues:[],earnedBadges:[]}});
  return NextResponse.json({selectedGender:progress.selectedGender});
}
