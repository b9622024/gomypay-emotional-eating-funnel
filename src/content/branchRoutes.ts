export type BranchKey="drink_loop"|"energy_refill"|"stress_rescue"|"habit_break";
export type BranchRoute={key:BranchKey;name:string;tool:string;path:string;description:string;exclusiveAction:string;clues:string[];badge:string};
export const branchRoutes:Record<BranchKey,BranchRoute>={
 drink_loop:{key:"drink_loop",name:"飲料迴路",tool:"7 天含糖飲料重置表",path:"drink-reset",description:"手搖飲、甜咖啡、配餐飲料或下午固定飲料迴路。",exclusiveAction:"下一杯先降一階",clues:["飲料迴路線索"],badge:"專屬支線徽章"},
 energy_refill:{key:"energy_refill",name:"能量補給",tool:"正念營養缺口掃描",path:"mindful-nutrition-tracker",description:"太餓、太累、白天吃不夠或晚餐前爆餓。",exclusiveAction:"下午先補一次蛋白質或主食",clues:["能量補給線索"],badge:"專屬支線徽章"},
 stress_rescue:{key:"stress_rescue",name:"壓力止損",tool:"10 分鐘嘴饞急救流程卡",path:"craving-rescue",description:"壓力、委屈、情緒補償、犒賞或用食物放鬆。",exclusiveAction:"嘴饞前先停 3 分鐘",clues:["壓力止損線索"],badge:"專屬支線徽章"},
 habit_break:{key:"habit_break",name:"習慣破解",tool:"安全零食與飲料替換清單",path:"safe-swap-list",description:"固定時間、追劇、沙發、外送 App 或零食環境。",exclusiveAction:"改變一個高風險場景",clues:["習慣破解線索"],badge:"專屬支線徽章"}
};
export const branchKeys=Object.keys(branchRoutes) as BranchKey[];
export const legacyBranchMap:Record<string,BranchKey>={drink:"drink_loop",nutrition:"energy_refill",stress:"stress_rescue",swap:"habit_break",drink_loop:"drink_loop",energy_refill:"energy_refill",stress_rescue:"stress_rescue",habit_break:"habit_break"};
export function normalizeBranchKey(value:unknown):BranchKey{return legacyBranchMap[String(value||"")]||"habit_break"}

export type BranchTrialQuestion={id:number;question:string;options:Array<{label:string;branch:BranchKey;points:number}>};
export const branchTrialQuestions:BranchTrialQuestion[]=[
 {id:1,question:"下午 4 點，你突然很想買飲料或吃東西。最接近你的狀況是：",options:[{label:"我真的需要提神",branch:"energy_refill",points:2},{label:"今天太累了，想犒賞自己",branch:"stress_rescue",points:2},{label:"這個時間本來就會想喝東西",branch:"habit_break",points:2},{label:"我腦中直接出現某一杯飲料",branch:"drink_loop",points:2}]},
 {id:2,question:"壓力很大時，你最常出現哪種反應？",options:[{label:"買一杯飲料當獎勵",branch:"drink_loop",points:2},{label:"找甜食或大吃一頓",branch:"stress_rescue",points:2},{label:"忙到忘記吃，晚點爆餓",branch:"energy_refill",points:2},{label:"打開外送 App 或走向零食櫃",branch:"habit_break",points:2}]},
 {id:3,question:"晚餐後還想吃東西時，最常是：",options:[{label:"想喝甜的",branch:"drink_loop",points:2},{label:"身體其實還很餓",branch:"energy_refill",points:2},{label:"想讓自己舒服或放鬆",branch:"stress_rescue",points:2},{label:"坐到固定位置就自然想吃",branch:"habit_break",points:2}]},
 {id:4,question:"假日時最容易發生：",options:[{label:"手搖飲變成固定行程",branch:"drink_loop",points:2},{label:"三餐時間亂掉，晚上很餓",branch:"energy_refill",points:2},{label:"覺得辛苦一週，應該犒賞自己",branch:"stress_rescue",points:2},{label:"追劇時一直找東西吃",branch:"habit_break",points:2}]},
 {id:5,question:"很餓的時候，你最常：",options:[{label:"先買含糖飲料頂著",branch:"drink_loop",points:2},{label:"看到什麼就吃什麼",branch:"energy_refill",points:2},{label:"覺得煩躁，很難停下來",branch:"stress_rescue",points:2},{label:"固定去同一家店買同樣的東西",branch:"habit_break",points:2}]},
 {id:6,question:"以下哪個問題最困擾你？",options:[{label:"飲料很難戒",branch:"drink_loop",points:3},{label:"晚上常常餓到失控",branch:"energy_refill",points:3},{label:"壓力或情緒來的時候很難控制",branch:"stress_rescue",points:3},{label:"明明不餓，固定場景還是會想吃",branch:"habit_break",points:3}]},
 {id:7,question:"如果明天只能改一件事，你最願意試：",options:[{label:"把飲料降一階",branch:"drink_loop",points:2},{label:"下午先補一份蛋白質",branch:"energy_refill",points:2},{label:"嘴饞前先停 3 分鐘",branch:"stress_rescue",points:2},{label:"把零食移出視線",branch:"habit_break",points:2}]},
 {id:8,question:"你最擔心的情況是：",options:[{label:"沒有飲料會很痛苦",branch:"drink_loop",points:3},{label:"晚上又餓到失控",branch:"energy_refill",points:3},{label:"情緒來時忍不住",branch:"stress_rescue",points:3},{label:"明明不餓，卻還是習慣性吃",branch:"habit_break",points:3}]}
];
