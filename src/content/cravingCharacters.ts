import type { EmotionalEatingType } from "./emotionalEatingQuiz";

export type CravingCharacter = {
  typeKey: EmotionalEatingType;
  originalTypeName: string;
  characterName: string;
  characterDescription: string;
  recommendedRoute: string;
  primaryTools: string[];
  accentIcon: string;
};

export const cravingCharacters: Record<EmotionalEatingType, CravingCharacter> = {
  stress_release: { typeKey:"stress_release", originalTypeName:"壓力釋放型", characterName:"壓力法師", characterDescription:"壓力一高，就容易用食物或飲料釋放情緒，需要學會先降低壓力強度。", recommendedRoute:"壓力止損路線", primaryTools:["嘴饞前 3 分鐘身心連結工作本","10 分鐘嘴饞急救流程卡","安全零食與飲料替換清單"], accentIcon:"🪄" },
  fatigue_loss_control: { typeKey:"fatigue_loss_control", originalTypeName:"疲憊失控型", characterName:"能量騎士", characterDescription:"白天耗電過度，下班後最容易失控，需要先補足能量與晚餐防線。", recommendedRoute:"營養補電路線", primaryTools:["正念營養缺口掃描","下班後防暴食晚餐公式","7 天外食防暴食菜單"], accentIcon:"🛡️" },
  compensation: { typeKey:"compensation", originalTypeName:"委屈補償型", characterName:"療癒牧師", characterDescription:"情緒委屈或覺得辛苦時，容易用食物補償自己，需要建立更溫和的安撫方式。", recommendedRoute:"情緒安撫路線", primaryTools:["嘴饞前 3 分鐘身心連結工作本","安全零食與飲料替換清單","10 分鐘嘴饞急救流程卡"], accentIcon:"🌙" },
  boredom_habit: { typeKey:"boredom_habit", originalTypeName:"無聊習慣型", characterName:"習慣遊俠", characterDescription:"嘴饞常出現在固定時間與固定場景，需要破解自動化習慣路線。", recommendedRoute:"習慣迴路拆解路線", primaryTools:["下班後嘴饞觸發點分析表","10 分鐘嘴饞急救流程卡","安全零食與飲料替換清單"], accentIcon:"🏹" },
  sugary_drink_dependency: { typeKey:"sugary_drink_dependency", originalTypeName:"含糖飲料依賴型", characterName:"飲料鍊金師", characterDescription:"手搖飲、甜咖啡或吃飯配飲料容易變成固定迴路，需要學會飲料降糖與點餐策略。", recommendedRoute:"飲料降糖路線", primaryTools:["7 天含糖飲料重置表","含糖飲料替換清單 Pro","安全零食與飲料替換清單"], accentIcon:"⚗️" },
  nutrition_gap: { typeKey:"nutrition_gap", originalTypeName:"營養不足型", characterName:"補給守衛", characterDescription:"白天吃得太少或營養不穩，晚上容易爆餓，需要建立穩定補給節奏。", recommendedRoute:"白天營養補洞路線", primaryTools:["正念營養缺口掃描","下班後防暴食晚餐公式","7 天外食防暴食菜單"], accentIcon:"🥗" },
};

export function getCravingCharacter(type: string | null | undefined) {
  const key = type?.split(",")[0] as EmotionalEatingType;
  return cravingCharacters[key] ?? null;
}
