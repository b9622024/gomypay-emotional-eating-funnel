import {dinnerSceneById,type DinnerScene} from "../content/dinnerSceneConfig";
import {normalizeBranchKey,type BranchKey} from "../content/branchRoutes";

export type DinnerSelection=Record<string,string|string[]>;
export type DinnerBackup={id:string;name:string;scenarioType:string;dinnerScene:string;selections:DinnerSelection;analysisResult:DinnerAnalysis;score:number;createdAt:string};
export type DinnerPriorityProfile={primaryPriority:"protein"|"vegetable"|"carb"|"drink";secondaryPriority:"protein"|"vegetable"|"carb"|"drink";riskPattern:string;warningTags:string[];hungerScore:number;fatigueScore:number;nutritionScore:number;nutritionGapTypes:string[];lateMeal:boolean;selectedBranch:BranchKey;highRiskScenes:string[]};
export type DinnerAnalysis={totalScore:number;structureScore:number;personalFitScore:number;strengths:string[];vulnerabilities:string[];crossLevelInsights:string[];sceneSpecificRisks:string[];branchFit:{branch:BranchKey;score:number;insight:string};minimalUpgrade:{label:string;groupId:string;option:string;reason:string}|null;upgradedScore:number;analysisSummary:string;normalized:{protein:number;vegetable:number;carb:number;drink:number}};

const list=(value:unknown)=>Array.isArray(value)?value.map(String):value?String(value).split(",").filter(Boolean):[];
const value=(selection:DinnerSelection,key:string)=>selection[key];
const has=(selection:DinnerSelection,key:string)=>list(value(selection,key)).length>0;
const one=(selection:DinnerSelection,key:string)=>list(value(selection,key))[0]||"";
const clamp=(n:number,min=0,max=100)=>Math.max(min,Math.min(max,n));

export function buildDinnerPriorityProfile(previousResults:Record<number,any>={},current?:{hungerScore?:number;lateMeal?:boolean}):DinnerPriorityProfile{
 const l1=previousResults[1]||{},l2=previousResults[2]||{},l3=previousResults[3]||{},l4=previousResults[4]||{},l5=previousResults[5]||{};
 const hungerScore=Number(current?.hungerScore??l1.sourceScores?.hunger??l1.hungerScore??l1.input?.hungerScore??5),fatigueScore=Number(l1.sourceScores?.fatigue??l1.fatigueScore??l1.input?.fatigueScore??5),nutritionScore=Number(l5.totalNutritionScore??l5.score??10);
 const nutritionGapTypes=list(l5.nutritionGapTypes||l5.tags),pattern=String(l1.timePatternType||l1.primaryResult||""),signal=String(l3.decodedSignalType||"");
 const weights={protein:0,vegetable:0,carb:0,drink:0};
 if(nutritionGapTypes.some(x=>/protein|breakfast|lunch|蛋白|早餐|午餐/.test(x)))weights.protein+=4;
 if(nutritionGapTypes.some(x=>/hydration|water|水/.test(x)))weights.drink+=3;
 if(pattern.includes("dinnerBeforeCrash")||hungerScore>=7||nutritionScore<=5)weights.carb+=4;
 if(signal.includes("trueHunger")||signal.includes("fatigue")){weights.protein+=2;weights.carb+=2}
 weights.vegetable+=1;
 const ranked=(Object.entries(weights) as [keyof typeof weights,number][]).sort((a,b)=>b[1]-a[1]);
 const warningTags:string[]=[];
 if(pattern.includes("dinnerBeforeCrash")||hungerScore>=7)warningTags.push("晚餐前爆餓");
 if(fatigueScore>=7)warningTags.push("下午疲憊");
 if(nutritionScore<=6)warningTags.push("白天補給不足");
 if(weights.protein>=4)warningTags.push("蛋白質不足");
 if(weights.drink>=3)warningTags.push("水分不足");
 const selectedBranch=normalizeBranchKey(l4.selectedBranch),highRiskScenes=list(l2.highRiskScenes);
 if(selectedBranch==="drink_loop")warningTags.push("晚餐飲料迴路");if(selectedBranch==="stress_rescue")warningTags.push("壓力點餐風險");if(selectedBranch==="habit_break")warningTags.push("場景習慣迴路");
 return {primaryPriority:ranked[0][0],secondaryPriority:ranked[1][0],riskPattern:pattern||signal||"目前線索仍在累積",warningTags:[...new Set(warningTags)],hungerScore,fatigueScore,nutritionScore,nutritionGapTypes,lateMeal:Boolean(current?.lateMeal),selectedBranch,highRiskScenes};
}

