import {Prisma} from "@prisma/client";
import {prisma} from "./db";
import {authorizeWorkbook} from "./workbook";
import {branches,levels,recommendation,validateBreakthroughLevel} from "@/content/breakthroughPlan";
import {analyzeBreakthroughLevel,generatePersonalRescueMap} from "@/lib/breakthrough-analysis";
import {quizType} from "@/content/emotionalEatingQuiz";
import {getCravingCharacter} from "@/content/cravingCharacters";
import {buildDinnerPriorityProfile,generateDinnerAnalysis} from "@/lib/dinner-defense-analysis";
import {analyzeBranchRoutes} from "@/lib/branch-route-analysis";
import {normalizeBranchKey,type BranchKey} from "@/content/branchRoutes";
const array=(v:unknown)=>Array.isArray(v)?v:[];

export async function getBreakthroughState(accessToken:string){
  const owner=await authorizeWorkbook(accessToken);if(!owner)return null;
  const [quiz,existingProgress]=await Promise.all([prisma.quizResult.findUnique({where:{accessToken_quizType:{accessToken,quizType}},select:{primaryType:true,secondaryType:true,createdAt:true}}),prisma.breakthroughPlanProgress.findUnique({where:{accessToken},select:{selectedGender:true}})]),profile=recommendation(quiz?.primaryType),primaryCharacter=getCravingCharacter(quiz?.primaryType),secondaryCharacter=getCravingCharacter(quiz?.secondaryType),characterCreated=Boolean(quiz&&existingProgress?.selectedGender);
  const characterData={primaryType:quiz?.primaryType??null,secondaryType:quiz?.secondaryType??null,recommendedRoute:profile?.route??null,characterCreated,characterCreatedAt:quiz?.createdAt??null,primaryCharacterName:primaryCharacter?.characterName??null,primaryOriginalTypeName:primaryCharacter?.originalTypeName??null,secondaryCharacterName:secondaryCharacter?.characterName??null,secondaryOriginalTypeName:secondaryCharacter?.originalTypeName??null};
  let progress=await prisma.breakthroughPlanProgress.upsert({where:{accessToken},update:characterData,create:{accessToken,completedLevels:[],collectedClues:[],earnedBadges:[],...characterData,selectedBranch:profile?.branch??null}});
  const earnedBefore=array(progress.earnedBadges).map(String);
  if(characterCreated&&!earnedBefore.includes("角色創建徽章"))progress=await prisma.breakthroughPlanProgress.update({where:{accessToken},data:{earnedBadges:["角色創建徽章",...earnedBefore] as Prisma.InputJsonValue}});
  const entries=await prisma.breakthroughDailyEntry.findMany({where:{accessToken},orderBy:{levelNumber:"asc"}});
  const [three,rescue,dinner,drink,ownsDrinkPro,ownsMenu]=await Promise.all([
    prisma.threeMinuteCheckIn.count({where:{accessToken}}),prisma.cravingRescueSession.count({where:{accessToken,completedAt:{not:null}}}),prisma.dinnerFormulaEntry.count({where:{accessToken,fullnessAfterDinner:{not:null}}}),prisma.drinkResetEntry.count({where:{accessToken,isCompleted:true}}),prisma.entitlement.count({where:{customerId:owner.customerId,productCode:"sugary_drink_swap_pro",order:{status:"paid"}}}),prisma.entitlement.count({where:{customerId:owner.customerId,productCode:"anti_binge_meal_plan_7d",order:{status:"paid"}}})
  ]);
  const completed=array(progress.completedLevels).map(Number),currentLevel=completed.length>=7?7:completed.length?Math.min(7,Math.max(...completed)+1):1,base=entries.filter(x=>x.completed).reduce((s,x)=>s+x.actionPointsEarned,0),bonus=(three?5:0)+(rescue?10:0)+(dinner?10:0)+(drink?5:0),actionPoints=base+bonus;
  if(progress.currentLevel!==currentLevel||progress.actionPoints!==actionPoints)progress=await prisma.breakthroughPlanProgress.update({where:{accessToken},data:{currentLevel,actionPoints}});
  const map=await prisma.personalRescueMap.findUnique({where:{accessToken}});
  return {owner,quiz,profile,characters:{primary:primaryCharacter,secondary:secondaryCharacter},progress:{...progress,completedLevels:completed,collectedClues:array(progress.collectedClues),earnedBadges:array(progress.earnedBadges)},entries,map,bonuses:{threeMinute:three>0,rescue:rescue>0,dinner:dinner>0,drink:drink>0},ownsDrinkPro:Boolean(ownsDrinkPro),ownsMenu:Boolean(ownsMenu)};
}

