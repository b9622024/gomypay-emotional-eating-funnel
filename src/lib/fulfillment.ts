import { randomBytes } from "crypto";
import { prisma } from "./db";
import { emailService } from "./email";

export async function markPaid(orderNo:string, meta:{gomypayOrderId?:string;avcode?:string;cardLastNum?:string;payload:Record<string,string>;source:"callback"|"query"}) {
  const transitioned = await prisma.$transaction(async tx => {
    const order=await tx.order.findUnique({where:{orderNo},include:{items:true,customer:true}});
    if (!order) return null;
    if (order.status === "paid") return {order, fresh:false};
    if (order.status !== "pending") return null;
    const changed=await tx.order.updateMany({where:{id:order.id,status:"pending"},data:{status:"paid",paidAt:new Date(),gomypayOrderId:meta.gomypayOrderId,avcode:meta.avcode,cardLastNum:meta.cardLastNum,rawCallbackPayload:meta.source==="callback"?meta.payload:undefined}});
    if (changed.count !== 1) return {order, fresh:false};
    for (const item of order.items) await tx.entitlement.upsert({where:{orderId_productCode:{orderId:order.id,productCode:item.productCode}},update:{},create:{orderId:order.id,customerId:order.customerId,productCode:item.productCode,accessToken:randomBytes(32).toString("base64url"),downloadUrl:"#"}});
    return {order, fresh:true};
  });
  if (transitioned?.fresh) {
    const access=await prisma.entitlement.findFirst({where:{orderId:transitioned.order.id}});
    const url=`${process.env.APP_BASE_URL}/access/${access?.accessToken}`;
    try { await emailService.send({to:transitioned.order.customer.email,subject:"你的下班後嘴饞止損包已準備好",body:`感謝購買。請由此取得數位產品：${url}`}); } catch { /* EmailLog 已保留失敗狀態，付款開通不回滾 */ }
  }
  return transitioned;
}
