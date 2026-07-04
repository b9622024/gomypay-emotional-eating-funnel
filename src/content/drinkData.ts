export type DrinkCategory="tea"|"milk"|"coffee"|"fruit"|"store";
export type DrinkFeeling="甜"|"奶香"|"咀嚼感"|"提神"|"冰涼"|"犒賞感"|"飽足感";
export type DrinkRisk={sugar:number;volume:number;topping:number;emptyStomach:number;dependency:number};
export type DrinkItem={id:string;name:string;category:DrinkCategory;tags:DrinkFeeling[];risks:DrinkRisk;riskExplanation:string;versions:{original:string;step1:string;stable:string;light:string};scenarioNotes:string[]};

export const drinkCategories:Record<DrinkCategory,string>={tea:"手搖茶類",milk:"奶茶與鮮奶類",coffee:"咖啡與提神類",fruit:"果汁與水果飲",store:"汽水、機能與超商類"};
export const feelingGuides:Record<DrinkFeeling,string>={甜:"你要的可能是放鬆與獎勵感，可以先保留甜度，但縮小杯量。",奶香:"先保留奶香，優先拿掉額外糖漿或奶精。",咀嚼感:"你要的可能不是整杯奶茶，而是口感本身，可先保留少量配料。",提神:"先確認是需要咖啡因，還是其實又累又餓；甜度不一定等於提神。",冰涼:"保留冰涼與氣泡感，糖度可以另外調整。",犒賞感:"犒賞可以保留，但一杯只留一個高滿足元素。",飽足感:"飲料很難取代完整餐食，真的餓時請搭配蛋白質與主食。"};

