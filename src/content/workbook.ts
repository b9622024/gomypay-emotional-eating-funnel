export type BasicField={key:string;label:string;help?:string;placeholder?:string;required?:boolean};
export type WorkbookField=BasicField&(
  |{type:"text"|"textarea"|"datetime"|"number"}
  |{type:"slider";min:number;max:number}
  |{type:"radio"|"checkbox";options:string[]}
  |{type:"repeat";max:number;itemLabel:string;fields:WorkbookField[]}
);
export type WorkbookDay={day:number;title:string;intro:string;sections:{title:string;description?:string;tips?:{label:string;text:string}[];fields:WorkbookField[]}[]};

const score=(key:string,label:string):WorkbookField=>({key,label,type:"slider",min:0,max:10,help:"0 代表很低，10 代表非常強烈"});
const yesNoUncertain=["有","沒有","不確定"];
const emotions=["壓力","疲憊","委屈","無聊","習慣","營養不足","睡眠不足","其他"];

export const workbookPreparation={
  reminder:{title:"開始前，先給你一個提醒",lead:"你不是要變成完全不嘴饞的人，你只是要在失控前，多一個選擇。",body:"這 7 天不是要求你完全不能吃零食，也不是要你立刻戒掉所有含糖飲料。我們先透過記錄，看懂最容易嘴饞的時間、情緒、場景、飲料習慣與營養缺口。"},
  steps:["看完當天簡短說明，理解今天要觀察什麼","填寫當天表格，不用完美，只要誠實記錄","做一個小行動，讓生活開始一點點改變"],
  fields:[
    {key:"baselineWeeklyCravingDays",label:"一週大概幾天會在下班後或晚上嘴饞？",type:"text",placeholder:"例如：5 天"},
    {key:"baselineWeeklySugaryDrinks",label:"一週大概喝幾杯含糖飲料？",type:"text",placeholder:"例如：3 杯"},
    {key:"baselineCravingTime",label:"最容易嘴饞的時間",type:"checkbox",options:["下午","下班後","晚餐後","睡前","半夜"]},
    {key:"baselineCravingItems",label:"最常想吃或想喝",type:"checkbox",options:["甜食","炸物","餅乾零食","宵夜","手搖飲","含糖咖啡","其他"]},
    score("baselineAfterWorkCraving","下班後嘴饞程度"),score("baselineSugaryDrinkDependence","含糖飲料依賴程度"),score("baselineStressEating","壓力想吃程度"),score("baselineFatigue","疲憊程度"),score("baselineAfterDinnerCraving","晚餐後想吃東西的程度"),score("baselineFrustration","對飲食失控的挫折感")
  ] as WorkbookField[]
};

