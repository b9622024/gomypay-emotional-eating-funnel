import { emotionalEatingTypes,type EmotionalEatingType } from "./emotionalEatingQuiz";

export const kingdomCopy={name:"嘴饞迷霧王國",hero:"穿越嘴饞迷霧王國，解鎖你的減脂止損地圖",intro:"你不是沒有自制力，只是還沒有看見嘴饞迷霧背後的真正線索。這 7 天，你會穿越 7 個關卡；每完成一關，就解鎖一枚徽章，逐步看見時間、場景、情緒、營養與晚餐線索。"} as const;
export const routeProfiles:Record<EmotionalEatingType,{route:string;tools:string[];branch:string}>={stress_release:{route:"壓力止損路線",tools:["嘴饞前 3 分鐘身心連結工作本","10 分鐘嘴饞急救流程卡","安全零食與飲料替換清單"],branch:"stress"},fatigue_loss_control:{route:"營養補電路線",tools:["正念營養缺口掃描","下班後防暴食晚餐公式","外食補給導航 Pro"],branch:"nutrition"},compensation:{route:"情緒安撫路線",tools:["嘴饞前 3 分鐘身心連結工作本","安全零食與飲料替換清單","10 分鐘嘴饞急救流程卡"],branch:"stress"},boredom_habit:{route:"習慣迴路拆解路線",tools:["下班後嘴饞觸發點分析表","10 分鐘嘴饞急救流程卡","安全零食與飲料替換清單"],branch:"swap"},sugary_drink_dependency:{route:"飲料降糖路線",tools:["7 天含糖飲料重置表","含糖飲料替換清單 Pro","安全零食與飲料替換清單"],branch:"drink"},nutrition_gap:{route:"白天營養補洞路線",tools:["正念營養缺口掃描","下班後防暴食晚餐公式","外食補給導航 Pro"],branch:"nutrition"}};
export const branches={drink:{name:"飲料降糖支線",tool:"7 天含糖飲料重置表",path:"drink-reset",clues:["飲料觸發線索"],badge:"專屬支線徽章",description:"找出最容易想喝飲料的時間、情緒與情境。",question:"你下午很累，很想喝珍珠奶茶。哪個選擇最適合當第一步？",options:["直接全糖珍奶","小杯鮮奶茶，微糖，不加料","完全不喝，硬忍到晚上","改喝果汁"],correct:1,feedback:"真正容易執行的降糖，是先降糖、拿掉加料、縮小杯型。"},nutrition:{name:"營養補洞支線",tool:"正念營養缺口掃描",path:"mindful-nutrition-tracker",clues:["營養缺口線索"],badge:"專屬支線徽章",description:"檢查早餐、午餐、蛋白質、水量與下午疲憊。",question:"早餐只喝咖啡、午餐吃很少，晚上很想暴食。最優先要補的是？",options:["晚上完全不吃澱粉","下午先補蛋白質和水","晚上只吃水果","只靠意志力撐過去"],correct:1,feedback:"晚上失控有時不是晚上才開始，而是白天補給不足一路累積。"},stress:{name:"壓力止損支線",tool:"10 分鐘嘴饞急救流程卡",path:"craving-rescue",clues:["壓力止損線索"],badge:"專屬支線徽章",description:"遇到強烈嘴饞時，先完成一次暫停流程。",question:"壓力很大時突然想吃甜食，第一個動作最適合是？",options:["立刻吃，今天很累沒關係","先停 3 分鐘，辨認是真的餓或想放鬆","責備自己沒自制力","晚餐不吃補回來"],correct:1,feedback:"壓力型嘴饞最需要的不是責備，而是先暫停，讓大腦重新選擇。"},swap:{name:"安全替換支線",tool:"安全零食與飲料替換清單",path:"safe-swap-list",clues:["安全替換線索"],badge:"專屬支線徽章",description:"找出比較不容易一路失控的替代選項。",question:"晚上想吃洋芋片，哪個替換比較穩？",options:["拿整包邊追劇邊吃","海苔或毛豆，先分裝","完全不吃，餓到睡覺","改吃一大包堅果"],correct:1,feedback:"可執行的替換不是完全禁止，而是先選比較不容易失控的版本。"}} as const;

