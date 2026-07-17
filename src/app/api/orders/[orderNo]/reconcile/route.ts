import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { markPaid } from "@/lib/fulfillment";
import { normalizePaymentPayload, queryEndpoint, safePayload } from "@/lib/gomypay";
import { rateLimit, requestIp } from "@/lib/rate-limit";

function parseGatewayResponse(text:string):Record<string,string>{
  try{
    const value=JSON.parse(text) as Record<string,unknown>;
    return Object.fromEntries(Object.entries(value).map(([key,value])=>[key,String(value??"")]));
  }catch{
    const form=Object.fromEntries(new URLSearchParams(text));
    return Object.keys(form).length?form:{raw:text};
  }
}

export async function POST(req:Request,{params}:{params:Promise<{orderNo:string}>}) {
  const {orderNo}=await params;
  if(!await rateLimit(`reconcile:${requestIp(req)}:${orderNo}`,6,60_000))return NextResponse.json({error:"too many requests"},{status:429});

  const order=await prisma.order.findUnique({where:{orderNo}});
  if(!order)return NextResponse.json({error:"not found"},{status:404});
  if(order.status==="paid")return NextResponse.json({orderNo,status:"paid",paid:true});

  const body=new URLSearchParams({Order_No:orderNo,CustomerId:process.env.GOMYPAY_CUSTOMER_ID||"",Str_Check:process.env.GOMYPAY_STR_CHECK||""});
  try{
    const response=await fetch(queryEndpoint(),{method:"POST",headers:{"content-type":"application/x-www-form-urlencoded"},body,cache:"no-store"});
    const raw=parseGatewayResponse(await response.text());
    const normalized=normalizePaymentPayload(raw);
    const payload=safePayload(raw);
    const success=normalized.result==="1";
    const remoteAmount=Number(normalized.amount);
    const amountMatches=Number.isFinite(remoteAmount)&&remoteAmount===order.amount;
    const orderMatches=normalized.orderNo===orderNo;
    const verified=success&&amountMatches&&orderMatches;

    await prisma.paymentLog.create({data:{orderNo,source:"query",payload,isVerified:verified,message:verified?"return-page query confirmed paid":!orderMatches?"return-page query order mismatch":success?"return-page query amount mismatch":"return-page query not paid"}});
    if(verified)await markPaid(orderNo,{gomypayOrderId:normalized.gomypayOrderId,avcode:normalized.avcode,cardLastNum:normalized.cardLastNum,payload,source:"query"});

    const fresh=await prisma.order.findUnique({where:{orderNo},select:{status:true}});
    return NextResponse.json({orderNo,paid:verified,status:fresh?.status});
  }catch(error){
    await prisma.paymentLog.create({data:{orderNo,source:"query",payload:{},isVerified:false,message:error instanceof Error?error.message:"return-page query failed"}});
    return NextResponse.json({error:"sync failed"},{status:502});
  }
}