export const workbookDays:WorkbookDay[]=[
 {day:1,title:"我是真的餓，還是想放鬆？",intro:"先停下來三分鐘，分辨此刻的身體飢餓與情緒需求。",sections:[
  {title:"此刻的嘴饞",fields:[{key:"currentTime",label:"現在時間",type:"datetime"},{key:"cravingItem",label:"現在最想吃或喝什麼？",type:"text",placeholder:"例如：珍珠奶茶、洋芋片"},score("hungerScore","身體飢餓程度"),score("stressScore","壓力程度"),score("fatigueScore","疲憊程度"),score("relaxNeedScore","想放鬆的程度")]},
  {title:"分辨真正需要",fields:[{key:"wouldEatNormalMeal",label:"如果現在有一份正常正餐，我會吃嗎？",type:"radio",options:["會","不會","不確定"]},{key:"needType",label:"我現在更需要的是？",type:"radio",options:["食物","放鬆","情緒安慰","無聊","不確定"]},{key:"finalAction",label:"我最後選擇怎麼做？",type:"textarea",placeholder:"寫下你做的選擇，不需要評分好壞"},{key:"afterFeeling",label:"做完選擇後的感覺",type:"checkbox",options:["滿足","放鬆","內疚","更想吃","沒感覺"]},{key:"reflection",label:"今天的小發現",type:"textarea",placeholder:"例如：我其實是累，不是真的餓"}]}
 ]},
 {day:2,title:"找出我的嘴饞觸發點",intro:"記錄最多三次嘴饞事件，看看時間、情緒與情境是否有重複模式。",sections:[
  {title:"嘴饞事件紀錄",description:"不必等到真的吃了才記，只要出現強烈想吃、想喝的念頭就可以。",fields:[{key:"events",label:"嘴饞事件",type:"repeat",max:3,itemLabel:"第 {n} 次嘴饞事件",fields:[{key:"time",label:"時間",type:"datetime"},{key:"place",label:"地點",type:"text"},{key:"activity",label:"當時正在做什麼？",type:"text"},{key:"beforeEvent",label:"嘴饞前發生了什麼？",type:"textarea"},{key:"emotion",label:"當時的狀態",type:"checkbox",options:emotions},{key:"cravingItem",label:"想吃或想喝什麼？",type:"text"},score("hungerScore","飢餓程度"),score("stressScore","壓力程度"),score("fatigueScore","疲憊程度"),{key:"didEatOrDrink",label:"最後有吃或喝嗎？",type:"radio",options:["有","沒有"]},{key:"afterFeeling",label:"之後的感覺",type:"text"}]}]},
  {title:"今天的觸發點總結",fields:[{key:"mainTrigger",label:"今天主要的觸發點",type:"checkbox",options:emotions},{key:"easiestCravingTime",label:"最容易嘴饞的時間",type:"text"},{key:"mostCommonEmotion",label:"最常出現的情緒",type:"text"}]}
 ]},
 {day:3,title:"含糖飲料為什麼戒不掉？",intro:"先觀察喝飲料前後的需求，再替明天設計一個比較容易做到的調整。",sections:[
  {title:"今天的飲料紀錄",fields:[{key:"drinkName",label:"飲料名稱",type:"text"},{key:"sugarLevel",label:"甜度",type:"radio",options:["全糖","少糖","半糖","微糖","無糖"]},{key:"toppings",label:"加料",type:"checkbox",options:["珍珠","椰果","布丁","粉粿","奶蓋","沒有"]},{key:"drinkTime",label:"飲用時間",type:"datetime"},{key:"emotionBeforeDrink",label:"喝之前的心情",type:"text"},{key:"drankWaterBefore",label:"喝之前有先喝水嗎？",type:"radio",options:["有","沒有"]},{key:"reason",label:"最主要的原因",type:"radio",options:["真的渴","想放鬆","想獎勵自己","下午提神","習慣","不確定"]},{key:"afterFeeling",label:"喝完後的感覺",type:"checkbox",options:["滿足","放鬆","罪惡感","想睡","更想吃"]}]},
  {title:"明天的小調整",fields:[{key:"tomorrowAdjustment",label:"明天想怎麼調整？",type:"textarea"},{key:"adjustmentPlan",label:"我願意先試一個",type:"checkbox",options:["糖度降一階","拿掉加料","大杯改中杯","想喝前先喝水","設定固定飲料日"]}]}
 ]},
 {day:4,title:"建立 10 分鐘嘴饞急救流程",intro:"不是強迫自己不能吃，而是在決定前先留出十分鐘的緩衝。",sections:[
  {title:"10 分鐘嘴饞急救流程",description:"在自動失控前，幫自己多一個暫停鍵。",tips:[{label:"1",text:"停下來 30 秒，不要立刻拿食物"},{label:"2",text:"喝 300ml 水"},{label:"3",text:"做 5 次深呼吸"},{label:"4",text:"問自己：我現在餓幾分？"},{label:"5",text:"寫下現在的情緒"},{label:"6",text:"選一個替代行動"},{label:"7",text:"10 分鐘後還想吃，就選安全選項"}],fields:[]},
  {title:"替代行動清單",description:"依照當下的狀態，先選一件容易做到的小事。",tips:[{label:"壓力大",text:"洗澡、走路 5 分鐘、深呼吸、寫下煩惱"},{label:"很疲憊",text:"泡熱茶、躺 10 分鐘、提早睡"},{label:"無聊",text:"整理桌面、傳訊息給朋友、看短影片但不配零食"},{label:"想獎勵自己",text:"聽音樂、擦香氛、泡腳、看一集劇"},{label:"真的餓",text:"選擇安全食物，不要硬忍"}],fields:[]},
  {title:"Day 4 急救紀錄",fields:[{key:"usedTime",label:"使用時間",type:"datetime"},{key:"cravingItem",label:"當時想吃或喝什麼？",type:"text"},{key:"drankWater",label:"我先喝了一杯水",type:"checkbox",options:["已完成"]},{key:"breathingCount",label:"深呼吸次數",type:"number"},score("hungerScore","飢餓程度"),{key:"emotion",label:"當時的情緒",type:"text"},{key:"alternativeAction",label:"我選擇的替代行動",type:"checkbox",options:["洗澡","走路5分鐘","深呼吸","寫下情緒","泡熱茶","躺10分鐘","傳訊息","其他"]},{key:"cravingAfter10Min",label:"10 分鐘後嘴饞程度",type:"radio",options:["下降","一樣","更強"]},{key:"finalDidEat",label:"最後有吃或喝嗎？",type:"radio",options:["有","沒有"]},{key:"finalChoice",label:"如果有，我選了什麼？",type:"text"},{key:"selfEvaluation",label:"給今天的自己一句評價",type:"radio",options:["有進步","還需要練習","今天很不容易"]}]}
 ]},
 {day:5,title:"白天營養缺口檢查",intro:"晚上的嘴饞，有時候是在提醒你白天吃得太少、太趕或休息不足。",sections:[
  {title:"快速檢查",fields:[{key:"breakfastProtein",label:"早餐有蛋白質？",type:"radio",options:["有","沒有","沒吃"]},{key:"lunchProtein",label:"午餐有蛋白質？",type:"radio",options:["有","沒有","沒吃"]},{key:"vegetables",label:"今天有吃蔬菜？",type:"radio",options:["有","沒有"]},{key:"enoughWater",label:"水分足夠？",type:"radio",options:["有","沒有"]},{key:"afternoonSugarDrink",label:"下午有含糖飲料？",type:"radio",options:["有","沒有"]},{key:"tooHungryBeforeDinner",label:"晚餐前已經太餓？",type:"radio",options:["有","沒有"]},{key:"ateTooLittle",label:"白天吃得太少？",type:"radio",options:["有","沒有"]},{key:"sleepDeprived",label:"睡眠不足？",type:"radio",options:["有","沒有"]}]},
  {title:"餐次紀錄",fields:[{key:"breakfastText",label:"早餐",type:"text"},{key:"lunchText",label:"午餐",type:"text"},{key:"snackDrinkText",label:"點心／飲料",type:"text"},{key:"dinnerText",label:"晚餐",type:"text"},{key:"nightCravingText",label:"晚間嘴饞",type:"text"}]},
  {title:"缺口總結",fields:[{key:"gapSummary",label:"今天可能的缺口",type:"checkbox",options:["早餐蛋白質不足","午餐蛋白質不足","水喝太少","白天吃太少","下午含糖飲料太多","睡眠不足","壓力太高"]},{key:"tomorrowOneAction",label:"明天只做一個小行動",type:"textarea"}]}
 ]},
 {day:6,title:"下班後防暴食晚餐公式",intro:"用蛋白質、蔬菜、澱粉與飲品，替外食晚餐建立一個不用多想的基本盤。",sections:[
  {title:"外食族晚餐公式",description:"蛋白質一掌＋蔬菜三拳＋澱粉一拳＋水或無糖飲。不用完美，只要比原本更穩定。",tips:[{label:"便當店",text:"雞肉、魚、瘦肉或豆腐，飯半碗，多青菜"},{label:"超商",text:"茶葉蛋＋雞胸＋沙拉＋地瓜或飯糰"},{label:"早餐店當晚餐",text:"蛋餅加蛋＋無糖豆漿，避開奶茶、薯餅、鐵板麵加飲料"},{label:"速食店",text:"主餐保留，飲料換無糖茶，薯條減量或不加點"},{label:"自助餐",text:"先夾蛋白質與菜，再決定飯量"}],fields:[]},
  {title:"今天的晚餐",fields:[{key:"dinnerPlace",label:"用餐地點／店家",type:"text"},{key:"mainMeal",label:"主餐內容",type:"text"},{key:"hadProtein",label:"有蛋白質？",type:"radio",options:["有","沒有"]},{key:"hadVegetable",label:"有蔬菜？",type:"radio",options:["有","沒有"]},{key:"carbAmount",label:"澱粉份量",type:"radio",options:["沒吃","半碗","一碗","超過一碗"]},{key:"drink",label:"搭配飲品",type:"text"},{key:"cravingAfterDinner",label:"晚餐後有嘴饞？",type:"radio",options:["有","沒有"]},{key:"cravingItemAfterDinner",label:"晚餐後想吃什麼？",type:"text"},{key:"nextAdjustment",label:"下次想調整什麼？",type:"textarea"}]},
  {title:"我的三個外食備案",fields:[{key:"backup1Place",label:"備案 1 店家",type:"text"},{key:"backup1Order",label:"備案 1 點餐方式",type:"text"},{key:"backup2Place",label:"備案 2 店家",type:"text"},{key:"backup2Order",label:"備案 2 點餐方式",type:"text"},{key:"backup3Place",label:"備案 3 店家",type:"text"},{key:"backup3Order",label:"備案 3 點餐方式",type:"text"}]}
 ]},
 {day:7,title:"我的個人嘴饞止損計畫",intro:"把這七天的發現整理成一份真正適合你生活的個人規則。",sections:[
  {title:"我的嘴饞模式",fields:[{key:"easiestCravingTime",label:"最容易嘴饞的時間",type:"text"},{key:"easiestCravingPlace",label:"最容易嘴饞的地點",type:"text"},{key:"mainEmotionTrigger",label:"主要情緒觸發點",type:"text"},{key:"commonCravingFood",label:"最常想吃的食物",type:"text"},{key:"commonCravingDrink",label:"最常想喝的飲料",type:"text"},{key:"nutritionGap",label:"最常見營養缺口",type:"text"},{key:"bestAlternativeAction",label:"最有效的替代行動",type:"text"},{key:"avoidSituation",label:"最需要避開的情境",type:"text"}]},
  {title:"我的飲料規則",fields:[{key:"weeklyDrinkLimit",label:"每週飲料次數",type:"text"},{key:"sugarRule",label:"甜度規則",type:"text"},{key:"toppingRule",label:"加料規則",type:"text"},{key:"allowedSituation",label:"允許喝飲料的情境",type:"text"},{key:"beforeDrinkAction",label:"喝之前先做什麼？",type:"text"},{key:"drinkAlternative",label:"替代飲品",type:"text"}]},
  {title:"我的急救計畫",fields:[{key:"planForSugaryDrink",label:"很想喝含糖飲料時",type:"text"},{key:"planForSweetFood",label:"很想吃甜食時",type:"text"},{key:"planForFriedFood",label:"很想吃炸物時",type:"text"},{key:"planForLateNightSnack",label:"很想吃宵夜時",type:"text"},{key:"planForStressEating",label:"壓力想吃時",type:"text"},{key:"planForFatigueEating",label:"疲憊想吃時",type:"text"}]},
  {title:"下週承諾",fields:[{key:"nextWeekCommitment",label:"我願意持續的行動",type:"checkbox",options:["每天記錄一次嘴饞時間","想喝飲料前先喝水","含糖飲料糖度降一階","晚餐加入蛋白質","下午先補水","睡前使用10分鐘流程","完成AI能量減脂初評","預約一對一諮詢"]}]},
  {title:"最後總結",fields:[{key:"biggestDiscovery",label:"這七天最大的發現",type:"textarea"},{key:"mostNeedImprove",label:"目前最需要改善的地方",type:"textarea"},{key:"nextStep",label:"我的下一步",type:"textarea"}]}
 ]}
];

export const dayTitles=workbookDays.map(day=>`Day ${day.day}：${day.title}`);
