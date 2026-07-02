import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { authorizeWorkbook } from "@/lib/workbook";
import { rateLimit,requestIp } from "@/lib/rate-limit";
const body=z.object({favoriteCategory:z.enum(["我的甜食替換","我的鹹食替換","我的飲料替換","我的晚上嘴饞備案","我的外送備案"]),title:z.string().trim().min(1).max(150),content:z.string().trim().min(1).max(1000)});
export async function POST(req:Request,{params}:{params:Promise<{accessToken:string}>}){const {accessToken}=await params;if(!await rateLimit(`swap-favorite:${requestIp(req)}`,60,60_000))return NextResponse.json({error:"操作太頻繁，請稍候"},{status:429});if(!await authorizeWorkbook(accessToken))return NextResponse.json({error:"無法收藏這個選項"},{status:404});const parsed=body.safeParse(await req.json().catch(()=>null));if(!parsed.success)return NextResponse.json({error:"收藏資料不正確"},{status:400});const existing=await prisma.safeSwapFavorite.findFirst({where:{accessToken,favoriteCategory:parsed.data.favoriteCategory,title:parsed.data.title}});if(existing)return NextResponse.json({favorite:existing,message:"這個選項已在常用清單"});const favorite=await prisma.safeSwapFavorite.create({data:{...parsed.data,accessToken},select:{id:true,favoriteCategory:true,title:true,content:true,createdAt:true}});return NextResponse.json({favorite,message:"✓ 已加入我的常用安全清單"},{status:201});}
