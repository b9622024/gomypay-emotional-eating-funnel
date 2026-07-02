export const quizType="emotional_eating_6_types";

export const answerOptions=[
  {value:0,label:"幾乎沒有"},{value:1,label:"偶爾會"},{value:2,label:"經常會"},{value:3,label:"幾乎每天"}
] as const;

export const emotionalEatingTypes={
  stress_release:{name:"壓力釋放型",description:"你可能習慣在壓力升高時，透過食物取得短暫的放鬆與喘息。",scenario:"工作繁忙、心情煩躁、下班後終於能放鬆時。",firstStep:"想吃之前先停 30 秒，替壓力程度打分數，再選一個非食物的放鬆行動。",task:"Day 4：建立 10 分鐘嘴饞急救流程"},
  fatigue_loss_control:{name:"疲憊失控型",description:"疲憊可能讓你沒有力氣規劃或做選擇，因此更容易隨手吃、叫外送或喝飲料。",scenario:"睡眠不足、加班、下班後腦袋不想再做決定時。",firstStep:"預先準備一個不必思考的晚餐或點心備案，累的時候直接照著選。",task:"Day 6：下班後防暴食晚餐公式"},
  compensation:{name:"委屈補償型",description:"食物對你而言，可能有犒賞、安慰或補償辛苦的功能。",scenario:"覺得委屈、不被理解，或心裡出現「今天已經夠辛苦了」時。",firstStep:"先寫下此刻真正想被滿足的需求，再決定食物是不是最適合的選擇。",task:"Day 1：我是真的餓，還是想放鬆？"},
  boredom_habit:{name:"無聊習慣型",description:"你不一定真的餓，但特定時間、活動或環境已經和吃東西連結在一起。",scenario:"滑手機、追劇、晚餐後，或每天固定時段。",firstStep:"先改變一個環境提示，例如把零食收起來，追劇時改拿無糖飲品。",task:"Day 2：找出我的嘴饞觸發點"},
  sugary_drink_dependency:{name:"含糖飲料依賴型",description:"含糖飲料可能同時扮演提神、獎勵、搭餐與放鬆的角色，因此特別難調整。",scenario:"下午疲憊、吃飯配飲料、想獎勵自己或需要提神時。",firstStep:"想買飲料前先喝水，並只調整一件事，例如糖度降一階或取消加料。",task:"Day 3：含糖飲料為什麼戒不掉？"},
  nutrition_gap:{name:"營養不足型",description:"晚間嘴饞可能和白天吃太少、蛋白質不足、水分不足或空腹太久有關。",scenario:"沒吃早餐、午餐隨便吃，或晚餐前已經餓很久時。",firstStep:"明天先替早餐或午餐補上一份蛋白質，不必同時改變所有餐次。",task:"Day 5：白天營養缺口檢查"}
} as const;

export type EmotionalEatingType=keyof typeof emotionalEatingTypes;
export type QuizQuestion={id:number;type:EmotionalEatingType;text:string};

export const emotionalEatingQuestions:QuizQuestion[]=[
  {id:1,type:"stress_release",text:"工作壓力大時，我會很想吃甜食、炸物或宵夜。"},{id:2,type:"stress_release",text:"我常覺得吃東西可以讓我暫時放鬆。"},{id:3,type:"stress_release",text:"下班後，我會想用食物把壓力壓下去。"},{id:4,type:"stress_release",text:"越忙、越煩，我越容易亂吃。"},
  {id:5,type:"fatigue_loss_control",text:"睡不好或太累時，我更容易亂吃。"},{id:6,type:"fatigue_loss_control",text:"下班後我常懶得想要吃什麼，看到什麼就吃什麼。"},{id:7,type:"fatigue_loss_control",text:"我累的時候，很難控制飲食選擇。"},{id:8,type:"fatigue_loss_control",text:"疲憊時，我會特別想喝飲料或叫外送。"},
  {id:9,type:"compensation",text:"我常覺得自己很辛苦，所以想吃點東西犒賞自己。"},{id:10,type:"compensation",text:"心情委屈時，我會想用食物安慰自己。"},{id:11,type:"compensation",text:"我常在「今天已經很累了」的想法下破功。"},{id:12,type:"compensation",text:"我吃東西時，常有一種補償自己的感覺。"},
  {id:13,type:"boredom_habit",text:"我滑手機或追劇時，常會想吃點東西。"},{id:14,type:"boredom_habit",text:"我不一定餓，但嘴巴就是想吃。"},{id:15,type:"boredom_habit",text:"晚餐後，我常習慣找零食。"},{id:16,type:"boredom_habit",text:"某些時間到了，我就會自然想吃或喝。"},
  {id:17,type:"sugary_drink_dependency",text:"我知道含糖飲料會影響減重，但還是很難不喝。"},{id:18,type:"sugary_drink_dependency",text:"下午累的時候，我會很想喝手搖飲、奶茶或含糖咖啡。"},{id:19,type:"sugary_drink_dependency",text:"吃飯沒有飲料，我會覺得少了什麼。"},{id:20,type:"sugary_drink_dependency",text:"我常用飲料作為獎勵、提神或放鬆。"},
  {id:21,type:"nutrition_gap",text:"我白天常常吃得很少，晚上才特別想吃。"},{id:22,type:"nutrition_gap",text:"我早餐常常只有咖啡、飲料，或乾脆不吃。"},{id:23,type:"nutrition_gap",text:"我午餐常吃得很隨便，蛋白質不一定夠。"},{id:24,type:"nutrition_gap",text:"我晚上嘴饞時，常其實已經餓很久了。"}
];

export const quizCopy={
  eyebrow:"FIRST STEP · 6 TYPE QUIZ",title:"情緒性進食 6 型測驗",intro:"用 24 題看見自己最常出現的嘴饞與進食觸發模式。請依照最近一個月的真實狀況作答，沒有標準答案。",start:"開始測驗",previous:"上一題",next:"下一題",finish:"查看我的結果",required:"請先選擇一個最符合你的答案",resultTitle:"你的情緒性進食傾向",mixed:"混合型傾向",primary:"主要類型",secondary:"次要類型",description:"類型說明",scenario:"容易破功情境",firstStep:"第一步建議",task:"建議搭配的手冊任務",dayOneCta:"開始 Day 1 工作本",aiCta:"完成 AI 能量減脂初評",disclaimer:"這份結果是一般健康教育與自我觀察工具，不是醫療或心理診斷。"
} as const;

export type QuizAnswers=Record<string,number>;
export function calculateQuizResult(answers:QuizAnswers){
  const scores=Object.fromEntries(Object.keys(emotionalEatingTypes).map(key=>[key,0])) as Record<EmotionalEatingType,number>;
  for(const question of emotionalEatingQuestions)scores[question.type]+=answers[String(question.id)]??0;
  const levels=[...new Set(Object.values(scores))].sort((a,b)=>b-a);
  const primaryScore=levels[0]??0,secondaryScore=levels[1];
  const primaryTypes=(Object.keys(scores) as EmotionalEatingType[]).filter(key=>scores[key]===primaryScore);
  const secondaryTypes=(Object.keys(scores) as EmotionalEatingType[]).filter(key=>secondaryScore!==undefined&&scores[key]===secondaryScore);
  return {scores,primaryTypes,secondaryTypes,isMixed:primaryTypes.length>1||secondaryTypes.length>1};
}