export function normalizeSceneSelection(sceneId:string,selections:DinnerSelection){
 const scene=dinnerSceneById[sceneId];let protein=0,vegetable=0,carb=0,drink=0;
 if(!scene)return {protein,vegetable,carb,drink};
 const proteinKeys=["protein","mainProtein","proteinBoost"],vegetableKeys=["vegetable","vegetableAmount","vegetableBoost"],carbKeys=["carb","carbAmount"],drinkChoice=one(selections,"drink");
 if(proteinKeys.some(k=>has(selections,k)))protein=2;
 if(sceneId==="breakfast_shop"&&["蛋餅","漢堡"].includes(one(selections,"main")))protein=Math.max(protein,1);
 if(sceneId==="noodle_shop"&&one(selections,"main")==="餛飩湯")protein=Math.max(protein,1);
 const veg=vegetableKeys.flatMap(k=>list(value(selections,k)));
 if(veg.some(x=>/[23] 格|3 格以上|2 樣|3 樣以上|吃完整份|青菜兩份|沙拉|燙青菜|菜盤|蔬菜盒/.test(x)))vegetable=2;else if(veg.length||veg.some(x=>/1 格|1 樣|吃一半/.test(x)))vegetable=1;
 if(carbKeys.some(k=>has(selections,k))||["蛋餅","吐司","漢堡","饅頭","蘿蔔糕","鐵板麵","湯麵","乾麵","米粉","冬粉","水餃"].includes(one(selections,"main")))carb=2;
 if(carbKeys.some(k=>one(selections,k)==="不吃"))carb=0;
 if(["水","無糖茶","無糖豆漿","無糖拿鐵","氣泡水","黑咖啡","無糖汽水","不加購飲料"].includes(drinkChoice))drink=2;else if(["湯","豆漿","咖啡","紅茶"].includes(drinkChoice))drink=1;else if(drinkChoice)drink=0;
 return {protein,vegetable,carb,drink};
}

export function calculateDinnerStructureScore(normalized:{protein:number;vegetable:number;carb:number;drink:number},profile:DinnerPriorityProfile){
 const protein=Math.round(normalized.protein/2*20),vegetable=Math.round(normalized.vegetable/2*15);
 const carbNeeded=profile.hungerScore>=7||profile.nutritionScore<=6||profile.riskPattern.includes("dinnerBeforeCrash");
 const carbOptional=profile.hungerScore<=3&&profile.nutritionScore>=8;
 const carb=carbNeeded?Math.round(normalized.carb/2*15):carbOptional?(normalized.carb?12:15):Math.round(normalized.carb/2*15);
 const drink=Math.round(normalized.drink/2*10);
 return {protein,vegetable,carbFit:carb,drink,total:protein+vegetable+carb+drink};
}

export function analyzeSceneSpecificRisks(scene:DinnerScene,selections:DinnerSelection){
 const selected=Object.values(selections).flatMap(list),risks:string[]=[];
 for(const risk of scene.riskRules)if(selected.some(x=>x.includes(risk)||risk.includes(x)))risks.push(risk);
 if(scene.id==="hotpot"&&["麻辣","牛奶","酸菜白肉"].includes(one(selections,"soupBase")))risks.push("湯底口味較重，建議少喝湯");
 if(scene.id==="breakfast_shop"&&["奶茶","紅茶"].includes(one(selections,"drink")))risks.push("飲料甜度需另外確認");
 if(scene.id==="noodle_shop"&&!has(selections,"proteinBoost"))risks.push("主餐以麵為主，蛋白質可能不足");
 return [...new Set(risks)];
}

export function calculatePersonalFitScore(normalized:{protein:number;vegetable:number;carb:number;drink:number},profile:DinnerPriorityProfile,sceneRisks:string[]){
 const carbNeeded=profile.hungerScore>=7||profile.nutritionScore<=6||profile.riskPattern.includes("dinnerBeforeCrash");
 const hungerFit=carbNeeded?Math.round((normalized.protein+normalized.carb)/4*10):profile.hungerScore<=3?10:Math.round((normalized.protein+normalized.carb)/4*10);
 const priorityValue=normalized[profile.primaryPriority],secondaryValue=normalized[profile.secondaryPriority];
 const nutritionGapFit=Math.round((priorityValue*.65+secondaryValue*.35)/2*10);
 const cravingPatternFit=profile.selectedBranch==="drink_loop"?normalized.drink*5:profile.selectedBranch==="energy_refill"?Math.round((normalized.protein+normalized.carb)/4*10):profile.selectedBranch==="stress_rescue"?clamp(10-sceneRisks.length*2,0,10):profile.highRiskScenes.length?clamp(10-sceneRisks.length*2,0,10):Math.round((normalized.protein+normalized.vegetable)/4*10);
 const sceneRiskFit=clamp(10-sceneRisks.length*2,0,10);
 return {hungerFit,nutritionGapFit,cravingPatternFit,sceneRiskFit,total:hungerFit+nutritionGapFit+cravingPatternFit+sceneRiskFit};
}

