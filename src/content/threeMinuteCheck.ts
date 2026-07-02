export const threeMinuteCheckContent={
  name:"嘴饞前 3 分鐘身心連結工作本",
  positioning:"這不是 7 天完整訓練，而是嘴饞當下可以立刻打開使用的 3 分鐘覺察工具。",
  sec:[{key:"S",title:"Stop 停一下",text:"中斷自動反應，不急著下單、不急著打開冰箱、不急著拿食物。"},{key:"E",title:"Examine 看一下",text:"檢查身體、情緒、疲憊、壓力與飢餓程度。"},{key:"C",title:"Choose 選一下",text:"根據真正需求，選擇吃、喝、休息、補水、放鬆，或啟動 10 分鐘急救流程。"}],
  start:{title:"嘴饞前，先停 3 分鐘",text:"你不需要立刻決定能不能吃。先用 3 分鐘看懂自己現在真正需要的是什麼。",button:"開始檢查",newButton:"新增一筆 3 分鐘檢查",resumeButton:"繼續上次未完成的檢查"},
  context:{title:"現在想吃或想喝什麼？",cravingItem:"我現在想吃或想喝什麼？",cravingPlaceholder:"例如：奶茶、餅乾、炸物、宵夜、甜食",location:"我現在在哪裡？",locationPlaceholder:"例如：公司、家裡、通勤路上、便利商店前",beforeActivity:"嘴饞出現前，我正在做什麼？",activityPlaceholder:"例如：剛下班、剛被主管催、正在滑手機、剛吃完晚餐"},
  body:{title:"第 1 分鐘：停一下，回到身體",description:"先不要下單、不要打開冰箱。做 3 次深呼吸，再看身體現在有什麼訊號。",signals:["胃空","胃脹","胃緊","胸口悶","肩頸緊繃","頭腦很累","嘴巴想咬東西","想喝甜的","全身能量低","沒特別感覺"],hunger:"身體飢餓程度",mouth:"嘴巴想吃程度",fatigue:"全身疲憊程度"},
  emotion:{title:"第 2 分鐘：看一下，我真正需要什麼？",stress:"壓力程度",comfort:"情緒需要被安慰的程度",sugaryDrink:"想喝含糖飲料的程度",tags:["壓力太大","很疲憊","心情委屈","有點焦慮","很無聊","想獎勵自己","想被安慰","真的餓","喝飲料成習慣","不確定"],needTypes:["我比較需要食物","我比較需要休息","我比較需要放鬆","我比較需要安慰","我比較需要補水","我比較需要轉移注意力","我不確定"],needLabel:"此刻我比較需要的是？"},
  choose:{title:"第 3 分鐘：選一個比較照顧自己的行動",actionLabel:"我願意先做的行動",actions:["喝 300ml 水","走路 3 分鐘","做 5 次深呼吸","泡熱茶","寫下情緒","洗澡或泡腳","傳訊息給信任的人","選擇正常正餐或安全食物","糖度降一階或飲料改小杯","啟動 10 分鐘急救流程"],changeLabel:"3 分鐘後，嘴饞有變化嗎？",changes:["降低","一樣","更強","還不確定"],finalChoice:"如果最後還是吃了或喝了，我選了什麼？",selfReminder:"我想給自己的提醒"},
  nav:{back:"上一頁",next:"下一步",finish:"查看我的 3 分鐘結果",saving:"自動儲存中…",saved:"已自動儲存"},
  result:{title:"你的 3 分鐘檢查結果",chosen:"你剛剛選擇的行動",rescueCta:"啟動 10 分鐘急救流程",workbookCta:"回到 7 天嘴饞止損工作本",aiCta:"前往 AI 能量減脂初評",disclaimer:"此結果僅作為自我觀察與生活習慣調整參考，不能取代醫療診斷或治療。"},
  history:{title:"最近 10 筆紀錄",empty:"完成第一筆 3 分鐘檢查後，紀錄會顯示在這裡。",item:"想吃或想喝",action:"選擇行動",change:"嘴饞變化"},
  errors:{invalid:"這個工具包連結無效、尚未付款，或未包含主商品。請回到購買信件中的專屬連結，或聯絡客服協助。",load:"目前無法讀取紀錄，請稍後再試。",save:"目前無法儲存，請確認網路後再試。"}
} as const;

