import { prisma } from "@/lib/db";
import { markPaid } from "@/lib/fulfillment";
import { callbackCheck, isSuccessfulPaymentResult, normalizePaymentPayload, safePayload } from "@/lib/gomypay";
import ReturnStatus from "./ReturnStatus";

export default async function ReturnPage({searchParams}:{searchParams:Promise<Record<string,string>>}) {
  const p=await searchParams;
  const normalized=normalizePaymentPayload(p);
  const orderNo=normalized.orderNo||p.orderNo||"";
  const payload=safePayload(p);
  const order=orderNo?await prisma.order.findUnique({where:{orderNo}}):null;
  let initial=order?.status;

  if(orderNo){
    const verified=callbackCheck(p);
    const remoteAmount=Number(normalized.amount);
    const amountMatches=Boolean(order)&&Number.isFinite(remoteAmount)&&remoteAmount===order!.amount;
    const success=isSuccessfulPaymentResult(normalized.result);
    const canFulfill=Boolean(order)&&order!.status==="pending"&&verified&&amountMatches&&success;
    const message=canFulfill
      ? "Browser return verified; order marked paid"
      : verified
        ? !order
          ? "Browser return verified but order not found"
          : !amountMatches
            ? "Browser return verified but amount mismatch"
            : success
              ? "Browser return recorded; order already processed"
              : `Browser return payment failed: ${normalized.retMsg||"unknown"}`
        : "Browser return recorded; waiting for callback or query";

    await prisma.$transaction([
      prisma.paymentLog.create({data:{orderNo,source:"return",payload,isVerified:canFulfill,message}}),
      ...(order?[prisma.order.update({where:{orderNo},data:{rawReturnPayload:payload}})]:[])
    ]);

    if(canFulfill){
      await markPaid(orderNo,{gomypayOrderId:normalized.gomypayOrderId,avcode:normalized.avcode,cardLastNum:normalized.cardLastNum,payload,source:"return"});
      initial="paid";
    }
  }

  return <main className="section"><div className="container narrow"><h1 className="title">付款結果</h1>{order?<ReturnStatus orderNo={orderNo} initial={initial||order.status}/>:<div className="card"><h2>找不到訂單</h2><p>請保留付款資訊並聯絡客服協助確認。</p></div>}</div></main>;
}