const d=(id:string,name:string,category:DrinkCategory,tags:DrinkFeeling[],risks:DrinkRisk,versions:DrinkItem["versions"],notes:string[]):DrinkItem=>({id,name,category,tags,risks,versions,scenarioNotes:notes,riskExplanation:`${risks.sugar>=4?"糖量是主要風險":risks.sugar>=2?"糖量需要留意":"糖量相對可控"}；${risks.topping>=3?"配料會再疊加糖與份量":"配料風險不高"}；${risks.dependency>=4?"若經常用它提神或安慰，容易形成固定依賴":"依賴風險取決於飲用頻率"}。`});
const v=(original:string,step1:string,stable:string,light:string)=>({original,step1,stable,light});
export const drinkItems:DrinkItem[]=[
 d("winter-melon","冬瓜茶","tea",["甜","冰涼"],{sugar:5,volume:3,topping:0,emptyStomach:1,dependency:3},v("大杯正常甜","中杯少甜","小杯半量冬瓜茶＋無糖茶","無糖茶"),["冬瓜茶底通常已含糖，不能只靠選無糖調整。"]),
 d("honey-lemon","蜂蜜檸檬","tea",["甜","冰涼"],{sugar:4,volume:3,topping:0,emptyStomach:2,dependency:2},v("大杯正常甜","中杯半糖","小杯微糖、少蜂蜜","無糖檸檬水或茶"),["空腹胃較敏感時，不建議只喝酸甜飲代替一餐。"]),
 d("fruit-tea","水果茶","tea",["甜","冰涼","犒賞感"],{sugar:4,volume:4,topping:1,emptyStomach:2,dependency:3},v("大杯全糖水果茶","中杯半糖、不加果露","小杯微糖茶底","無糖水果風味茶"),["果醬、果露與糖漿可能同時存在。"]),
 d("black-tea","紅茶","tea",["甜","提神"],{sugar:3,volume:3,topping:0,emptyStomach:2,dependency:3},v("大杯全糖紅茶","中杯半糖","小杯微糖紅茶","無糖紅茶"),["容易降階，適合先從杯量或甜度選一項調整。"]),
 d("green-tea","綠茶","tea",["提神","冰涼"],{sugar:2,volume:3,topping:0,emptyStomach:3,dependency:2},v("大杯半糖綠茶","中杯微糖","小杯無糖、少冰","無糖熱綠茶"),["空腹喝濃茶不舒服的人，建議搭配食物。"]),
 d("qing-tea","青茶","tea",["提神","冰涼"],{sugar:2,volume:3,topping:0,emptyStomach:2,dependency:2},v("大杯半糖青茶","中杯微糖","小杯無糖青茶","無糖熱青茶"),["茶香本身可保留儀式感，不一定需要靠高糖。"]),
 d("oolong","烏龍","tea",["提神","冰涼"],{sugar:2,volume:3,topping:0,emptyStomach:2,dependency:2},v("大杯半糖烏龍","中杯微糖","小杯無糖烏龍","無糖熱烏龍"),["適合從微糖逐步走向無糖。"]),
 d("pearl-milk-tea","珍珠奶茶","milk",["甜","奶香","咀嚼感","犒賞感"],{sugar:5,volume:5,topping:5,emptyStomach:2,dependency:5},v("大杯全糖＋正常珍珠","中杯半糖＋珍珠半份","小杯微糖鮮奶茶＋少量珍珠","無糖鮮奶茶不加料"),["想要咀嚼感時，可以保留半份珍珠，不必同時保留大杯與全糖。"]),
 d("fresh-milk-tea","鮮奶茶","milk",["奶香","甜","飽足感"],{sugar:3,volume:4,topping:1,emptyStomach:2,dependency:3},v("大杯全糖鮮奶茶","中杯半糖","小杯微糖鮮奶茶","無糖鮮奶茶"),["保留奶感時，最容易先拿掉的是額外糖與加料。"]),
 d("brown-sugar-milk","黑糖鮮奶","milk",["甜","奶香","犒賞感"],{sugar:5,volume:4,topping:3,emptyStomach:2,dependency:5},v("大杯黑糖鮮奶","中杯、黑糖減量","小杯半糖鮮奶","無糖鮮奶或拿鐵"),["黑糖紋路與糖漿本身就是高糖來源。"]),
 d("matcha-latte","抹茶拿鐵","milk",["奶香","犒賞感","提神"],{sugar:4,volume:3,topping:0,emptyStomach:2,dependency:3},v("大杯含糖抹茶拿鐵","中杯半糖","小杯微糖抹茶鮮奶","無糖抹茶鮮奶"),["抹茶粉可能已預拌糖，點餐時可先詢問。"]),
 d("hojicha-latte","焙茶拿鐵","milk",["奶香","犒賞感"],{sugar:3,volume:3,topping:0,emptyStomach:1,dependency:3},v("大杯含糖焙茶拿鐵","中杯半糖","小杯微糖焙茶鮮奶","無糖焙茶鮮奶"),["可優先保留茶香與奶香，降低額外甜度。"]),
 d("caramel-latte","焦糖拿鐵","coffee",["甜","奶香","提神","犒賞感"],{sugar:5,volume:3,topping:1,emptyStomach:4,dependency:5},v("大杯焦糖拿鐵","中杯、焦糖減半","小杯無糖拿鐵＋少量焦糖","無糖拿鐵或美式"),["咖啡因與甜味一起出現，容易形成疲憊時的固定迴路。"]),
 d("mocha","摩卡","coffee",["甜","奶香","提神"],{sugar:5,volume:3,topping:1,emptyStomach:4,dependency:4},v("大杯摩卡鮮奶油","中杯半糖、不加鮮奶油","小杯微糖摩卡","無糖拿鐵＋可可粉"),["巧克力醬、糖與鮮奶油可能同時疊加。"]),
 d("ready-coffee","即飲咖啡","coffee",["甜","提神"],{sugar:4,volume:2,topping:0,emptyStomach:4,dependency:4},v("一瓶含糖咖啡","選小瓶或低糖版","無加糖拿鐵","無糖咖啡＋真正點心"),["注意營養標示的每份與整瓶份數。"]),
 d("coffee-frappe","咖啡冰沙","coffee",["甜","提神","冰涼","犒賞感"],{sugar:5,volume:5,topping:2,emptyStomach:4,dependency:4},v("大杯咖啡冰沙＋鮮奶油","中杯、不加鮮奶油","小杯半糖咖啡冰沙","冰無糖拿鐵"),["冰沙更接近甜點，不適合當作單純提神飲。"]),
 d("latte","拿鐵","coffee",["奶香","提神","飽足感"],{sugar:1,volume:3,topping:0,emptyStomach:3,dependency:3},v("大杯加糖拿鐵","中杯半糖","小杯無糖拿鐵","美式＋少量鮮奶"),["無糖拿鐵仍有奶量，但通常比糖漿咖啡穩定。"]),
 d("americano","美式","coffee",["提神"],{sugar:0,volume:2,topping:0,emptyStomach:5,dependency:3},v("大杯空腹美式","中杯並搭食物","小杯美式＋水","低咖啡因或茶"),["糖風險低，但空腹刺激與咖啡因依賴需留意。"]),
 d("orange-juice","柳橙汁","fruit",["甜","冰涼"],{sugar:4,volume:3,topping:0,emptyStomach:2,dependency:2},v("大杯柳橙汁","中杯、加冰或水","小杯果汁＋完整餐食","水＋一份柳橙"),["果汁缺少完整水果的咀嚼感，杯量容易過多。"]),
 d("mixed-juice","綜合果汁","fruit",["甜","冰涼"],{sugar:5,volume:4,topping:0,emptyStomach:2,dependency:3},v("大杯加糖綜合果汁","中杯不加糖","小杯原汁加水","水＋一份水果"),["多種水果不代表糖量較低，額外加糖需先拿掉。"]),
 d("smoothie","果昔","fruit",["甜","冰涼","飽足感"],{sugar:4,volume:4,topping:1,emptyStomach:2,dependency:3},v("大杯果昔＋糖漿","中杯不加糖","小杯原味果昔搭蛋白質","優格＋整份水果"),["若當一餐，需要確認是否有蛋白質，而不只是水果。"]),
 d("grapefruit","葡萄柚飲","fruit",["甜","冰涼"],{sugar:4,volume:3,topping:0,emptyStomach:3,dependency:2},v("大杯全糖葡萄柚飲","中杯半糖","小杯微糖葡萄柚茶","無糖葡萄柚風味水"),["酸味常需要更多糖平衡，不能只憑喝起來清爽判斷。"]),
 d("passion-fruit","百香飲","fruit",["甜","冰涼","犒賞感"],{sugar:5,volume:4,topping:1,emptyStomach:3,dependency:3},v("大杯全糖百香飲","中杯半糖、不加果醬","小杯微糖百香茶","無糖茶＋少量百香果"),["果醬與糖漿是主要風險。"]),
 d("cola","可樂","store",["甜","冰涼","犒賞感"],{sugar:5,volume:4,topping:0,emptyStomach:3,dependency:5},v("大杯可樂","中杯或零糖版","小杯零糖氣泡飲","氣泡水"),["甜味、氣泡與配餐情境容易形成固定連結。"]),
 d("sprite","雪碧","store",["甜","冰涼"],{sugar:5,volume:4,topping:0,emptyStomach:3,dependency:4},v("大杯雪碧","中杯或零糖版","小杯零糖汽水","氣泡水＋檸檬"),["保留氣泡與冰涼感，通常比硬戒整杯容易。"]),
 d("sports-drink","運動飲料","store",["甜","冰涼"],{sugar:4,volume:4,topping:0,emptyStomach:1,dependency:3},v("一大瓶運動飲料","小瓶或加水稀釋","運動量大時再使用","一般久坐情境喝水"),["空腹刺激較低，但沒有大量流汗時，使用情境風險較高。"]),
 d("energy-drink","能量飲","store",["甜","提神"],{sugar:5,volume:2,topping:0,emptyStomach:5,dependency:5},v("一罐含糖能量飲","小罐或低糖版","無糖咖啡搭食物","休息、補水與正常餐食"),["高咖啡因、糖與疲憊情境同時出現，依賴風險高。"]),
 d("flavored-milk","調味乳","store",["甜","奶香","飽足感"],{sugar:4,volume:2,topping:0,emptyStomach:1,dependency:3},v("一大瓶調味乳","小瓶低糖版","鮮奶或無糖豆漿","水＋完整餐食"),["有蛋白質不代表可忽略額外糖量。"]),
 d("yogurt-drink","優酪乳","store",["甜","奶香"],{sugar:4,volume:2,topping:0,emptyStomach:2,dependency:3},v("一大瓶含糖優酪乳","小瓶低糖版","無加糖優格","無糖優格＋水果"),["健康形象容易讓人忽略含糖量與整瓶份量。"]),
 d("soy-milk","豆漿","store",["奶香","飽足感"],{sugar:2,volume:2,topping:0,emptyStomach:1,dependency:2},v("大瓶調味豆漿","中瓶低糖豆漿","無糖豆漿","無糖豆漿搭正餐"),["無糖豆漿可提供蛋白質，但很餓時仍不能完全取代正餐。"]),
 d("store-milk-tea","超商奶茶","store",["甜","奶香","犒賞感"],{sugar:5,volume:3,topping:0,emptyStomach:2,dependency:4},v("一大瓶超商奶茶","小瓶或低糖版","無糖拿鐵／無糖豆漿","無糖茶搭真正點心"),["即飲包裝容易一次喝完整瓶，請看整瓶糖量。"])
];

