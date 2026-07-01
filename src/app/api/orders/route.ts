import { NextResponse } from "next/server";
import { randomInt } from "crypto";
import { prisma } from "@/lib/db";
import { orderSchema, MAIN, BUMPS, OTO } from "@/lib/validation";
import { rateLimit, requestIp } from "@/lib/rate-limit";
const allowed=new Set<string>([MAIN,...BUMPS,OTO]);
function orderNo(){const d=new Date(),p=(n:number)=>String(n).padStart(2,"0");return `EE${p(d.getFullYear()%100)}${p(d.getMonth()+1)}${p(d.getDate())}${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}${String(randomInt(10000)).padStart(4,"0")}`;}
export async function POST(req:Request){
 try{
  if(!await rateLimit(`orders:${requestIp(req)}`,8,60_000))return NextResponse.json({error:"請稍後再試"},{status:429});
  const input=orderSchema.parse(await req.json()); const codes=[...new Set(input.productCodes)];
  if(codes.some(c=>!allowed.has(c)))return NextResponse.json({error:"商品不正確"},{status:400});
  const isOto=codes.length===1&&codes[0]===OTO; if(!isOto&&(!codes.includes(MAIN)||codes.includes(OTO)))return NextResponse.json({error:"加購品不可單獨購買"},{status:400});
  const products=await prisma.product.findMany({where:{code:{in:codes},isActive:true}}); if(products.length!==codes.length)return NextResponse.json({error:"商品目前無法購買"},{status:400});
  const amount=products.reduce((n,p)=>n+p.price,0), memo=products.map(p=>p.name).join("、").slice(0,500);
  const order=await prisma.order.create({data:{orderNo:orderNo(),amount,buyerMemo:memo,customer:{create:{name:input.name,email:input.email,phone:input.phone,lineId:input.lineId||null}},items:{create:products.map(p=>({productCode:p.code,name:p.name,price:p.price,quantity:1}))}},select:{orderNo:true,amount:true}});
  return NextResponse.json(order,{status:201});
 }catch(e){return NextResponse.json({error:e instanceof Error?e.message:"無法建立訂單"},{status:400});}
}