export async function completeBreakthroughLevel(accessToken:string,input:{levelNumber:number;userNotes?:string;selectedBranch?:BranchKey;userInputs?:Record<string,unknown>;map?:Record<string,unknown>}){
  const owner=await authorizeWorkbook(accessToken);if(!owner)throw new Error("無權存取");const [progressRaw,quiz]=await Promise.all([prisma.breakthroughPlanProgress.findUnique({where:{accessToken}}),prisma.quizResult.findUnique({where:{accessToken_quizType:{accessToken,quizType}},select:{primaryType:true,secondaryType:true}})]);if(!progressRaw)throw new Error("破關進度不存在");const profile=recommendation(quiz?.primaryType),state={progress:{...progressRaw,completedLevels:array(progressRaw.completedLevels).map(Number),collectedClues:array(progressRaw.collectedClues),earnedBadges:array(progressRaw.earnedBadges)},quiz,profile,characters:{primary:getCravingCharacter(quiz?.primaryType),secondary:getCravingCharacter(quiz?.secondaryType)}};const level=levels[input.levelNumber-1];if(!level)throw new Error("關卡不存在");if(!state.progress.characterCreated)throw new Error("請先完成第 0 天角色創建");if(input.levelNumber>state.progress.currentLevel)throw new Error("請先完成前一關");
  const validationError=validateBreakthroughLevel(input.levelNumber,input.userInputs,input.map);if(validationError)throw new Error(validationError);
  const branch=normalizeBranchKey(input.selectedBranch??state.progress.selectedBranch??state.profile?.branch),chosen=input.levelNumber===4?branches[branch]:null,clues=chosen?[...chosen.clues]:[...level.clues],badge=level.badge,points=level.points;
  const previousEntries=await prisma.breakthroughDailyEntry.findMany({where:{accessToken,levelNumber:{lt:input.levelNumber},completed:true},select:{levelNumber:true,analysisResult:true}}),previousResults=Object.fromEntries(previousEntries.map(entry=>[entry.levelNumber,entry.analysisResult||{}]));
  const analysisInput:Record<string,unknown>={...(input.userInputs??{}),selectedBranch:branch},characterResult={primaryType:quiz?.primaryType,secondaryType:quiz?.secondaryType,primaryOriginalTypeName:state.characters.primary?.originalTypeName};
  const structuredAnalysis=input.levelNumber===7
    ?generatePersonalRescueMap(previousResults,characterResult,input.map??analysisInput)
    :input.levelNumber===4
      ?analyzeBranchRoutes({answers:(analysisInput.answers||{}) as Record<string,string>,selectedBranch:branch},previousResults,{...characterResult,characterName:state.characters.primary?.characterName})
    :input.levelNumber===6
      ?generateDinnerAnalysis(String(analysisInput.dinnerSceneId||""),(analysisInput.selections||{}) as Record<string,string|string[]>,buildDinnerPriorityProfile(previousResults,{hungerScore:typeof analysisInput.currentHungerScore==="number"?analysisInput.currentHungerScore:undefined}))
      :analyzeBreakthroughLevel(input.levelNumber,analysisInput,previousResults,characterResult);
  await prisma.$transaction(async tx=>{
    const analysisResult=structuredAnalysis as Prisma.InputJsonValue;
    await tx.breakthroughDailyEntry.upsert({where:{accessToken_levelNumber:{accessToken,levelNumber:input.levelNumber}},update:{completed:true,collectedClue:clues as Prisma.InputJsonValue,earnedBadge:badge,actionPointsEarned:points,userNotes:input.userNotes||null,userInputs:(input.userInputs??{}) as Prisma.InputJsonValue,analysisResult,selectedBranch:input.levelNumber===4?branch:null,completedAt:new Date(),selectedTool:chosen?.tool??level.tool},create:{accessToken,levelNumber:input.levelNumber,levelName:level.name,taskName:level.task,selectedTool:chosen?.tool??level.tool,selectedBranch:input.levelNumber===4?branch:null,completed:true,collectedClue:clues as Prisma.InputJsonValue,earnedBadge:badge,actionPointsEarned:points,userNotes:input.userNotes||null,userInputs:(input.userInputs??{}) as Prisma.InputJsonValue,analysisResult,completedAt:new Date()}});
    const completed=[...new Set([...state.progress.completedLevels,input.levelNumber])].sort((a,b)=>a-b),allClues=[...new Set([...state.progress.collectedClues.map(String),...clues])],badges=[...new Set([...state.progress.earnedBadges.map(String),badge])];
    await tx.breakthroughPlanProgress.update({where:{accessToken},data:{completedLevels:completed as Prisma.InputJsonValue,collectedClues:allClues as Prisma.InputJsonValue,earnedBadges:badges as Prisma.InputJsonValue,selectedBranch:branch,currentLevel:completed.length>=7?7:Math.min(7,input.levelNumber+1)}});
    if(input.levelNumber===7&&input.map){const m=input.map as any,a=structuredAnalysis as any,finalBranch=normalizeBranchKey(state.progress.selectedBranch),data={primaryType:state.quiz?.primaryType??"unknown",secondaryType:state.quiz?.secondaryType??null,recommendedRoute:branches[finalBranch].name,primaryCharacterName:state.characters.primary?.characterName??null,primaryOriginalTypeName:state.characters.primary?.originalTypeName??null,secondaryCharacterName:state.characters.secondary?.characterName??null,secondaryOriginalTypeName:state.characters.secondary?.originalTypeName??null,highRiskTime:a.keyRiskMoment||m.highRiskTime||null,highRiskScene:a.keyRiskScene||m.highRiskScene||null,mainEmotion:a.mainTriggerMechanism||m.mainEmotion||null,bodySignal:m.bodySignal||null,selectedBranch:finalBranch,nutritionGap:a.biggestNutritionGap||m.nutritionGap||null,highRiskDrinkOrSnack:m.highRiskDrinkOrSnack||null,safeSwapOptions:(m.safeSwapOptions??[]) as Prisma.InputJsonValue,dinnerBackups:(m.dinnerBackups??[]) as Prisma.InputJsonValue,rescuePlan:a.personalRescueMapSummary||m.rescuePlan||null,firstRescueAction:a.branchExclusiveAction||a.firstRescueAction||m.firstRescueAction||null,nextWeekAction:a.nextWeekMission||m.nextWeekAction||null,rewardUnlocked:true,rewardUnlockedAt:new Date(),generatedAt:new Date()};await tx.personalRescueMap.upsert({where:{accessToken},update:data,create:{accessToken,...data}})}
  });
  return {ok:true,levelNumber:input.levelNumber,badge,clues,analysisResult:structuredAnalysis,mapUnlocked:input.levelNumber===7};
}

