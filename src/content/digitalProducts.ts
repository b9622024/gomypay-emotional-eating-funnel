export type DigitalAsset={
  key:string;
  title:string;
  description:string;
  kind:"測驗"|"行動手冊"|"工作本"|"分析表"|"追蹤表"|"流程卡"|"清單"|"表單"|"菜單";
  downloadUrl:string;
};

const placeholder="#";
export const emotionalEatingDownloadLinks={actionGuidePdf:placeholder,quizGuidePdf:placeholder};

export const digitalAssetsByProduct:Record<string,DigitalAsset[]>={
  emotional_eating_reset_7d:[
    {key:"emotional-eating-quiz",title:"情緒性進食 6 型測驗",description:"先找出你最常出現的嘴饞與進食觸發模式。",kind:"測驗",downloadUrl:placeholder},
    {key:"reset-action-guide",title:"7 天嘴饞止損行動手冊",description:"每天花 5–10 分鐘，依序完成看見、記錄與調整。",kind:"行動手冊",downloadUrl:placeholder},
    {key:"three-minute-workbook",title:"嘴饞前 3 分鐘身心連結工作本",description:"在想吃之前先停下來，分辨身體與情緒訊號。",kind:"工作本",downloadUrl:placeholder},
    {key:"trigger-analysis",title:"下班後嘴饞觸發點分析表",description:"整理時間、情境、情緒與想吃的食物。",kind:"分析表",downloadUrl:placeholder},
    {key:"drink-reset",title:"7 天含糖飲料重置表",description:"循序記錄、降糖、補水與替換選擇。",kind:"追蹤表",downloadUrl:placeholder},
    {key:"mindful-nutrition",title:"正念營養追蹤表",description:"觀察白天營養與晚間嘴饞之間的關聯。",kind:"追蹤表",downloadUrl:placeholder},
    {key:"craving-rescue",title:"10 分鐘嘴饞急救流程卡",description:"打開外送或零食櫃前，先照著完成一輪。",kind:"流程卡",downloadUrl:placeholder},
    {key:"dinner-formula",title:"下班後防暴食晚餐公式",description:"外食族也能快速套用的晚餐搭配方式。",kind:"清單",downloadUrl:placeholder},
    {key:"safe-swaps",title:"安全零食與飲料替換清單",description:"想吃甜、鹹或喝奶茶時的溫和替代選項。",kind:"清單",downloadUrl:placeholder}
  ],
  ai_energy_assessment:[
    {key:"ai-energy-assessment",title:"AI 能量減脂初評表單",description:"從情緒、壓力、睡眠、外食與營養缺口完成初步盤點。",kind:"表單",downloadUrl:placeholder}
  ],
  sugary_drink_swap_pro:[
    {key:"sugary-drink-swap-pro",title:"含糖飲料替換清單 Pro",description:"手搖飲降糖、便利商店無糖飲與一週飲料規則設計。",kind:"清單",downloadUrl:placeholder}
  ],
  anti_binge_meal_plan_7d:[
    {key:"anti-binge-meal-plan",title:"7 天外食防暴食菜單",description:"早餐店、便利商店、便當店與速食店的省力搭配。",kind:"菜單",downloadUrl:placeholder}
  ],
  coaching_deposit_3d:[
    {key:"coaching-intake",title:"三天陪跑資料填寫表單",description:"提交飲食、嘴饞紀錄與希望教練協助的問題。",kind:"表單",downloadUrl:placeholder}
  ]
};

export function assetsForProducts(productCodes:string[]){
  return productCodes.flatMap(code=>digitalAssetsByProduct[code]??[]);
}

export const recommendedUsage=[
  {step:"01",action:"quiz",title:"先完成情緒性進食 6 型測驗",description:"用 24 題手機互動測驗，先找到主要與次要的觸發模式。"},
  {step:"02",action:"three-minute",title:"嘴饞前 3 分鐘身心連結工作本",description:"嘴饞剛出現時，先用這個工具做 3 分鐘檢查，分辨自己是真的餓，還是壓力、疲憊、委屈、無聊或想喝飲料。"},
  {step:"03",action:"trigger-analysis",title:"下班後嘴饞觸發點分析器",description:"回推每次嘴饞前 30 分鐘的時間、情緒、場景與身體線索，找出你最常被啟動的破功開關。"},
  {step:"04",action:"workbook",title:"開始 7 天計畫",description:"每天花 5–10 分鐘，跟著行動手冊完成一個小步驟。"},
  {step:"05",action:"tools",title:"搭配追蹤工具",description:"使用工作本與追蹤表，觀察什麼方法最適合你的生活。"}
];
