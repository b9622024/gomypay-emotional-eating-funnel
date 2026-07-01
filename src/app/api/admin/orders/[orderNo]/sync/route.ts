import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { queryEndpoint, safePayload } from "@/lib/gomypay";
import { markPaid } from "@/lib/fulfillment";
import { rateLimit, requestIp } from "@/lib/rate-limit";
function parse(text:string):Record<string,string>{try{const value=JSON.parse(text) as Record<string,unknown>;return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,String(v??"")]))}catch{const form=Object.fromEntries(new URLSearchParams(text));return Object.keys(form).length?form:{raw:text}}}
export async function POST(req:Request,{params}:{params:Promise<{orderNo:string}>}){const {orderNo}=await params;
 if(!process.env.ADMIN_SECRET||req.headers.get("x-admin-secret")!==process.env.ADMIN_SECRET)return NextResponse.json({error:"unauthorized"},{status:401});
 if(!await rateLimit(`admin-sync:${requestIp(req)}`,15,60_000))return NextResponse.json({error:"rate limited"},{status:429});
 const order=await prisma.order.findUnique({where:{orderNo}});if(!order)return NextResponse.json({error:"not found"},{status:404});
 const body=new URLSearchParams({Order_No:orderNo,CustomerId:process.env.GOMYPAY_CUSTOMER_ID||"",Str_Check:process.env.GOMYPAY_STR_CHECK||""});
 try{const response=await fetch(queryEndpoint(),{method:"POST",headers:{"content-type":"application/x-www-form-urlencoded"},body,cache:"no-store"});const raw=parse(await response.text()) as Record<string,string>;const payload=safePayload(raw);const success=raw.pay_result==="1"||raw.result==="1";const remoteAmount=Number(raw.e_money||raw.Amount||raw.amount);const amountMatches=Number.isFinite(remoteAmount)&&remoteAmount===order.amount;const orderMatches=raw.e_orderno===orderNo;const verified=success&&amountMatches&&orderMatches;
  await prisma.paymentLog.create({data:{orderNo,source:"query",payload,isVerified:verified,message:verified?"query confirmed paid":!orderMatches?"query order mismatch":success?"query amount mismatch":"query not paid"}});
  if(verified)await markPaid(orderNo,{gomypayOrderId:raw.OrderID,avcode:raw.avcode,cardLastNum:undefined,payload,source:"query"});
  return NextResponse.json({orderNo,paid:verified,status:(await prisma.order.findUnique({where:{orderNo},select:{status:true}}))?.status});
 }catch(e){await prisma.paymentLog.create({data:{orderNo,source:"query",payload:{},isVerified:false,message:e instanceof Error?e.message:"query failed"}});return NextResponse.json({error:"sync failed"},{status:502});}}
