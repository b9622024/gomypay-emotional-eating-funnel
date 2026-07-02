import { NextResponse } from "next/server";
import { authorizeWorkbook } from "@/lib/workbook";
import { rateLimit,requestIp } from "@/lib/rate-limit";
import { nutritionSummary } from "@/lib/mindful-nutrition";
export async function GET(req:Request,{params}:{params:Promise<{accessToken:string}>}){const {accessToken}=await params;if(!await rateLimit(`nutrition-summary:${requestIp(req)}`,60,60_000))return NextResponse.json({error:"請稍後再試"},{status:429});if(!await authorizeWorkbook(accessToken))return NextResponse.json({error:"無法取得這份結果"},{status:404});return NextResponse.json({summary:await nutritionSummary(accessToken)});}
