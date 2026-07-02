import { randomInt } from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { rateLimit,requestIp } from "@/lib/rate-limit";

const AI_CODE="ai_energy_assessment";
function newOrderNo(){const d=new Date(),p=(n:number)=>String(n).padStart(2,"0");return `AI${p(d.getFullYear()%100)}${p(d.getMonth()+1)}${p(d.getDate())}${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}${String(randomInt(10000)).padStart(4,"0")}`}

export async function POST(req:Request){
  try{
    if(!await rateLimit(`ai-order:${requestIp(req)}`,5,60_000))return NextResponse.json({error:"請稍後再試"},{status:429});
    const body=await req.json() as {accessToken?:unknown};
    if(typeof body.accessToken!=="string"||body.accessToken.length<20||body.accessToken.length>200)return NextResponse.json({error:"存取連結無效"},{status:400});
    const entitlement=await prisma.entitlement.findUnique({where:{accessToken:body.accessToken},include:{order:{include:{entitlements:true,customer:true}}}});
    if(!entitlement||entitlement.order.status!=="paid"||!entitlement.order.entitlements.some(item=>item.productCode==="emotional_eating_reset_7d"))return NextResponse.json({error:"找不到有效的主商品購買紀錄"},{status:403});
    const alreadyOwned=await prisma.entitlement.findFirst({where:{customerId:entitlement.order.customerId,productCode:AI_CODE,order:{status:"paid"}},select:{id:true}});
    if(alreadyOwned)return NextResponse.json({error:"你已經擁有 AI 能量減脂初評，請直接聯絡我們領取"},{status:409});
    const pending=await prisma.order.findFirst({where:{customerId:entitlement.order.customerId,status:"pending",items:{some:{productCode:AI_CODE,price:100}}},orderBy:{createdAt:"desc"},select:{orderNo:true,amount:true}});
    if(pending)return NextResponse.json({...pending,status:"pending",paymentRequired:true});
    const product=await prisma.product.findUnique({where:{code:AI_CODE}});
    if(!product?.isActive)return NextResponse.json({error:"商品目前暫停購買"},{status:400});
    const order=await prisma.order.create({data:{orderNo:newOrderNo(),customerId:entitlement.order.customerId,amount:100,buyerMemo:"AI 能量減脂初評（單獨購買）",items:{create:{productCode:AI_CODE,name:product.name,price:100,quantity:1}}},select:{orderNo:true,amount:true}});
    return NextResponse.json({...order,status:"pending",paymentRequired:true},{status:201});
  }catch(error){return NextResponse.json({error:error instanceof Error?error.message:"目前無法建立訂單"},{status:400})}
}
