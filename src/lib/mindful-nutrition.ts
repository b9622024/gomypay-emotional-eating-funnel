import { prisma } from "@/lib/db";
import { buildMindfulNutritionSummary,type NutritionDayState } from "@/content/mindfulNutritionTracker";

export async function nutritionSummary(accessToken:string){const entries=await prisma.mindfulNutritionEntry.findMany({where:{accessToken},orderBy:{dayNumber:"asc"},select:{dayNumber:true,data:true,isCompleted:true,completedAt:true}});const days:Record<number,NutritionDayState>={};entries.forEach(x=>days[x.dayNumber]={data:x.data as Record<string,unknown>,isCompleted:x.isCompleted,completedAt:x.completedAt?.toISOString()??null});return buildMindfulNutritionSummary(days)}