function bestUpgrade(scene:DinnerScene,normalized:ReturnType<typeof normalizeSceneSelection>,profile:DinnerPriorityProfile):DinnerAnalysis["minimalUpgrade"]{
 const missing=(profile.hungerScore>=7||profile.nutritionScore<=6)&&normalized.carb===0?"carb":normalized[profile.primaryPriority]<2?profile.primaryPriority:normalized.protein<2?"protein":normalized.vegetable<1?"vegetable":normalized.drink<2?"drink":null;
 if(!missing)return null;
 const groupMap:Record<string,string[]>= {protein:["protein","mainProtein","proteinBoost"],vegetable:["vegetable","vegetableAmount","vegetableBoost"],carb:["carb","carbAmount","main"],drink:["drink"]};
 const group=scene.foodGroups.find(g=>groupMap[missing].includes(g.id));if(!group)return null;
 const preferred:Record<string,string[]>={protein:["雞胸","加蛋","滷蛋","豆腐","雞肉"],vegetable:["沙拉","2 格","燙青菜","高麗菜","吃完整份","2 樣"],carb:["飯糰","地瓜","半碗","白飯","冬粉"],drink:["水","無糖茶","無糖豆漿"]};
 const option=preferred[missing].find(p=>group.options.some(x=>x.includes(p)))||group.options.find(x=>x!=="不吃")||group.options[0];
 const labels={protein:"補一份蛋白質",vegetable:"補一份蔬菜",carb:`加入${option}`,drink:`改成${option}`};
 const reasons={protein:"提高晚餐後的飽足穩定度",vegetable:"補足體積感與蔬菜缺口",carb:"你目前飢餓或白天補給不足，適量主食能降低吃完又找食物的機率",drink:"先穩住飲料，避免甜度與加購讓嘴饞延續"};
 return {label:labels[missing],groupId:group.id,option,reason:reasons[missing]};
}

export function generateDinnerAnalysis(sceneId:string,selections:DinnerSelection,profile:DinnerPriorityProfile):DinnerAnalysis{
 const scene=dinnerSceneById[sceneId],normalized=normalizeSceneSelection(sceneId,selections);
 if(!scene)return {totalScore:0,structureScore:0,personalFitScore:0,strengths:[],vulnerabilities:["尚未選擇晚餐場景"],crossLevelInsights:[],sceneSpecificRisks:[],branchFit:{branch:profile.selectedBranch,score:0,insight:"尚未選擇餐點"},minimalUpgrade:null,upgradedScore:0,analysisSummary:"目前線索不足，請先選擇場景與餐點。",normalized};
 const structure=calculateDinnerStructureScore(normalized,profile),sceneSpecificRisks=analyzeSceneSpecificRisks(scene,selections),fit=calculatePersonalFitScore(normalized,profile,sceneSpecificRisks),totalScore=clamp(structure.total+fit.total);
 const strengths=[normalized.protein===2&&"蛋白質足夠",normalized.vegetable===2&&"蔬菜份量相對完整",normalized.drink===2&&"飲料選擇穩定",normalized.carb>0&&"保留適量主食"].filter(Boolean) as string[];
 const selectedValues=Object.values(selections).flatMap(list),sweetOrReward=selectedValues.some(x=>/含糖|甜點|套餐加大|第二份|炸物/.test(x));
 const branchInsights:Record<BranchKey,string>={drink_loop:normalized.drink===2?"飲料迴路支線：這餐已用無糖飲穩住配餐飲料。":"飲料迴路支線：晚餐飲料仍可能延續想甜與配餐習慣。",energy_refill:normalized.protein>0&&normalized.carb>0?"能量補給支線：蛋白質與主食能接住白天補給缺口。":"能量補給支線：蛋白質或主食仍有缺口。",stress_rescue:sweetOrReward?"壓力止損支線：這份餐出現犒賞型加購，建議先確認是不是把晚餐當成情緒出口。":"壓力止損支線：目前沒有明顯的犒賞型堆疊。",habit_break:profile.highRiskScenes.some(x=>scene.name.includes(x)||x.includes(scene.name))?`習慣破解支線：${scene.name}和前面的高風險場景重疊。`:"習慣破解支線：目前場景沒有和已知高風險場景明顯重疊。"};
 const branchFitScore=profile.selectedBranch==="drink_loop"?normalized.drink*5:profile.selectedBranch==="energy_refill"?Math.round((normalized.protein+normalized.carb)/4*10):profile.selectedBranch==="stress_rescue"?(sweetOrReward?4:10):(profile.highRiskScenes.some(x=>scene.name.includes(x)||x.includes(scene.name))?5:10);
 const vulnerabilities=[normalized.protein===0&&"蛋白質不足，飽足感可能不穩",normalized.vegetable===0&&"蔬菜與體積感不足",normalized.carb===0&&(profile.hungerScore>=7||profile.nutritionScore<=6)&&"以目前高飢餓或白天補給不足來說，主食偏少",normalized.drink===0&&"飲料可能延續甜味與嘴饞",profile.selectedBranch==="stress_rescue"&&sweetOrReward&&"餐點含有較多犒賞型加購",...sceneSpecificRisks].filter(Boolean) as string[];
 const crossLevelInsights=[profile.riskPattern.includes("dinnerBeforeCrash")&&"第 1 關顯示你偏向晚餐前爆餓",profile.fatigueScore>=7&&"前面線索顯示下午疲憊感偏高",profile.nutritionScore<=6&&`第 5 關營養補洞分數偏低（${profile.nutritionScore}/10）`,profile.warningTags.includes("蛋白質不足")&&"前五關顯示蛋白質是優先補洞項目",branchInsights[profile.selectedBranch]].filter(Boolean) as string[];
 const minimalUpgrade=bestUpgrade(scene,normalized,profile);
 let upgradedScore=totalScore;
 if(minimalUpgrade){const next={...selections,[minimalUpgrade.groupId]:scene.foodGroups.find(g=>g.id===minimalUpgrade.groupId)?.multiple?[...list(selections[minimalUpgrade.groupId]),minimalUpgrade.option]:minimalUpgrade.option};const nextN=normalizeSceneSelection(sceneId,next),nextS=calculateDinnerStructureScore(nextN,profile),nextF=calculatePersonalFitScore(nextN,profile,analyzeSceneSpecificRisks(scene,next));upgradedScore=clamp(nextS.total+nextF.total)}
 const analysisSummary=totalScore>=80?"這份晚餐與你目前的飢餓、營養缺口和場景相對適配，可以保存成固定備案。":totalScore>=60?"這份晚餐已有基礎防線；完成一個最小升級後，會更符合你今天的狀態。":"餐點看起來可能不差，但和你目前的飢餓或前五關線索仍有落差，建議先補最關鍵的一項。";
 return {totalScore,structureScore:structure.total,personalFitScore:fit.total,strengths,vulnerabilities,crossLevelInsights,sceneSpecificRisks,branchFit:{branch:profile.selectedBranch,score:branchFitScore,insight:branchInsights[profile.selectedBranch]},minimalUpgrade,upgradedScore,analysisSummary,normalized};
}