export const levels=[
{level:1,name:"時間迷霧",task:"用時間雷達找出一天中最容易嘴饞的高風險時間",tool:"時間雷達",path:"trigger-analysis",clues:["破功時間線索"],badge:"時間偵探徽章",icon:"🕒",points:10,story:"嘴饞迷霧通常不是隨機出現。它常在同一時間悄悄靠近，例如下午、下班前、晚餐後或睡前。",learning:"嘴饞常是固定時間點的疲憊、壓力或能量不足累積出來的結果。",feedback:"你已穿越時間迷霧，看見嘴饞最常出現的時間。"},
{level:2,name:"場景迷宮",task:"找出最容易啟動嘴饞的場景與觸發組合",tool:"場景觸發分析器",path:"trigger-analysis",clues:["高風險場景線索"],badge:"場景偵探徽章",icon:"🔍",points:10,story:"有些嘴饞不是來自肚子，而是來自場景。沙發、超商、外送 App 或追劇，都可能讓迷霧自動升起。",learning:"很多嘴饞不是靠意志力解決，而是要先改變環境。",feedback:"你已穿越場景迷宮，看見嘴饞最容易出現的地方。"},
{level:3,name:"情緒之門",task:"用身心訊號解碼器辨認真正需求",tool:"嘴饞前 3 分鐘身心連結工作本",path:"three-minute-check",clues:["情緒線索","身體訊號線索"],badge:"身心連結徽章",icon:"🌿",points:10,story:"嘴饞迷霧最會偽裝成「我想吃」，背後卻可能是餓、累、壓力、委屈或想被安慰。",learning:"先辨認身體與情緒訊號，就比較不容易直接進入自動反應。",feedback:"你已穿越情緒之門，看見嘴饞背後真正的訊號。"},
{level:4,name:"支線岔路",task:"完成支線試煉，選出目前最需要優先處理的問題",tool:"專屬支線試煉",path:"",clues:["專屬支線線索"],badge:"專屬支線徽章",icon:"🛤️",points:10,story:"前三關讓你看見時間、場景與訊號。現在迷霧王國出現四條支線，系統會推薦一條，你也可以自行選擇。",learning:"每個人不必做同一件事，先處理最常卡住的支線更實際。",feedback:"你已穿越支線岔路，選出最適合自己的破關方向。"},
{level:5,name:"補給裂縫",task:"用營養補洞盤檢查白天補給是否影響晚上嘴饞",tool:"正念營養缺口掃描",path:"mindful-nutrition-tracker",clues:["營養缺口線索"],badge:"營養補洞徽章",icon:"🥗",points:10,story:"很多晚上的嘴饞，裂縫其實從白天開始：早餐太空、午餐太少、水與蛋白質不足。",learning:"晚上不穩有時不是晚上的問題，而是白天補給不足累積的結果。",feedback:"你已修補補給裂縫，看見白天營養和晚上嘴饞的關係。"},
{level:6,name:"晚餐防線",task:"讀取前五關線索，用場景專屬卡庫建立三座晚餐防線",tool:"下班後防暴食晚餐公式",path:"dinner-formula",clues:["晚餐備案線索"],badge:"晚餐穩定徽章",icon:"🍱",points:10,story:"下班後不是你不努力，而是太累、太餓，又沒有準備好的選項。今天要依照你的場景與前五關線索，建立不用重新思考的晚餐防線。",learning:"不是每個場景都硬套同一個餐盤；符合當下飢餓、營養缺口與外食條件，才是能長期使用的防線。",feedback:"你已完成三座晚餐防線，準備好能在不同情境直接使用的選擇。"},
{level:7,name:"迷霧核心",task:"確認六張線索卡，生成自己的個人止損地圖",tool:"止損地圖拼圖",path:"map",clues:["個人止損地圖"],badge:"止損地圖完成徽章",icon:"🗺️",points:60,story:"你已穿越前六關。現在不是證明意志力，而是把所有線索拼起來，看見自己的破關路線。",learning:"你現在不是盲目調整，而是擁有一張屬於自己的止損地圖。",feedback:"你已破解迷霧核心，完成自己的個人止損地圖。"}
] as const;

export function normalizeType(value:string|null|undefined):EmotionalEatingType|null{const type=value?.split(",")[0] as EmotionalEatingType;return type&&type in routeProfiles?type:null}
export function typeName(value:string|null|undefined){const t=normalizeType(value);return t?emotionalEatingTypes[t].name:"尚未判定"}
export function recommendation(primary:string|null|undefined){const t=normalizeType(primary);return t?routeProfiles[t]:null}
export function completionFeedback(levelNumber:number){const level=levels[levelNumber-1],next=levels[levelNumber];if(!level)return "關卡已完成。";return `你已獲得「${level.badge}」。這枚徽章代表你已經看見一個新的嘴饞線索，離破解迷霧核心又更近一步。${next?` 下一關預告：第 ${next.level} 關｜${next.name}。`:" 你的個人止損地圖已完成。"}`}
const filled=(v:unknown)=>typeof v==="string"&&v.trim().length>0,arr=(v:unknown)=>Array.isArray(v)?v:[];
export function validateBreakthroughLevel(n:number,u:Record<string,unknown>={},map:Record<string,unknown>={}){
 if(n===1&&(arr(u.selectedTimes).length<1||!filled(u.primaryTime)))return "請選擇嘴饞時間並指定主要高風險時間";
 if(n===2&&(arr(u.selectedScenes).length<1||arr(u.selectedTriggers).length<1))return "請至少選擇一個場景與一個觸發卡";
 if(n===3&&!filled(u.selectedState))return "請完成身心訊號評分並選擇最接近的狀態";
 if(n===4&&!filled(u.selectedAnswer))return "請完成支線試煉";
 if(n===5&&["breakfastScore","lunchScore","waterScore","proteinScore","afternoonEnergyScore"].some(k=>typeof u[k]!=="number"))return "請完成 5 項營養補洞評分";
 if(n===6){const b=arr(u.savedDinnerBackups) as Array<Record<string,unknown>>;if(b.length<3)return "請至少建立 3 組晚餐備案";if(b.some(x=>!x||!filled(x.name)||!x.analysisResult||typeof x.score!=="number"))return "每組備案都需要名稱並完成分析";if(new Set(b.map(x=>String(x.scenarioType||""))).size<2)return "3 組備案至少需要包含 2 種不同情境"}
 if(n===7){const required=["highRiskTime","highRiskScene","mainEmotion","nutritionGap","firstRescueAction","nextWeekAction"];if(required.some(k=>!filled(map[k])))return "請確認止損地圖的六張線索卡與下週任務";const b=arr(map.dinnerBackups);if(b.length<3)return "請確認 3 組晚餐備案"}
 return null;
}
