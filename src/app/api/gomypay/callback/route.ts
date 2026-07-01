import { prisma } from "@/lib/db";
import { callbackCheck, safePayload } from "@/lib/gomypay";
import { markPaid } from "@/lib/fulfillment";
import { rateLimit, requestIp } from "@/lib/rate-limit";
export async function POST(req:Request){
 const raw=Object.fromEntries(await req.formData()) as Record<string,string>, payload=safePayload(raw), orderNo=raw.e_orderno||"unknown";
 if(!await rateLimit(`callback:${requestIp(req)}`,120,60_000))return new Response("rate limited",{status:429});
 const order=await prisma.order.findUnique({where:{orderNo}}), verified=callbackCheck(raw);
 let message="verified";
 if(!verified)message="invalid str_check"; else if(!order)message="order not found"; else if(Number(raw.e_money)!==order.amount)message="amount mismatch"; else if(raw.result!=="1")message=`payment failed: ${raw.ret_msg||"unknown"}`;
 await prisma.paymentLog.create({data:{orderNo,source:"callback",payload,isVerified:verified&&message==="verified",message}});
 if(!verified||!order||Number(raw.e_money)!==order.amount||raw.result!=="1")return new Response("OK",{status:200});
 await markPaid(orderNo,{gomypayOrderId:raw.OrderID,avcode:raw.avcode,cardLastNum:raw.CardLastNum,payload,source:"callback"});
 return new Response("OK",{status:200});
}
