import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authorizeWorkbook } from "@/lib/workbook";
import { rateLimit,requestIp } from "@/lib/rate-limit";
import { buildTriggerSummary,type TriggerEntry } from "@/content/cravingTriggerAnalysis";
export async function GET(req:Request,{params}:{params:Promise<{accessToken:string}>}){const {accessToken}=await params;if(!await rateLimit(`trigger-summary:${requestIp(req)}`,60,60_000))return NextResponse.json({error:"請稍後再試"},{status:429});if(!await authorizeWorkbook(accessToken))return NextResponse.json({error:"這個工具包連結無效或尚未開通"},{status:404});const entries=await prisma.cravingTriggerEntry.findMany({where:{accessToken}});const serialized=entries.map(entry=>({...entry,occurredAt:entry.occurredAt?.toISOString(),createdAt:entry.createdAt.toISOString(),updatedAt:entry.updatedAt.toISOString(),afterFeeling:Array.isArray(entry.afterFeeling)?entry.afterFeeling as string[]:[],triggerTypes:Array.isArray(entry.triggerTypes)?entry.triggerTypes as string[]:[]}));return NextResponse.json({summary:buildTriggerSummary(serialized as TriggerEntry[])})}
