import { Prisma } from "@prisma/client";import { NextResponse } from "next/server";import { z } from "zod";import { prisma } from "@/lib/db";import { authorizeProductAccess } from "@/lib/workbook";import { eatingOutContent as c,getEatingOutPlan } from "@/content/eatingOutMenu";
const body=z.object({dayNumber:z.number().int().min(1).max(7),eatingOutScene:z.enum(c.scenes),currentStates:z.array(z.enum(c.states)).min(1)}),select={id:true,dayNumber:true,eatingOutScene:true,currentStates:true,recommendedMeal:true,dinnerSatisfactionScore:true,afterDinnerCravingScore:true,hadSugaryDrink:true,didClosingRoutine:true,mainAdjustmentNeeded:true,notes:true,createdAt:true,updatedAt:true} as const;
export async function GET(_:Request,{params}:{params:Promise<{accessToken:string}>}){
  const {accessToken}=await params;
  if(!await authorizeProductAccess(accessToken,"anti_binge_meal_plan_7d"))return NextResponse.json({error:c.invalid},{status:404});
  const [logs,favorites]=await Promise.all([
    prisma.eatingOutMenuLog.findMany({where:{accessToken},orderBy:{createdAt:"desc"},take:30,select}),
    prisma.eatingOutMenuFavorite.findMany({where:{accessToken},orderBy:{createdAt:"desc"}})
  ]);
  return NextResponse.json({logs,favorites});
}
export async function POST(req:Request,{params}:{params:Promise<{accessToken:string}>}){const {accessToken}=await params;if(!await authorizeProductAccess(accessToken,"anti_binge_meal_plan_7d"))return NextResponse.json({error:c.invalid},{status:404});const p=body.safeParse(await req.json().catch(()=>null));if(!p.success)return NextResponse.json({error:"請完成今天、場景與狀態"},{status:400});const recommendedMeal=getEatingOutPlan(p.data.eatingOutScene,p.data.dayNumber);const log=await prisma.eatingOutMenuLog.create({data:{...p.data,currentStates:p.data.currentStates as Prisma.InputJsonValue,recommendedMeal:recommendedMeal as unknown as Prisma.InputJsonValue,accessToken},select});return NextResponse.json({log},{status:201})}
