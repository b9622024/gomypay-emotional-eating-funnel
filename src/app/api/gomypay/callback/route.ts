import { prisma } from "@/lib/db";
import { markPaid } from "@/lib/fulfillment";
import { callbackCheck, isSuccessfulPaymentResult, normalizePaymentPayload, safePayload } from "@/lib/gomypay";
import { rateLimit, requestIp } from "@/lib/rate-limit";

async function handleCallback(req:Request, raw:Record<string,string>) {
  if(!await rateLimit(`callback:${requestIp(req)}`,120,60_000))return new Response("rate limited",{status:429});

  const payload=safePayload(raw);
  const normalized=normalizePaymentPayload(raw);
  const orderNo=normalized.orderNo||"unknown";
  const order=normalized.orderNo?await prisma.order.findUnique({where:{orderNo:normalized.orderNo}}):null;
  const verified=callbackCheck(raw);
  const remoteAmount=Number(normalized.amount);
  const amountMatches=Boolean(order)&&Number.isFinite(remoteAmount)&&remoteAmount===order!.amount;
  const success=isSuccessfulPaymentResult(normalized.result);

  let message="verified";
  if(!verified)message="invalid str_check";
  else if(!order)message="order not found";
  else if(!amountMatches)message="amount mismatch";
  else if(!success)message=`payment failed: ${normalized.retMsg||"unknown"}`;

  await prisma.paymentLog.create({data:{orderNo,source:"callback",payload,isVerified:verified&&Boolean(order)&&amountMatches&&success,message}});
  if(!verified||!order||!amountMatches||!success)return new Response("OK",{status:200});

  await markPaid(orderNo,{gomypayOrderId:normalized.gomypayOrderId,avcode:normalized.avcode,cardLastNum:normalized.cardLastNum,payload,source:"callback"});
  return new Response("OK",{status:200});
}

export async function POST(req:Request){
  return handleCallback(req,Object.fromEntries(await req.formData()) as Record<string,string>);
}

export async function GET(req:Request){
  return handleCallback(req,Object.fromEntries(new URL(req.url).searchParams));
}
