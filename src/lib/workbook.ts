import { prisma } from "./db";

export async function authorizeWorkbook(accessToken:string){
  if(!accessToken||accessToken.length>200)return null;
  const entitlement=await prisma.entitlement.findUnique({
    where:{accessToken},
    include:{order:{include:{entitlements:true}}}
  });
  if(!entitlement||entitlement.order.status!=="paid")return null;
  const ownsMain=entitlement.order.entitlements.some(item=>item.productCode==="emotional_eating_reset_7d");
  if(!ownsMain)return null;
  const ownsAiAssessment=Boolean(await prisma.entitlement.findFirst({where:{customerId:entitlement.order.customerId,productCode:"ai_energy_assessment",order:{status:"paid"}},select:{id:true}}));
  return {orderId:entitlement.order.id,customerId:entitlement.order.customerId,ownsAiAssessment};
}

export function validDay(value:string|number){
  const day=Number(value);
  return Number.isInteger(day)&&day>=1&&day<=7?day:null;
}