export async function resetBreakthroughFromLevel(accessToken:string,fromLevel=1){
  const state=await getBreakthroughState(accessToken);if(!state)throw new Error("無權存取");
  if(fromLevel===0){
    await prisma.$transaction([
      prisma.breakthroughDailyEntry.deleteMany({where:{accessToken}}),
      prisma.personalRescueMap.deleteMany({where:{accessToken}}),
      prisma.quizResult.deleteMany({where:{accessToken,quizType}}),
      prisma.breakthroughPlanProgress.update({where:{accessToken},data:{currentLevel:1,completedLevels:[] as Prisma.InputJsonValue,collectedClues:[] as Prisma.InputJsonValue,earnedBadges:[] as Prisma.InputJsonValue,actionPoints:0,primaryType:null,secondaryType:null,recommendedRoute:null,selectedBranch:null,characterCreated:false,characterCreatedAt:null,selectedGender:null,primaryCharacterName:null,primaryOriginalTypeName:null,secondaryCharacterName:null,secondaryOriginalTypeName:null}})
    ]);
    return {ok:true,currentLevel:0,characterCreated:false};
  }
  const retained=state.entries.filter(entry=>entry.levelNumber<fromLevel&&entry.completed),completed=retained.map(entry=>entry.levelNumber),clues=[...new Set(retained.flatMap(entry=>array(entry.collectedClue).map(String)))],badges=["角色創建徽章",...retained.map(entry=>entry.earnedBadge)];
  await prisma.$transaction([prisma.breakthroughDailyEntry.deleteMany({where:{accessToken,levelNumber:{gte:fromLevel}}}),prisma.personalRescueMap.deleteMany({where:{accessToken}}),prisma.breakthroughPlanProgress.update({where:{accessToken},data:{currentLevel:Math.max(1,fromLevel),completedLevels:completed as Prisma.InputJsonValue,collectedClues:clues as Prisma.InputJsonValue,earnedBadges:[...new Set(badges)] as Prisma.InputJsonValue,actionPoints:retained.reduce((sum,entry)=>sum+entry.actionPointsEarned,0)}})]);
  return {ok:true,currentLevel:Math.max(1,fromLevel)};
}