export const quickScenarios=[
 {id:"afternoon",title:"下午很累想提神",options:["無糖拿鐵＋蛋白質點心","無糖茶＋茶葉蛋","小杯微糖鮮奶茶、不加料"],advice:"先確認是不是午餐太少；需要補給時，不要只靠甜飲撐。"},
 {id:"stress",title:"壓力大就是想喝甜的",options:["小杯半糖茶","微糖鮮奶茶、不加料","熱茶＋一份水果"],advice:"可以保留甜，但先縮杯量，而且只留一個高滿足元素。"},
 {id:"hot",title:"天氣很熱想喝冰的",options:["無糖氣泡水","無糖茶少冰","微糖小杯水果茶"],advice:"你要的可能是冰涼感，先保留溫度，不必同時保留高糖。"},
 {id:"social",title:"聚餐想有參與感",options:["小杯微糖茶","零糖汽水","無糖茶＋少量配料"],advice:"聚餐可以喝，先決定杯量，避免續杯與加料一起出現。"},
 {id:"breakfast",title:"早餐一定要配飲料",options:["無糖豆漿","無糖拿鐵","微糖小杯紅茶"],advice:"早餐若只有飲料，請補蛋或其他真正食物。"},
 {id:"chew",title:"嘴饞想要咀嚼感",options:["鮮奶茶＋半份珍珠","無糖茶＋少量椰果","毛豆或水果＋無糖飲"],advice:"保留少量口感即可，不必同時選大杯、全糖與完整加料。"}
] as const;
export const favoriteContexts=["早餐","下午提神","聚餐","壓力大","很熱想喝冰的"];
export const defaultDrinkRules=["先看杯量，再看甜度，最後才看配料","想喝奶茶時，先改小杯或微糖","想喝甜又很餓時，要搭真正食物，不要只靠飲料撐","一杯飲料只保留一個高滿足元素","聚餐可喝，但平日不要每次疲累都靠甜飲"];
