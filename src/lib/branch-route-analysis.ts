import {branchKeys,branchRoutes,branchTrialQuestions,normalizeBranchKey,type BranchKey} from "../content/branchRoutes";
export type BranchScore={prior:number;trial:number;total:number;evidence:string[];trialHits:number};
export type BranchAnalysis={recommendedBranch:BranchKey;secondaryBranch:BranchKey;selectedBranch:BranchKey;scores:Record<BranchKey,BranchScore>;confidence:"low"|"medium"|"high";summary:string;combinedPattern:string;primaryEvidence:string[];secondaryEvidence:string[];exclusiveAction:string};
const empty=()=>branchKeys.reduce((all,key)=>{all[key]={prior:1,trial:0,total:0,evidence:[],trialHits:0};return all},{} as Record<BranchKey,BranchScore>);
const add=(scores:Record<BranchKey,BranchScore>,key:BranchKey,points:number,evidence:string)=>{scores[key].prior+=points;scores[key].evidence.push(evidence)};
const list=(v:unknown)=>Array.isArray(v)?v.map(String):[];

export function analyzeBranchRoutes(input:{answers?:Record<string,string>;selectedBranch?:string},previous:Record<number,any>={},character:any={}):BranchAnalysis{
 const scores=empty(),type=String(character.primaryType||character.primaryOriginalTypeName||""),characterName=String(character.characterName||"");const l1=previous[1]||{},l2=previous[2]||{},l3=previous[3]||{};
 if(/sugary_drink|含糖飲料|飲料鍊金師/.test(type+characterName))add(scores,"drink_loop",3,"角色結果偏向含糖飲料依賴型");
 if(/fatigue_loss|nutrition_gap|疲憊|營養不足|能量騎士|補給守衛/.test(type+characterName))add(scores,"energy_refill",3,"角色結果偏向疲憊或營養補給型");
 if(/stress_release|compensation|壓力|委屈|壓力法師|療癒牧師/.test(type+characterName))add(scores,"stress_rescue",3,"角色結果偏向壓力或情緒補償型");
 if(/boredom_habit|無聊|習慣遊俠/.test(type+characterName))add(scores,"habit_break",3,"角色結果偏向固定習慣型");
 if(l1.highRiskTime==="下午 3～5 點")add(scores,"drink_loop",2,"第 1 關高風險時間是下午 3～5 點");
 if(["afternoonCrash","dinnerBeforeCrash"].includes(l1.timePatternType))add(scores,"energy_refill",2,`第 1 關呈現 ${l1.primaryResult||l1.timePatternType}`);
 if(Number(l1.sourceScores?.hunger)>=6)add(scores,"energy_refill",2,`第 1 關飢餓分數 ${l1.sourceScores.hunger}/10`);
 if(Number(l1.sourceScores?.stress)>=7)add(scores,"stress_rescue",2,`第 1 關壓力分數 ${l1.sourceScores.stress}/10`);
 const scenes=list(l2.highRiskScenes),tags=list(l2.tags);
 if(scenes.some(x=>["手搖飲店","超商"].includes(x)))add(scores,"drink_loop",2,`第 2 關場景包含 ${scenes.filter(x=>["手搖飲店","超商"].includes(x)).join("、")}`);
 if(l2.triggerType==="emotionalLoop")add(scores,"stress_rescue",2,"第 2 關偏向情緒安慰型");
 if(["habitLoop","environmentLoop"].includes(l2.triggerType))add(scores,"habit_break",2,`第 2 關偏向 ${l2.primaryResult||"場景習慣"}`);
 if(scenes.some(x=>["家裡沙發","追劇時","外送 App","超商"].includes(x)))add(scores,"habit_break",2,`高風險場景包含 ${scenes.filter(x=>["家裡沙發","追劇時","外送 App","超商"].includes(x)).join("、")}`);
 if(l3.decodedSignalType==="specificCraving"){add(scores,"drink_loop",2,"第 3 關為特定食物觸發");add(scores,"habit_break",2,"第 3 關為特定口感或習慣觸發")}
 if(["trueHunger","fatigueCraving"].includes(l3.decodedSignalType))add(scores,"energy_refill",2,`第 3 關偏向 ${l3.primaryResult||"飢餓疲憊訊號"}`);
 if(l3.decodedSignalType==="stressCraving")add(scores,"stress_rescue",2,"第 3 關偏向壓力型嘴饞");
 const answers=input.answers||{};for(const q of branchTrialQuestions){const option=q.options.find(x=>x.label===answers[String(q.id)]);if(option){scores[option.branch].trial+=option.points;scores[option.branch].trialHits++}}
 const priorMax=Math.max(...branchKeys.map(k=>scores[k].prior)),trialMax=19;for(const key of branchKeys)scores[key].total=Math.round(((scores[key].prior/Math.max(1,priorMax))*50+(scores[key].trial/trialMax)*50)*10)/10;
 const ranked=[...branchKeys].sort((a,b)=>scores[b].total-scores[a].total),recommendedBranch=ranked[0],secondaryBranch=ranked[1],selectedBranch=normalizeBranchKey(input.selectedBranch||recommendedBranch),answered=Object.keys(answers).length,confidence=answered<4?"low":answered<8?"medium":"high";
 const primary=branchRoutes[recommendedBranch],secondary=branchRoutes[secondaryBranch],combinedPattern=`${primary.name}＋${secondary.name}疊加型`,primaryEvidence=[...scores[recommendedBranch].evidence,`${answered} 題試煉中有 ${scores[recommendedBranch].trialHits} 題指向${primary.name}`].slice(0,4),secondaryEvidence=[...scores[secondaryBranch].evidence,`${scores[secondaryBranch].trialHits} 題試煉指向${secondary.name}`].slice(0,3);
 return {recommendedBranch,secondaryBranch,selectedBranch,scores,confidence,summary:confidence==="low"?"目前部分線索不足。完成 8 題情境試煉後，系統會把前三關與角色結果一起計算。":`目前主要路線偏向${primary.name}，次要線索為${secondary.name}。這不是對錯判定，而是找出最值得先處理的地方。`,combinedPattern,primaryEvidence,secondaryEvidence,exclusiveAction:branchRoutes[selectedBranch].exclusiveAction};
}
