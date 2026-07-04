export type NavCategory="protein"|"vegetable"|"carb"|"drink";
export type NavItem={id:string;name:string;sceneIds:string[];category:NavCategory;proteinValue:number;vegetableValue:number;carbValue:number;drinkRisk:number;satietyValue:number;speedValue:number};
export type NavScene={id:string;name:string;description:string;commonRisks:string[];proteinOptions:string[];vegetableOptions:string[];carbOptions:string[];drinkOptions:string[];commonTrapCombos:string[];defaultStableCombos:string[];minimumRescueCombos:string[]};
const scene=(id:string,name:string,risks:string[],protein:string[],veg:string[],carb:string[],stable:string[],rescue:string[]):NavScene=>({id,name,description:`在${name}快速判斷這餐缺什麼，再做最小補強。`,commonRisks:risks,proteinOptions:protein,vegetableOptions:veg,carbOptions:carb,drinkOptions:["水","無糖茶","無糖豆漿","無糖拿鐵","微糖小杯","全糖大杯"],commonTrapCombos:risks,defaultStableCombos:stable,minimumRescueCombos:rescue});
export const eatingNavigationScenes:NavScene[]=[
scene("convenienceStore","超商",["甜點＋含糖飲","只吃麵包"],["雞胸","茶葉蛋","無糖豆漿"],["沙拉","毛豆"],["飯糰","地瓜"],["雞胸＋飯糰＋沙拉＋無糖茶"],["飯糰＋無糖豆漿"]),
scene("breakfastShop","早餐店",["主食多、蛋白質不足","奶茶偏甜"],["蛋","里肌","無糖豆漿"],["生菜"],["蛋餅","吐司"],["蛋餅＋無糖豆漿"],["吐司＋蛋"]),
scene("bentoShop","便當店",["配菜油鹹","只吃菜後晚上又餓"],["雞腿","魚","豆腐"],["兩樣青菜"],["飯半碗","飯一碗"],["主菜＋兩菜＋適量飯"],["主菜＋飯＋水"]),
scene("buffet","自助餐",["全部選同一類","炸物過多"],["雞肉","魚","蛋","豆腐"],["青菜兩份"],["飯半碗"],["一主菜＋兩菜＋飯"],["蛋／豆腐＋菜＋飯"]),
scene("noodleShop","麵店",["只有麵","缺蛋白質與蔬菜"],["滷蛋","豆干","肉片"],["燙青菜"],["湯麵","乾麵"],["麵＋燙青菜＋蛋／豆干"],["麵＋蛋"]),
scene("luwei","滷味",["加工料過多","丸子與甜不辣為主"],["蛋","豆干","雞肉"],["青菜","菇類","海帶"],["冬粉","玉米"],["蛋白質＋兩菜＋主食"],["蛋＋青菜＋冬粉"]),
scene("hotPot","火鍋",["加工料過多","只吃肉不吃主食"],["肉片","豆腐"],["菜盤"],["飯","冬粉"],["肉／豆腐＋菜盤＋適量主食"],["肉片＋菜＋飯"]),
scene("fastFood","速食店",["套餐加大","含糖飲與甜點加購"],["漢堡主餐","烤雞"],["沙拉"],["漢堡麵包","小薯"],["單份主餐＋無糖飲＋沙拉"],["主餐＋無糖飲"]),
scene("delivery","外送",["邊餓邊滑太久","飲料甜點加購"],["便當主菜","雞肉","魚"],["青菜配菜"],["飯","地瓜"],["固定便當＋無糖飲"],["主餐＋水"]),
scene("cafe","咖啡店／下午茶",["甜咖啡＋蛋糕當一餐","只有飲料"],["蛋三明治","無糖拿鐵"],["生菜三明治"],["吐司","三明治"],["三明治＋無糖拿鐵或茶"],["吐司＋無糖拿鐵"])
];
const items:NavItem[]=[];for(const s of eatingNavigationScenes){for(const name of s.proteinOptions)items.push({id:`${s.id}-p-${name}`,name,sceneIds:[s.id],category:"protein",proteinValue:name.includes("豆漿")||name.includes("蛋")?1:2,vegetableValue:0,carbValue:0,drinkRisk:0,satietyValue:2,speedValue:2});for(const name of s.vegetableOptions)items.push({id:`${s.id}-v-${name}`,name,sceneIds:[s.id],category:"vegetable",proteinValue:0,vegetableValue:2,carbValue:0,drinkRisk:0,satietyValue:1,speedValue:1});for(const name of s.carbOptions)items.push({id:`${s.id}-c-${name}`,name,sceneIds:[s.id],category:"carb",proteinValue:0,vegetableValue:0,carbValue:2,drinkRisk:0,satietyValue:2,speedValue:2});for(const name of s.drinkOptions)items.push({id:`${s.id}-d-${name}`,name,sceneIds:[s.id],category:"drink",proteinValue:name.includes("豆漿")||name.includes("拿鐵")?1:0,vegetableValue:0,carbValue:0,drinkRisk:name.includes("全糖")?2:name.includes("微糖")?1:0,satietyValue:1,speedValue:2})}
items.push(
  {id:"cafe-c-蛋糕",name:"蛋糕",sceneIds:["cafe"],category:"carb",proteinValue:0,vegetableValue:0,carbValue:1,drinkRisk:0,satietyValue:1,speedValue:2},
  {id:"cafe-d-甜咖啡",name:"甜咖啡",sceneIds:["cafe"],category:"drink",proteinValue:0,vegetableValue:0,carbValue:0,drinkRisk:2,satietyValue:0,speedValue:2}
);
export const eatingNavigationItems=items;
export const navigationGoals=["eatFull","comfort","quickSolution","controlDrink","preventNightOvereating","keepStable"] as const;
export const intakeFlags=["skippedBreakfast","smallLunch","lowProtein","lowVegetable","lowWater","alreadyAtePlenty","stableDay"] as const;
export const navigationTimes=["breakfast","lunch","afternoon","dinner","lateNight"] as const;
export const favoriteTags=["加班超商晚餐","早餐店快速版","超餓止損版","晚上 9 點版","飲料替換版","很趕版本"];
export const trapComboConfig=[{items:["沙拉","咖啡"],problem:"高飢餓時太輕",fix:"加蛋白質＋主食"},{items:["麵包","奶茶"],problem:"蛋白質不足、飲料偏甜",fix:"改無糖豆漿＋加蛋"},{items:["泡麵","含糖飲"],problem:"蔬菜不足、飲料風險高",fix:"加蛋／豆腐＋青菜＋換無糖"},{items:["只吃肉"],problem:"白天吃少時晚間可能繼續找食物",fix:"保留適量主食"},{items:["堅果","果汁"],problem:"份量難抓、飽足不一定穩",fix:"補完整餐食或明確蛋白質"},{items:["甜咖啡","蛋糕"],problem:"蛋白質不足、飲料糖度風險高，當正餐時飽足可能不穩",fix:"甜咖啡改無糖飲，並加三明治或明確蛋白質"}];
export const eatingNavigationCopy={title:"外食補給導航 Pro",subtitle:"到哪裡吃，都知道這一餐下一步該補什麼。",pdf:"/game-assets/pro-tools/eating-navigation/handbook.pdf",invalid:"此工具僅提供給已購買外食進階工具的使用者。"};
