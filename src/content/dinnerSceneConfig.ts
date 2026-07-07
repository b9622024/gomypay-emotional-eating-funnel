export type DinnerGroup={id:string;label:string;multiple?:boolean;required?:boolean;options:string[]};
export type DinnerScene={id:string;name:string;description:string;selectionStructure:string;foodGroups:DinnerGroup[];riskRules:string[]};

export const dinnerScenes:DinnerScene[]=[
 {id:"convenience_store",name:"超商",description:"自由組合商品，先補齊最容易漏掉的蛋白質與主食。",selectionStructure:"自由組合商品",foodGroups:[
  {id:"protein",label:"蛋白質",multiple:true,options:["雞胸","茶葉蛋","溏心蛋","無糖豆漿","希臘優格","毛豆","豆腐"]},
  {id:"vegetable",label:"蔬菜",multiple:true,options:["沙拉","關東煮白蘿蔔","海帶","菇類","玉米筍","蔬菜盒"]},
  {id:"carb",label:"主食",multiple:true,options:["飯糰","地瓜","玉米","全麥吐司","小份蕎麥麵"]},
  {id:"drink",label:"飲料",options:["水","無糖茶","無糖豆漿","無糖拿鐵","氣泡水"]}],riskRules:["只吃沙拉","只喝飲料","甜點加購"]},
 {id:"breakfast_shop",name:"早餐店",description:"主餐已含澱粉，重點是補蛋白質並調整飲料。",selectionStructure:"主餐＋蛋白質加強＋飲料",foodGroups:[
  {id:"main",label:"主餐",required:true,options:["蛋餅","吐司","漢堡","饅頭","蘿蔔糕","鐵板麵"]},
  {id:"proteinBoost",label:"蛋白質加強",multiple:true,options:["加蛋","雞肉","鮪魚","豬里肌","無糖豆漿"]},
  {id:"drink",label:"飲料",options:["奶茶","紅茶","豆漿","無糖豆漿","咖啡","無糖茶","水"]}],riskRules:["奶茶＋鐵板麵＋薯餅","只有主餐沒有蛋白質","含糖飲料"]},
 {id:"bento_shop",name:"便當店",description:"用主菜、菜格數、飯量與飲料快速判讀。",selectionStructure:"主菜＋菜格數＋飯量＋飲料",foodGroups:[
  {id:"mainProtein",label:"主菜",required:true,options:["烤雞腿","滷雞腿","魚","瘦肉","豆腐","雞胸"]},
  {id:"vegetableAmount",label:"蔬菜",required:true,options:["0 格","1 格","2 格","3 格以上"]},
  {id:"carbAmount",label:"主食",required:true,options:["正常飯","3/4 碗","半碗","地瓜","不吃"]},
  {id:"drink",label:"飲料",options:["水","無糖茶","湯","含糖飲料"]}],riskRules:["0 格蔬菜","不吃飯","含糖飲料"]},
 {id:"noodle_shop",name:"麵店",description:"主餐通常已有澱粉，重點是找出蛋白質與蔬菜缺口。",selectionStructure:"主餐＋蛋白質加強＋蔬菜加強",foodGroups:[
  {id:"main",label:"主餐",required:true,options:["湯麵","乾麵","米粉","冬粉","水餃","餛飩湯"]},
  {id:"proteinBoost",label:"蛋白質加強",multiple:true,options:["滷蛋","豆干","滷豆腐","肉片","嘴邊肉","餛飩"]},
  {id:"vegetableBoost",label:"蔬菜加強",multiple:true,options:["燙青菜","海帶","菇類","小菜"]},
  {id:"drink",label:"飲料",options:["水","無糖茶","湯","含糖飲料"]}],riskRules:["只有一碗麵","乾麵醬料多","含糖飲料"]},
 {id:"luwei",name:"滷味",description:"像夾滷味一樣多選，同時避開加工料與醬料堆疊。",selectionStructure:"豆蛋肉＋蔬菜＋主食＋風險",foodGroups:[
  {id:"protein",label:"豆蛋肉",multiple:true,options:["豆腐","豆干","滷蛋","雞肉","豬肉片"]},
  {id:"vegetable",label:"蔬菜",multiple:true,options:["高麗菜","青江菜","菇類","海帶","白蘿蔔"]},
  {id:"carb",label:"主食",multiple:true,options:["王子麵","冬粉","科學麵","烏龍麵","地瓜"]},
  {id:"risks",label:"額外風險",multiple:true,options:["加很多醬","喝湯","加工火鍋料很多","份量很多"]}],riskRules:["加工火鍋料很多","加很多醬","喝湯"]},
 {id:"hotpot",name:"火鍋",description:"從湯底、肉、菜、主食與額外風險一起評估。",selectionStructure:"湯底＋蛋白質＋菜盤＋主食＋風險",foodGroups:[
  {id:"soupBase",label:"湯底",required:true,options:["昆布","蔬菜","麻辣","牛奶","酸菜白肉"]},
  {id:"protein",label:"蛋白質",multiple:true,options:["牛肉","豬肉","雞肉","魚","豆腐","海鮮"]},
  {id:"vegetableAmount",label:"菜盤",required:true,options:["吃完整份","吃一半","幾乎沒吃"]},
  {id:"carb",label:"主食",options:["白飯","冬粉","王子麵","烏龍麵","不吃"]},
  {id:"risks",label:"額外風險",multiple:true,options:["火鍋料很多","醬料很多","喝很多湯","含糖飲料","甜點"]}],riskRules:["麻辣或牛奶湯底","火鍋料很多","喝很多湯","甜點"]},
 {id:"fast_food",name:"速食店",description:"保留主餐，用份量、配餐與飲料做最小止損。",selectionStructure:"主餐＋配餐＋飲料＋加購",foodGroups:[
  {id:"main",label:"主餐",required:true,options:["牛肉漢堡","雞肉漢堡","烤雞","炸雞","魚排堡"]},
  {id:"side",label:"配餐",options:["沙拉","小薯","中薯","不加配餐"]},
  {id:"drink",label:"飲料",options:["水","無糖茶","黑咖啡","無糖汽水","含糖汽水"]},
  {id:"risks",label:"額外加購",multiple:true,options:["套餐加大","甜點","第二份炸物"]}],riskRules:["套餐加大","含糖汽水","甜點"]},
 {id:"delivery",name:"外送",description:"先固定餐型，避免又餓又累時一路加購。",selectionStructure:"餐型＋蛋白質＋蔬菜＋主食＋加購",foodGroups:[
  {id:"main",label:"餐型",required:true,options:["健康餐盒","便當","湯麵","滷味","火鍋","速食"]},
  {id:"proteinBoost",label:"蛋白質",multiple:true,options:["雞肉","魚","蛋","豆腐","肉片"]},
  {id:"vegetableBoost",label:"蔬菜",multiple:true,options:["青菜兩份","沙拉","燙青菜","菜盤"]},
  {id:"carb",label:"主食",options:["正常飯","半碗飯","地瓜","麵","不吃"]},
  {id:"drink",label:"飲料",options:["水","無糖茶","不加購飲料","含糖飲料"]},
  {id:"risks",label:"額外加購",multiple:true,options:["甜點","炸物","第二份主餐"]}],riskRules:["含糖飲料","甜點","炸物","第二份主餐"]},
 {id:"buffet",name:"自助餐",description:"先選菜與主菜，最後依飢餓決定飯量。",selectionStructure:"主菜＋蔬菜份數＋飯量＋飲料",foodGroups:[
  {id:"mainProtein",label:"主菜",required:true,options:["雞肉","魚","瘦肉","豆腐","蛋","炸排骨"]},
  {id:"vegetableAmount",label:"蔬菜",required:true,options:["0 樣","1 樣","2 樣","3 樣以上"]},
  {id:"carbAmount",label:"飯量",required:true,options:["一碗飯","半碗飯","地瓜","不吃"]},
  {id:"drink",label:"飲料",options:["水","無糖茶","湯","含糖飲料"]}],riskRules:["全部選炸物","0 樣蔬菜","不吃飯","含糖飲料"]}
];

export const dinnerSceneById=Object.fromEntries(dinnerScenes.map(scene=>[scene.id,scene])) as Record<string,DinnerScene>;