export const resultTypes={
  true_hunger:{name:"真餓型",text:"你現在比較像是真的餓。這種情況不需要硬忍，建議選擇正常正餐或安全食物，避免餓太久後失控。",action:"選擇蛋白質＋蔬菜＋適量澱粉，或先吃一份穩定點心。"},
  stress_eating:{name:"壓力想吃型",text:"你現在比較像是壓力想吃。你需要的可能不是食物本身，而是一個壓力出口。",action:"先做 5 次深呼吸、走路 3 分鐘，或寫下讓你煩的事情。"},
  fatigue_eating:{name:"疲憊想吃型",text:"你現在比較像是疲憊想吃。身體太累時，會更難做出穩定選擇。",action:"先休息 10 分鐘、泡熱茶，或選擇不用思考的穩定晚餐備案。"},
  comfort_need:{name:"情緒安慰型",text:"你現在比較像是情緒需要被安慰。你真正想補的，可能不是熱量，而是被照顧感。",action:"傳訊息給信任的人、聽音樂、寫下情緒，或用非食物方式安慰自己。"},
  boredom_habit:{name:"無聊習慣型",text:"你現在比較像是無聊或習慣性嘴饞。這不一定是身體真的需要食物，而是大腦進入固定情境後自動想吃。",action:"先刷牙、整理桌面、走動 3 分鐘，或把零食從手邊移開。"},
  sugary_drink:{name:"想喝飲料型",text:"你現在比較像是含糖飲料衝動。你想要的可能是提神、放鬆、儀式感或獎勵感。",action:"先喝 300ml 水，10 分鐘後再決定。若仍想喝，可以糖度降一階、拿掉加料或改小杯。"},
  mixed:{name:"混合型",text:"你現在比較像是混合型嘴饞。可能同時有壓力、疲憊、情緒安慰或飲料衝動。",action:"先選最容易做的一步：喝水、深呼吸、離開原本情境 3 分鐘。"},
  unclear:{name:"不確定型",text:"目前訊號還不明顯。你可以先喝水、做 3 次深呼吸，稍等 10 分鐘再判斷。",action:"先做一個負擔最低的小行動，10 分鐘後再檢查一次。"}
} as const;
export type ThreeMinuteResultType=keyof typeof resultTypes;

export type ThreeMinuteData={id?:string;cravingItem?:string;location?:string;beforeActivity?:string;bodySignals:string[];hungerScore:number;mouthCravingScore:number;fatigueScore:number;stressScore:number;comfortNeedScore:number;sugaryDrinkScore:number;emotionTags:string[];needType?:string;chosenAction?:string;cravingChange?:string;finalChoice?:string;selfReminder?:string;resultType?:ThreeMinuteResultType|null;createdAt?:string;updatedAt?:string};
export const emptyThreeMinuteData:ThreeMinuteData={bodySignals:[],hungerScore:0,mouthCravingScore:0,fatigueScore:0,stressScore:0,comfortNeedScore:0,sugaryDrinkScore:0,emotionTags:[]};

export function determineThreeMinuteResult(data:ThreeMinuteData):ThreeMinuteResultType{
  const high=[data.hungerScore,data.fatigueScore,data.stressScore,data.comfortNeedScore,data.sugaryDrinkScore].filter(score=>score>=7).length;
  if(high>=2)return "mixed";
  if(data.hungerScore>=7&&data.mouthCravingScore<=data.hungerScore+1)return "true_hunger";
  if(data.stressScore>=7&&data.hungerScore<=5)return "stress_eating";
  if(data.fatigueScore>=7)return "fatigue_eating";
  if(data.comfortNeedScore>=7||data.emotionTags.some(tag=>["心情委屈","想被安慰","想獎勵自己"].includes(tag)))return "comfort_need";
  if(data.emotionTags.includes("很無聊")&&data.hungerScore<=5)return "boredom_habit";
  if(data.sugaryDrinkScore>=7||data.emotionTags.includes("喝飲料成習慣"))return "sugary_drink";
  return "unclear";
}
