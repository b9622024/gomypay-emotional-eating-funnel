import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { emotionalEatingQuestions,calculateQuizResult,quizType } from "@/content/emotionalEatingQuiz";
import { prisma } from "@/lib/db";
import { rateLimit,requestIp } from "@/lib/rate-limit";
import { authorizeWorkbook } from "@/lib/workbook";

const answerSchema=z.record(z.string(),z.number().int().min(0).max(3));

export async function GET(req:Request,{params}:{params:Promise<{accessToken:string}>}){
  const {accessToken}=await params;
  if(!await rateLimit(`quiz-read:${requestIp(req)}`,60,60_000))return NextResponse.json({error:"請稍後再試"},{status:429});
  if(!await authorizeWorkbook(accessToken))return NextResponse.json({error:"無權存取"},{status:404});
  const result=await prisma.quizResult.findUnique({where:{accessToken_quizType:{accessToken,quizType}},select:{answers:true,scores:true,primaryType:true,secondaryType:true,updatedAt:true}});
  return NextResponse.json({result});
}

export async function POST(req:Request,{params}:{params:Promise<{accessToken:string}>}){
  const {accessToken}=await params;
  if(!await rateLimit(`quiz-write:${requestIp(req)}`,12,60_000))return NextResponse.json({error:"儲存太頻繁，請稍候"},{status:429});
  const owner=await authorizeWorkbook(accessToken);
  if(!owner)return NextResponse.json({error:"無權存取"},{status:404});
  const parsed=answerSchema.safeParse((await req.json().catch(()=>null))?.answers);
  if(!parsed.success)return NextResponse.json({error:"答案格式不正確"},{status:400});
  const expected=emotionalEatingQuestions.map(question=>String(question.id));
  if(expected.some(id=>parsed.data[id]===undefined)||Object.keys(parsed.data).some(id=>!expected.includes(id)))return NextResponse.json({error:"請完成全部 24 題"},{status:400});
  const calculated=calculateQuizResult(parsed.data);
  const data={answers:parsed.data as Prisma.InputJsonValue,scores:calculated.scores as Prisma.InputJsonValue,primaryType:calculated.primaryTypes.join(","),secondaryType:calculated.secondaryTypes.join(",")||null};
  const result=await prisma.quizResult.upsert({where:{accessToken_quizType:{accessToken,quizType}},update:data,create:{accessToken,quizType,orderId:owner.orderId,customerId:owner.customerId,...data},select:{answers:true,scores:true,primaryType:true,secondaryType:true,updatedAt:true}});
  return NextResponse.json({result});
}
