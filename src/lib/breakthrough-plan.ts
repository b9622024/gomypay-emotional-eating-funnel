import {Prisma} from "@prisma/client";
import {prisma} from "./db";
import {authorizeWorkbook} from "./workbook";
import {branches,levels,recommendation} from "@/content/breakthroughPlan";
import {quizType} from "@/content/emotionalEatingQuiz";
const array=(v:unknown)=>Array.isArray(v)?v:[];

export async function getBreakthroughState(accessToken:string){
  const owner=await authorizeWorkbook(accessToken);if(!owner)return null;
  const quiz=await prisma.quizResult.findUnique({where:{accessToken_quizType:{accessToken,quizType}},select:{primaryType:true,secondaryType:true}}),profile=recommendation(quiz?.primaryType);
  let progress=await prisma.breakthroughPlanProgress.upsert({where:{accessToken},update:{primaryType:quiz?.primaryType??null,secondaryType:quiz?.secondaryType??null,recommendedRoute:profile?.route??null},create:{accessToken,completedLevels:[],collectedClues:[],earnedBadges:[],primaryType:quiz?.primaryType??null,secondaryType:quiz?.secondaryType??null,recommendedRoute:profile?.route??null,selectedBranch:profile?.branch??null}});
  const entries=await prisma.breakthroughDailyEntry.findMany({where:{accessToken},orderBy:{levelNumber:"asc"}});
  const [three,rescue,dinner,drink,ownsDrinkPro,ownsMenu]=await Promise.all([
    prisma.threeMinuteCheckIn.count({where:{accessToken}}),prisma.cravingRescueSession.count({where:{accessToken,completedAt:{not:null}}}),prisma.dinnerFormulaEntry.count({where:{accessToken,fullnessAfterDinner:{not:null}}}),prisma.drinkResetEntry.count({where:{accessToken,isCompleted:true}}),prisma.entitlement.count({where:{customerId:owner.customerId,productCode:"sugary_drink_swap_pro",order:{status:"paid"}}}),prisma.entitlement.count({where:{customerId:owner.customerId,productCode:"anti_binge_meal_plan_7d",order:{status:"paid"}}})
  ]);
  const completed=array(progress.completedLevels).map(Number),currentLevel=completed.length>=7?7:completed.length?Math.min(7,Math.max(...completed)+1):1,base=entries.filter(x=>x.completed).reduce((s,x)=>s+x.actionPointsEarned,0),bonus=(three?5:0)+(rescue?10:0)+(dinner?10:0)+(drink?5:0),actionPoints=base+bonus;
  if(progress.currentLevel!==currentLevel||progress.actionPoints!==actionPoints)progress=await prisma.breakthroughPlanProgress.update({where:{accessToken},data:{currentLevel,actionPoints}});
  const map=await prisma.personalRescueMap.findUnique({where:{accessToken}});
  return {owner,quiz,profile,progress:{...progress,completedLevels:completed,collectedClues:array(progress.collectedClues),earnedBadges:array(progress.earnedBadges)},entries,map,bonuses:{threeMinute:three>0,rescue:rescue>0,dinner:dinner>0,drink:drink>0},ownsDrinkPro:Boolean(ownsDrinkPro),ownsMenu:Boolean(ownsMenu)};
}

export async function completeBreakthroughLevel(accessToken:string,input:{levelNumber:number;userNotes?:string;selectedBranch?:keyof typeof branches;map?:Record<string,unknown>}){
  const state=await getBreakthroughState(accessToken);if(!state)throw new Error("無權存取");const level=levels[input.levelNumber-1];if(!level)throw new Error("關卡不存在");if(input.levelNumber===1&&!state.quiz)throw new Error("請先完成情緒性進食 6 型測驗");if(input.levelNumber>state.progress.currentLevel)throw new Error("請先完成前一關");
  const branch=input.selectedBranch??(state.progress.selectedBranch as keyof typeof branches)??state.profile?.branch??"swap",chosen=input.levelNumber===4?branches[branch]:null,clues=chosen?[...chosen.clues]:[...level.clues],badge=level.badge,points=level.points;
  await prisma.$transaction(async tx=>{
    await tx.breakthroughDailyEntry.upsert({where:{accessToken_levelNumber:{accessToken,levelNumber:input.levelNumber}},update:{completed:true,collectedClue:clues as Prisma.InputJsonValue,earnedBadge:badge,actionPointsEarned:points,userNotes:input.userNotes||null,completedAt:new Date(),selectedTool:chosen?.tool??level.tool},create:{accessToken,levelNumber:input.levelNumber,levelName:level.name,taskName:level.task,selectedTool:chosen?.tool??level.tool,completed:true,collectedClue:clues as Prisma.InputJsonValue,earnedBadge:badge,actionPointsEarned:points,userNotes:input.userNotes||null,completedAt:new Date()}});
    const completed=[...new Set([...state.progress.completedLevels,input.levelNumber])].sort((a,b)=>a-b),allClues=[...new Set([...state.progress.collectedClues.map(String),...clues])],badges=[...new Set([...state.progress.earnedBadges.map(String),badge])];
    await tx.breakthroughPlanProgress.update({where:{accessToken},data:{completedLevels:completed as Prisma.InputJsonValue,collectedClues:allClues as Prisma.InputJsonValue,earnedBadges:badges as Prisma.InputJsonValue,selectedBranch:branch,currentLevel:completed.length>=7?7:Math.min(7,input.levelNumber+1)}});
    if(input.levelNumber===7&&input.map){const m=input.map as any,data={primaryType:state.quiz?.primaryType??"unknown",secondaryType:state.quiz?.secondaryType??null,recommendedRoute:state.profile?.route??"自選路線",highRiskTime:m.highRiskTime||null,highRiskScene:m.highRiskScene||null,mainEmotion:m.mainEmotion||null,nutritionGap:m.nutritionGap||null,highRiskDrinkOrSnack:m.highRiskDrinkOrSnack||null,safeSwapOptions:(m.safeSwapOptions??[]) as Prisma.InputJsonValue,dinnerBackups:(m.dinnerBackups??[]) as Prisma.InputJsonValue,rescuePlan:m.rescuePlan||null,nextWeekAction:m.nextWeekAction||null,generatedAt:new Date()};await tx.personalRescueMap.upsert({where:{accessToken},update:data,create:{accessToken,...data}})}
  });
  return getBreakthroughState(accessToken);
}
