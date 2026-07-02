import { prisma } from "./db";

export async function resolveAiAssessmentAccess(accessToken?:string){
  if(!accessToken||accessToken.length<20||accessToken.length>200)return {valid:false,owned:false,customerId:null};
  const entitlement=await prisma.entitlement.findUnique({where:{accessToken},include:{order:true}});
  if(!entitlement||entitlement.order.status!=="paid")return {valid:false,owned:false,customerId:null};
  const owned=Boolean(await prisma.entitlement.findFirst({where:{customerId:entitlement.customerId,productCode:"ai_energy_assessment",order:{status:"paid"}},select:{id:true}}));
  return {valid:true,owned,customerId:entitlement.customerId};
}
