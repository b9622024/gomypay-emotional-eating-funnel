export type DigitalAsset={
  key:string;
  title:string;
  description:string;
  kind:"測驗"|"行動手冊"|"工作本"|"分析表"|"追蹤表"|"流程卡"|"清單"|"表單"|"菜單";
  downloadUrl:string;
  badge?:string;
};

const placeholder="#";
export const emotionalEatingDownloadLinks={actionGuidePdf:"/downloads/7-day-craving-reset-workbook.pdf",quizGuidePdf:"/downloads/emotional-eating-quiz-guide.pdf"};

export type AssetDelivery={interactivePath:string;pdfUrl:string;imageUrl?:string};
// 所有交付連結集中在這裡。收到正式檔案或雲端網址後，只需替換對應的 #。
export const assetDeliveryLinks:Record<string,AssetDelivery>={
  "emotional-eating-quiz":{interactivePath:"/quiz/emotional-eating",pdfUrl:emotionalEatingDownloadLinks.quizGuidePdf},
  "reset-action-guide":{interactivePath:"/workbook",pdfUrl:emotionalEatingDownloadLinks.actionGuidePdf},
  "three-minute-workbook":{interactivePath:"/three-minute-check",pdfUrl:"/downloads/3-minute-mind-body-workbook.pdf"},
  "trigger-analysis":{interactivePath:"/trigger-analysis",pdfUrl:"/downloads/craving-trigger-analysis.pdf"},
  "drink-reset":{interactivePath:"/drink-reset",pdfUrl:"/downloads/7-day-drink-reset.pdf"},
  "mindful-nutrition":{interactivePath:"/mindful-nutrition-tracker",pdfUrl:"/downloads/mindful-nutrition-tracker.pdf"},
  "craving-rescue":{interactivePath:"/craving-rescue",pdfUrl:"/downloads/10-minute-craving-rescue.pdf",imageUrl:"/downloads/10-minute-craving-rescue-card.png"},
  "dinner-formula":{interactivePath:"/dinner-formula",pdfUrl:"/downloads/dinner-formula.pdf",imageUrl:"/downloads/dinner-formula-card.png"},
  "safe-swaps":{interactivePath:"/safe-swap-list",pdfUrl:"/downloads/safe-swap-list.pdf",imageUrl:"/downloads/safe-swap-list-card.png"},
  "sugary-drink-swap-pro":{interactivePath:"/drink-swap-pro",pdfUrl:"/downloads/drink-swap-pro.pdf",imageUrl:"/downloads/drink-swap-pro-card.png"},
  "ai-energy-assessment":{interactivePath:"/ai-energy-assessment",pdfUrl:placeholder},
  "anti-binge-meal-plan":{interactivePath:"/7-day-eating-out-menu",pdfUrl:"/downloads/7-day-eating-out-menu.pdf",imageUrl:"/downloads/7-day-eating-out-menu-card.png"},
  "coaching-intake":{interactivePath:placeholder,pdfUrl:placeholder}
};

export const digitalAssetsByProduct:Record<string,DigitalAsset[]>={
  emotional_eating_reset_7d:[
    {key:"emotional-eating-quiz",title:"情緒性進食 6 型測驗",description:"先找出你最常出現的嘴饞與進食觸發模式。",kind:"測驗",downloadUrl:placeholder},
    {key:"reset-action-guide",title:"7 天嘴饞破關計畫",description:"每天完成一個小任務，解鎖你的減脂止損地圖。",kind:"行動手冊",downloadUrl:placeholder},
    {key:"three-minute-workbook",title:"嘴饞前 3 分鐘身心連結工作本",description:"在想吃之前先停下來，分辨身體與情緒訊號。",kind:"工作本",downloadUrl:placeholder},
    {key:"trigger-analysis",title:"下班後嘴饞觸發點分析表",description:"整理時間、情境、情緒與想吃的食物。",kind:"分析表",downloadUrl:placeholder},
    {key:"drink-reset",title:"7 天含糖飲料重置表",description:"飲料降糖支線道具；如果平常不太喝含糖飲料，可以跳過這個支線。",kind:"追蹤表",downloadUrl:placeholder},
    {key:"mindful-nutrition",title:"正念營養缺口掃描",description:"快速檢查白天吃得穩不穩，找出晚上嘴饞可能的營養缺口。",kind:"追蹤表",downloadUrl:placeholder},
    {key:"craving-rescue",title:"10 分鐘嘴饞急救流程卡",description:"快失控前，先幫自己多一個暫停鍵。",kind:"流程卡",downloadUrl:placeholder},
    {key:"dinner-formula",title:"下班後防暴食晚餐公式",description:"外食族也能用的 3-1-1 穩定晚餐選擇法。",kind:"清單",downloadUrl:placeholder},
    {key:"safe-swaps",title:"安全零食與飲料替換清單",description:"想吃甜、想吃鹹、想喝飲料時，先選比較穩的版本。",kind:"清單",downloadUrl:placeholder}
  ],
  ai_energy_assessment:[
    {key:"ai-energy-assessment",title:"AI 能量減脂測驗",description:"透過 5 分鐘 49 題的測驗填寫，了解目前的脈輪能量狀態與個人天賦優勢；由專人一對一解析測驗結果、找出問題並提供專屬對策方案。",kind:"表單",downloadUrl:placeholder}
  ],
  sugary_drink_swap_pro:[
    {key:"sugary-drink-swap-pro",title:"含糖飲料替換清單 Pro",description:"想喝飲料時，直接知道怎麼點、怎麼降階、怎麼停得住。",kind:"清單",downloadUrl:placeholder,badge:"NT$99 進階道具"}
  ],
  anti_binge_meal_plan_7d:[
    {key:"anti-binge-meal-plan",title:"7 天外食防暴食菜單",description:"不用自己煮，外食族也能照著吃的 7 天穩定晚餐與嘴饞止損菜單。",kind:"菜單",downloadUrl:placeholder,badge:"NT$99 進階道具"}
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
  {step:"02",action:"workbook",title:"開始 7 天計畫",description:"每天花 5–10 分鐘，跟著行動手冊完成一個小步驟。"},
  {step:"03",action:"tools",title:"搭配追蹤工具",description:"依照當下需要使用 3 分鐘檢查、觸發點分析、飲料重置、營養追蹤或急救工具。"}
];