export function generateMinimalUpgrade(sceneId:string,selections:DinnerSelection,profile:DinnerPriorityProfile){return generateDinnerAnalysis(sceneId,selections,profile).minimalUpgrade}

export function generateBackupVariations(sceneId:string,selections:DinnerSelection,profile:DinnerPriorityProfile){
 const scene=dinnerSceneById[sceneId];if(!scene)return [];
 const clone=(changes:DinnerSelection,name:string,scenarioType:string)=>{const next={...selections,...changes},analysis=generateDinnerAnalysis(sceneId,next,profile);return {id:crypto.randomUUID(),name,scenarioType,dinnerScene:sceneId,selections:next,analysisResult:analysis,score:analysis.totalScore,createdAt:new Date().toISOString()} satisfies DinnerBackup};
 const proteinGroup=scene.foodGroups.find(g=>["protein","mainProtein","proteinBoost"].includes(g.id)),carbGroup=scene.foodGroups.find(g=>["carb","carbAmount"].includes(g.id)),drinkGroup=scene.foodGroups.find(g=>g.id==="drink");
 const quick:DinnerSelection={},hungry:DinnerSelection={},minimum:DinnerSelection={};
 if(proteinGroup){quick[proteinGroup.id]=proteinGroup.options.slice(0,proteinGroup.multiple?1:1);hungry[proteinGroup.id]=proteinGroup.options.slice(0,proteinGroup.multiple?2:1);minimum[proteinGroup.id]=proteinGroup.options[0]}
 if(carbGroup){quick[carbGroup.id]=carbGroup.options.find(x=>!/不吃/.test(x))||carbGroup.options[0];hungry[carbGroup.id]=carbGroup.options.find(x=>/正常|飯糰|地瓜|白飯|一碗/.test(x))||carbGroup.options[0]}
 if(drinkGroup){const stable=drinkGroup.options.find(x=>/水|無糖/.test(x))||drinkGroup.options[0];quick.drink=stable;hungry.drink=stable;minimum.drink=stable}
 return [clone(quick,"最省事版","quick"),clone(hungry,"很餓版","hungry"),clone(minimum,"最低限度版","minimum")];
}
