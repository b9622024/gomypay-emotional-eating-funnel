import {NextResponse} from "next/server";
import {z} from "zod";
import {prisma} from "@/lib/db";
import {authorizeProductAccess} from "@/lib/workbook";
const body=z.object({drinkId:z.string(),favoriteCategory:z.string().max(50),title:z.string().max(150),content:z.string().max(1000),orderScript:z.string().max(300),context:z.string().max(30),originalVersion:z.string().max(300),currentVersion:z.string().max(300),note:z.string().max(500).optional()});
export async function POST(req:Request,{params}:{params:Promise<{accessToken:string}>}){const {accessToken}=await params;if(!await authorizeProductAccess(accessToken,"sugary_drink_swap_pro"))return NextResponse.json({error:"無權存取"},{status:404});const p=body.safeParse(await req.json().catch(()=>null));if(!p.success)return NextResponse.json({error:"收藏資料不正確"},{status:400});const old=await prisma.drinkSwapProFavorite.findFirst({where:{accessToken,drinkId:p.data.drinkId,context:p.data.context}});const favorite=old?await prisma.drinkSwapProFavorite.update({where:{id:old.id},data:p.data}):await prisma.drinkSwapProFavorite.create({data:{...p.data,accessToken}});return NextResponse.json({favorite,message:old?"✓ 收藏已更新":"✓ 已加入我的常喝收藏"})}
