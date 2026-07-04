import {NextResponse} from "next/server";
import {prisma} from "@/lib/db";
import {authorizeProductAccess} from "@/lib/workbook";
export async function DELETE(_:Request,{params}:{params:Promise<{accessToken:string;favoriteId:string}>}){const {accessToken,favoriteId}=await params;if(!await authorizeProductAccess(accessToken,"sugary_drink_swap_pro"))return NextResponse.json({error:"無權存取"},{status:404});const item=await prisma.drinkSwapProFavorite.findFirst({where:{id:favoriteId,accessToken},select:{id:true}});if(!item)return NextResponse.json({error:"找不到收藏"},{status:404});await prisma.drinkSwapProFavorite.delete({where:{id:item.id}});return NextResponse.json({message:"收藏已移除"})}
