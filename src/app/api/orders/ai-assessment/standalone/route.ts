import { randomInt } from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { rateLimit,requestIp } from "@/lib/rate-limit";
import { orderSchema } from "@/lib/validation";

const customerSchema=orderSchema.pick({name:true,email:true,phone:true,lineId:true});
function newOrderNo(){const d=new Date(),p=(n:number)=>String(n).padStart(2,"0");return `AI${p(d.getFullYear()%100)}${p(d.getMonth()+1)}${p(d.getDate())}${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}${String(randomInt(10000)).padStart(4,"0")}`}

export async function POST(req:Request){
  try{
    if(!await rateLimit(`ai-standalone:${requestIp(req)}`,5,60_000))return NextResponse.json({error:"請稍後再試"},{status:429});
    const input=customerSchema.parse(await req.json());
    const product=await prisma.product.findUnique({where:{code:"ai_energy_assessment"}});
    if(!product?.isActive)return NextResponse.json({error:"商品目前暫停購買"},{status:400});
    const order=await prisma.order.create({data:{orderNo:newOrderNo(),amount:100,buyerMemo:"AI 能量科學減脂測驗（獨立加購）",customer:{create:{name:input.name,email:input.email,phone:input.phone,lineId:input.lineId||null}},items:{create:{productCode:product.code,name:product.name,price:100,quantity:1}}},select:{orderNo:true,amount:true}});
    return NextResponse.json({...order,status:"pending",paymentRequired:true},{status:201});
  }catch(error){return NextResponse.json({error:error instanceof Error?error.message:"目前無法建立訂單"},{status:400})}
}
