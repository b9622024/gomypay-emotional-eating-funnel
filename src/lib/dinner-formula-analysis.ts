import { normalizeBranchKey, type BranchKey } from "../content/branchRoutes";

export type DaytimeIntakeStatus =
  | "breakfast_and_lunch_stable"
  | "breakfast_insufficient"
  | "lunch_insufficient"
  | "both_insufficient"
  | "almost_no_food";

export type DinnerTimeBand = "early_dinner" | "normal_dinner" | "late_dinner";

export type TonightConcern =
  | "still_hungry_later"
  | "overeating"
  | "sugary_drink"
  | "emotional_reward"
  | "screen_eating";

export type DinnerFormulaInput = {
  hungerScore?: number;
  fatigueScore?: number;
  stressScore?: number;
  currentStates?: string[];
  mealScene?: string;
  proteinChoice?: string;
  vegetableChoice?: string;
  carbChoice?: string;
  drinkChoice?: string;
  closingAction?: string;
  daytimeIntakeStatus?: DaytimeIntakeStatus;
  dinnerTimeBand?: DinnerTimeBand;
  tonightConcerns?: TonightConcern[];
};

export type DinnerJourneyContext = {
  characterName?: string | null;
  originalTypeName?: string | null;
  timePatternType?: string | null;
  hungerScore?: number | null;
  fatigueScore?: number | null;
  stressScore?: number | null;
  triggerType?: string | null;
  highRiskScenes?: string[];
  decodedSignalType?: string | null;
  selectedBranch?: BranchKey | string | null;
  secondaryBranch?: BranchKey | string | null;
  totalNutritionScore?: number | null;
  nutritionGapTypes?: string[];
  lowestItems?: string[];
};

export type NormalizedDinnerSelection = {
  proteinLevel: 0 | 1 | 2;
  vegetableLevel: 0 | 1 | 2;
  carbLevel: 0 | 1 | 2;
  drinkLevel: 0 | 1 | 2;
  proteinLabel: string;
  vegetableLabel: string;
  carbLabel: string;
  drinkLabel: string;
  highRewardCount: number;
  hasSweetDrink: boolean;
  hasFriedOrRewardProtein: boolean;
};

export type DinnerFormulaResult = {
  totalScore: number;
  scoreLevel: "weak" | "basic" | "stable" | "high_fit";
  dinnerMode: "high_hunger_refill" | "fatigue_rescue" | "late_light" | "emotional_reward" | "habit_screen" | "drink_loop" | "balanced";
  analysisSummary: string;
  strengths: string[];
  vulnerabilities: string[];
  crossLevelInsights: string[];
  minimalUpgrade: null | {
    title: string;
    reason: string;
    actionType: "add_protein" | "add_vegetable" | "add_carb" | "change_drink" | "reduce_reward_stack";
    suggestedItem: string;
    scoreBefore: number;
    scoreAfter: number;
  };
  practicalDinnerAdvice: string;
  afterDinnerTip: string;
  dinnerVariations: {
    bestFit: string;
    easiest: string;
    minimumRescue: string;
  };
  scoreBreakdown: {
    proteinFit: number;
    vegetableFit: number;
    carbFit: number;
    drinkFit: number;
    hungerFit: number;
    daytimeIntakeFit: number;
    dinnerTimeFit: number;
    cravingRiskFit: number;
  };
  normalized: NormalizedDinnerSelection;
};

const clamp = (n: number, min = 0, max = 100) => Math.max(min, Math.min(max, Math.round(n)));
const includesAny = (value: string, words: string[]) => words.some(word => value.includes(word));
const list = (value: unknown) => Array.isArray(value) ? value.map(String) : [];
const score = (value: unknown, fallback = 5) => typeof value === "number" && Number.isFinite(value) ? value : fallback;

export function buildDinnerContext(input: DinnerFormulaInput = {}, journey?: DinnerJourneyContext | null): Required<Pick<DinnerFormulaInput, "hungerScore" | "fatigueScore" | "stressScore">> & {
  daytimeIntakeStatus: DaytimeIntakeStatus;
  dinnerTimeBand: DinnerTimeBand;
  tonightConcerns: TonightConcern[];
  journey: DinnerJourneyContext | null;
  selectedBranch: BranchKey | null;
  carbNeeded: boolean;
  carbFlexible: boolean;
} {
  const hungerScore = score(input.hungerScore ?? journey?.hungerScore);
  const fatigueScore = score(input.fatigueScore ?? journey?.fatigueScore);
  const stressScore = score(input.stressScore ?? journey?.stressScore);
  const daytimeIntakeStatus = input.daytimeIntakeStatus ?? inferDaytimeStatus(journey);
  const dinnerTimeBand = input.dinnerTimeBand ?? "normal_dinner";
  const tonightConcerns = (input.tonightConcerns?.length ? input.tonightConcerns : inferConcerns(input, journey)) as TonightConcern[];
  const selectedBranch = journey?.selectedBranch ? normalizeBranchKey(journey.selectedBranch) : null;
  const carbNeeded = hungerScore >= 7 || ["lunch_insufficient", "both_insufficient", "almost_no_food"].includes(daytimeIntakeStatus) || journey?.timePatternType === "dinnerBeforeCrash" || Number(journey?.totalNutritionScore ?? 10) <= 6;
  const carbFlexible = hungerScore <= 3 && dinnerTimeBand === "late_dinner" && daytimeIntakeStatus === "breakfast_and_lunch_stable";
  return { hungerScore, fatigueScore, stressScore, daytimeIntakeStatus, dinnerTimeBand, tonightConcerns, journey: journey ?? null, selectedBranch, carbNeeded, carbFlexible };
}

function inferDaytimeStatus(journey?: DinnerJourneyContext | null): DaytimeIntakeStatus {
  const gaps = list(journey?.nutritionGapTypes).join(" ");
  const lows = list(journey?.lowestItems).join(" ");
  if (Number(journey?.totalNutritionScore ?? 10) <= 3) return "both_insufficient";
  if (/午餐|lunch/.test(gaps + lows)) return "lunch_insufficient";
  if (/早餐|breakfast/.test(gaps + lows)) return "breakfast_insufficient";
  return "breakfast_and_lunch_stable";
}

function inferConcerns(input: DinnerFormulaInput, journey?: DinnerJourneyContext | null): TonightConcern[] {
  const concerns: TonightConcern[] = [];
  const states = (input.currentStates ?? []).join(" ");
  const branch = journey?.selectedBranch ? normalizeBranchKey(journey.selectedBranch) : null;
  if (states.includes("飲料") || branch === "drink_loop") concerns.push("sugary_drink");
  if (states.includes("很煩") || branch === "stress_rescue") concerns.push("emotional_reward");
  if (branch === "habit_break") concerns.push("screen_eating");
  if ((input.hungerScore ?? 0) >= 7 || journey?.timePatternType === "dinnerBeforeCrash") concerns.push("still_hungry_later");
  return [...new Set(concerns)].slice(0, 2);
}

export function normalizeDinnerSelection(input: DinnerFormulaInput, context = buildDinnerContext(input)): NormalizedDinnerSelection {
  const protein = input.proteinChoice ?? "";
  const vegetable = input.vegetableChoice ?? "";
  const carb = input.carbChoice ?? "";
  const drink = input.drinkChoice ?? "";
  const highProtein = ["雞胸", "雞腿", "魚", "豆腐", "肉片", "燙肉片", "雞肉", "瘦肉", "無糖豆漿", "鮪魚", "毛豆", "牛肉", "豬肉", "里肌", "烤雞腿", "滷雞腿"];
  const lowProtein = ["茶葉蛋", "溏心蛋", "滷蛋", "雞蛋", "豆干", "魚丸", "貢丸", "肉鬆", "加工肉"];
  const proteinLevel: 0 | 1 | 2 = !protein ? 0 : includesAny(protein, highProtein) ? 2 : includesAny(protein, lowProtein) ? (context.hungerScore >= 7 ? 1 : 2) : 1;
  const vegetableLevel: 0 | 1 | 2 = !vegetable ? 0 : /0 格|沒有|若沒有/.test(vegetable) ? 0 : /多夾|多菜|2|3|沙拉|燙青菜|青菜|蔬菜|生菜|菇|菜盤/.test(vegetable) ? 2 : 1;
  const carbLevel: 0 | 1 | 2 = !carb || /不吃|沒有/.test(carb) ? 0 : /半|少量|減量|小份|地瓜|飯糰|玉米|吐司/.test(carb) ? 1 : 2;
  const stableDrink = ["水", "無糖茶", "無糖豆漿", "無糖咖啡", "無糖拿鐵", "黑咖啡", "無糖飲", "氣泡水"];
  const mediumDrink = ["微糖", "小杯", "少糖", "豆漿", "咖啡"];
  const highDrink = ["全糖", "大杯", "奶茶", "含糖", "汽水", "加料", "甜咖啡", "黑糖"];
  const drinkLevel: 0 | 1 | 2 = !drink ? 0 : includesAny(drink, stableDrink) ? 2 : includesAny(drink, highDrink) ? 0 : includesAny(drink, mediumDrink) ? 1 : 1;
  const hasSweetDrink = drinkLevel === 0 && Boolean(drink);
  const hasFriedOrRewardProtein = includesAny(protein, ["炸", "排骨", "雞排", "鹽酥", "甜點"]);
  return {
    proteinLevel,
    vegetableLevel,
    carbLevel,
    drinkLevel,
    proteinLabel: protein || "未選蛋白質",
    vegetableLabel: vegetable || "未選蔬菜",
    carbLabel: carb || "未選主食",
    drinkLabel: drink || "未選飲料",
    highRewardCount: Number(hasSweetDrink) + Number(hasFriedOrRewardProtein),
    hasSweetDrink,
    hasFriedOrRewardProtein,
  };
}

export function calculateMealStructureScore(normalized: NormalizedDinnerSelection, context: ReturnType<typeof buildDinnerContext>) {
  const proteinFit = normalized.proteinLevel === 2 ? 20 : normalized.proteinLevel === 1 ? (context.hungerScore >= 7 ? 8 : 12) : 0;
  const vegetableFit = normalized.vegetableLevel === 2 ? 15 : normalized.vegetableLevel === 1 ? 8 : 0;
  const carbFit = context.carbNeeded ? (normalized.carbLevel === 2 ? 15 : normalized.carbLevel === 1 ? 13 : 0) : context.carbFlexible ? (normalized.carbLevel === 0 ? 13 : normalized.carbLevel === 1 ? 15 : 12) : (normalized.carbLevel === 0 ? 8 : normalized.carbLevel === 1 ? 14 : 15);
  const drinkFit = normalized.drinkLevel === 2 ? 10 : normalized.drinkLevel === 1 ? 6 : 0;
  return { proteinFit, vegetableFit, carbFit, drinkFit };
}

export function calculateTonightFitScore(normalized: NormalizedDinnerSelection, context: ReturnType<typeof buildDinnerContext>) {
  const hungerFit = context.hungerScore >= 7 ? (normalized.proteinLevel > 0 && normalized.carbLevel > 0 ? 10 : normalized.proteinLevel > 0 ? 4 : 2) : context.hungerScore <= 3 ? (normalized.proteinLevel > 0 && normalized.drinkLevel >= 1 ? 10 : 6) : (normalized.proteinLevel > 0 ? 9 : 5);
  const daytimeIntakeFit = ["lunch_insufficient", "both_insufficient", "almost_no_food"].includes(context.daytimeIntakeStatus) ? (normalized.proteinLevel > 0 && normalized.carbLevel > 0 ? 10 : 4) : normalized.proteinLevel > 0 ? 10 : 6;
  const dinnerTimeFit = context.dinnerTimeBand === "late_dinner" && context.hungerScore <= 4 ? (normalized.proteinLevel > 0 && normalized.drinkLevel >= 1 && normalized.highRewardCount === 0 ? 10 : 6) : normalized.highRewardCount >= 2 ? 5 : 8;
  const cravingRiskFit = context.tonightConcerns.includes("sugary_drink") || context.selectedBranch === "drink_loop" ? (normalized.drinkLevel === 2 ? 10 : normalized.drinkLevel === 1 ? 7 : 2) : context.tonightConcerns.includes("emotional_reward") || context.selectedBranch === "stress_rescue" ? (normalized.highRewardCount >= 2 ? 2 : normalized.highRewardCount === 1 ? 6 : 9) : context.tonightConcerns.includes("screen_eating") || context.selectedBranch === "habit_break" ? (normalized.proteinLevel > 0 && normalized.drinkLevel >= 1 ? 8 : 5) : 9;
  return { hungerFit, daytimeIntakeFit, dinnerTimeFit, cravingRiskFit };
}

export function analyzeDinnerVulnerabilities(input: DinnerFormulaInput, normalized: NormalizedDinnerSelection, context: ReturnType<typeof buildDinnerContext>) {
  const vulnerabilities: string[] = [];
  const strengths: string[] = [];
  if (normalized.proteinLevel === 2) strengths.push("已經有一份明確蛋白質，晚餐後飽足感比較有基礎。");
  if (normalized.vegetableLevel === 2) strengths.push("有加入蔬菜或高纖選項，整體體積感比較完整。");
  if (normalized.carbLevel > 0 && context.carbNeeded) strengths.push("有保留主食，對今晚高飢餓或白天吃不穩的狀態更友善。");
  if (normalized.drinkLevel === 2) strengths.push("飲料選擇穩定，能降低飯後甜飲延續嘴饞的機率。");
  if (normalized.proteinLevel === 0) vulnerabilities.push("蛋白質不足，這份晚餐可能不容易撐住晚餐後的飽足感。");
  if (normalized.proteinLevel === 1 && context.hungerScore >= 7) vulnerabilities.push("蛋白質偏少；以你今晚的飢餓程度，只靠少量蛋或豆干可能不夠穩。");
  if (normalized.vegetableLevel === 0) vulnerabilities.push("蔬菜與高纖不足，晚餐體積感偏低，容易吃完還覺得空。");
  if (normalized.carbLevel === 0 && context.carbNeeded) vulnerabilities.push("主食不足；你今晚或前面飲食線索顯示需要適量補給，完全不吃主食可能讓晚點又想找食物。");
  if (normalized.drinkLevel === 0) vulnerabilities.push("飲料是目前最大風險之一，含糖或加料飲可能讓晚餐後嘴饞延續。");
  if (context.selectedBranch === "stress_rescue" && normalized.highRewardCount >= 2) vulnerabilities.push("高滿足元素疊加較多，這份晚餐可能變成壓力犒賞出口。");
  return { strengths, vulnerabilities };
}

export function generateMinimalUpgrade(input: DinnerFormulaInput, context: ReturnType<typeof buildDinnerContext>, normalized: NormalizedDinnerSelection, scoreBefore: number): DinnerFormulaResult["minimalUpgrade"] {
  let actionType: NonNullable<DinnerFormulaResult["minimalUpgrade"]>["actionType"] | null = null;
  let suggestedItem = "";
  let title = "";
  let reason = "";
  if (context.selectedBranch === "stress_rescue" && normalized.highRewardCount >= 2) {
    actionType = "reduce_reward_stack"; title = "只保留一個主要犒賞元素"; suggestedItem = "飲料改無糖，甜點改小份或取消"; reason = "今晚偏向情緒犒賞模式，先保留滿足感，但不要同時疊加炸物、甜飲與甜點。";
  } else if (normalized.drinkLevel === 0) {
    actionType = "change_drink"; title = "先把飲料降階"; suggestedItem = "水或無糖茶"; reason = "餐點本身可以不大改，先穩住飲料就能降低晚餐後嘴饞延續。";
  } else if (normalized.carbLevel === 0 && context.carbNeeded) {
    actionType = "add_carb"; title = "補一份適量主食"; suggestedItem = carbSuggestion(input.mealScene); reason = "你今晚飢餓或白天補給不足，適量主食能降低吃完又繼續找零食的風險。";
  } else if (normalized.proteinLevel < 2) {
    actionType = "add_protein"; title = "補明確蛋白質"; suggestedItem = proteinSuggestion(input.mealScene); reason = "蛋白質是晚餐後飽足感的主軸，補上後這份晚餐會更穩。";
  } else if (normalized.vegetableLevel < 2) {
    actionType = "add_vegetable"; title = "補一份蔬菜或高纖"; suggestedItem = vegetableSuggestion(input.mealScene); reason = "補上蔬菜能增加體積感，讓晚餐更不容易吃完還空空的。";
  }
  if (!actionType) return null;
  const upgradedInput = applyUpgradeToInput(input, actionType, suggestedItem);
  const scoreAfter = buildDinnerFormulaResult(upgradedInput, context.journey, { skipUpgradeLoop: true }).totalScore;
  return { title, reason, actionType, suggestedItem, scoreBefore, scoreAfter: Math.max(scoreAfter, scoreBefore) };
}

function applyUpgradeToInput(input: DinnerFormulaInput, actionType: NonNullable<DinnerFormulaResult["minimalUpgrade"]>["actionType"], item: string): DinnerFormulaInput {
  if (actionType === "add_carb") return { ...input, carbChoice: item };
  if (actionType === "add_protein") return { ...input, proteinChoice: item };
  if (actionType === "add_vegetable") return { ...input, vegetableChoice: item };
  if (actionType === "change_drink" || actionType === "reduce_reward_stack") return { ...input, drinkChoice: item.includes("小杯微糖") ? "小杯微糖不加料" : "無糖茶" };
  return input;
}

export function generatePracticalDinnerAdvice(input: DinnerFormulaInput, context: ReturnType<typeof buildDinnerContext>, normalized: NormalizedDinnerSelection) {
  const scene = input.mealScene || "今晚";
  if (scene.includes("便當")) return `便當店可以選 ${input.proteinChoice || "一份主菜"}，配菜至少保留兩格青菜，飯量依今晚飢餓調整成${context.carbNeeded ? "半碗到一碗" : "半碗左右"}，飲料選${normalized.drinkLevel === 2 ? input.drinkChoice : "水或無糖茶"}。`;
  if (scene.includes("超商")) return `超商可以用「蛋白質＋主食＋蔬菜＋無糖飲」快速組合，例如 ${input.proteinChoice || "雞胸或茶葉蛋"}＋${context.carbNeeded ? (input.carbChoice || "飯糰或地瓜") : (input.carbChoice || "少量地瓜")}＋${input.vegetableChoice || "沙拉"}＋${normalized.drinkLevel === 2 ? input.drinkChoice : "無糖茶"}。`;
  if (scene.includes("麵")) return `麵店不要只點一碗麵，建議保留主餐，再加 ${input.proteinChoice || "滷蛋或豆干"} 和 ${input.vegetableChoice || "燙青菜"}，飲料用水或無糖茶收尾。`;
  if (scene.includes("速食")) return `速食店可以保留主餐蛋白質，但把飲料改成水或無糖茶；如果薯條想吃，先縮份量，不再加甜點或第二杯飲料。`;
  if (scene.includes("滷味")) return `滷味先夾豆蛋肉，再加兩份青菜或菇類，主食依今晚飢餓選冬粉或少量麵，醬料與湯少一點，飲料選無糖。`;
  return `今晚可以把餐點整理成：${input.proteinChoice || "一份蛋白質"}＋${input.vegetableChoice || "一份蔬菜"}＋${context.carbNeeded ? (input.carbChoice || "適量主食") : (input.carbChoice || "依飢餓決定主食")}，飲料以${normalized.drinkLevel === 2 ? input.drinkChoice : "水或無糖茶"}為主。`;
}

export function generateAfterDinnerRescueTip(mode: DinnerFormulaResult["dinnerMode"], context: ReturnType<typeof buildDinnerContext>) {
  if (mode === "high_hunger_refill") return "先正常吃完晚餐，等待 15～20 分鐘再判斷，不要在用餐前就認定自己吃太多。";
  if (mode === "emotional_reward") return "如果吃完還想找甜食，先做 3 分鐘身心連結，再決定是否需要一份小點心。";
  if (mode === "habit_screen") return "吃完先收桌、刷牙或泡無糖熱茶，再開始追劇，切斷晚餐和零食的自動連線。";
  if (mode === "drink_loop") return "晚餐飲料先使用固定止損版本，例如小杯微糖或無糖，不要在吃完後再補第二杯。";
  if (mode === "late_light") return "吃完後不要直接滑手機找零食；先泡熱茶或刷牙，讓晚餐有清楚收尾。";
  return context.fatigueScore >= 7 ? "吃完先喝水、收拾桌面，給自己 5 分鐘休息，不要用甜飲或零食當第二段晚餐。" : "吃完後先做一個固定收尾：喝水、刷牙、泡茶或離開零食區。";
}

export function generateDinnerVariations(input: DinnerFormulaInput, context: ReturnType<typeof buildDinnerContext>, normalized: NormalizedDinnerSelection): DinnerFormulaResult["dinnerVariations"] {
  const protein = normalized.proteinLevel > 0 ? input.proteinChoice! : proteinSuggestion(input.mealScene);
  const veg = normalized.vegetableLevel > 0 ? input.vegetableChoice! : vegetableSuggestion(input.mealScene);
  const carb = context.carbNeeded ? (normalized.carbLevel > 0 ? input.carbChoice! : carbSuggestion(input.mealScene)) : (input.carbChoice || "少量地瓜或半份主食");
  const drink = normalized.drinkLevel === 2 ? input.drinkChoice! : "無糖茶";
  return {
    bestFit: `${protein}＋${veg}＋${carb}＋${drink}`,
    easiest: context.carbNeeded ? `${proteinSuggestion(input.mealScene)}＋${carbSuggestion(input.mealScene)}＋無糖豆漿或無糖茶` : `${proteinSuggestion(input.mealScene)}＋${vegetableSuggestion(input.mealScene)}＋無糖茶`,
    minimumRescue: context.carbNeeded ? `${carbSuggestion(input.mealScene)}＋無糖豆漿` : `${proteinSuggestion(input.mealScene)}＋水或無糖茶`,
  };
}

export function buildDinnerFormulaResult(input: DinnerFormulaInput, journey?: DinnerJourneyContext | null, options?: { skipUpgradeLoop?: boolean }): DinnerFormulaResult {
  const context = buildDinnerContext(input, journey);
  const normalized = normalizeDinnerSelection(input, context);
  const structure = calculateMealStructureScore(normalized, context);
  const tonight = calculateTonightFitScore(normalized, context);
  const scoreBreakdown = { ...structure, ...tonight };
  const totalScore = clamp(Object.values(scoreBreakdown).reduce((sum, n) => sum + n, 0));
  const scoreLevel = totalScore < 50 ? "weak" : totalScore < 70 ? "basic" : totalScore < 85 ? "stable" : "high_fit";
  const dinnerMode = determineDinnerMode(input, context, normalized);
  const { strengths, vulnerabilities } = analyzeDinnerVulnerabilities(input, normalized, context);
  const crossLevelInsights = buildCrossLevelInsights(context);
  const analysisSummary = buildSummary(totalScore, scoreLevel, dinnerMode, input, context);
  const minimalUpgrade = options?.skipUpgradeLoop ? null : generateMinimalUpgrade(input, context, normalized, totalScore);
  return {
    totalScore,
    scoreLevel,
    dinnerMode,
    analysisSummary,
    strengths,
    vulnerabilities,
    crossLevelInsights,
    minimalUpgrade,
    practicalDinnerAdvice: generatePracticalDinnerAdvice(input, context, normalized),
    afterDinnerTip: generateAfterDinnerRescueTip(dinnerMode, context),
    dinnerVariations: generateDinnerVariations(input, context, normalized),
    scoreBreakdown,
    normalized,
  };
}

function determineDinnerMode(input: DinnerFormulaInput, context: ReturnType<typeof buildDinnerContext>, normalized: NormalizedDinnerSelection): DinnerFormulaResult["dinnerMode"] {
  if (context.tonightConcerns.includes("emotional_reward") || context.selectedBranch === "stress_rescue" || normalized.highRewardCount >= 2) return "emotional_reward";
  if (context.tonightConcerns.includes("screen_eating") || context.selectedBranch === "habit_break") return "habit_screen";
  if (context.tonightConcerns.includes("sugary_drink") || context.selectedBranch === "drink_loop" || normalized.hasSweetDrink) return "drink_loop";
  if (context.hungerScore >= 7 || ["both_insufficient", "almost_no_food"].includes(context.daytimeIntakeStatus)) return "high_hunger_refill";
  if (context.fatigueScore >= 7 && context.hungerScore >= 4 && context.hungerScore <= 8) return "fatigue_rescue";
  if (context.dinnerTimeBand === "late_dinner" && context.hungerScore <= 4 && context.daytimeIntakeStatus === "breakfast_and_lunch_stable") return "late_light";
  return "balanced";
}

function buildSummary(total: number, level: DinnerFormulaResult["scoreLevel"], mode: DinnerFormulaResult["dinnerMode"], input: DinnerFormulaInput, context: ReturnType<typeof buildDinnerContext>) {
  const levelText = { weak: "防線偏弱", basic: "基礎防線", stable: "穩定防線", high_fit: "高適配防線" }[level];
  const modeText: Record<DinnerFormulaResult["dinnerMode"], string> = {
    high_hunger_refill: `今晚比較偏向高飢餓補給模式。你目前飢餓 ${context.hungerScore} 分，重點不是吃越少越好，而是把蛋白質與適量主食補穩。`,
    fatigue_rescue: `今晚偏向疲憊補給模式。疲憊時大腦容易想選甜、油或大份量食物，建議先簡化選擇，保留完整餐點結構。`,
    late_light: "今晚偏向晚間輕量模式。可以選較輕但完整的組合，不需要為了湊滿公式硬加大量主食。",
    emotional_reward: "今晚偏向情緒犒賞模式。可以保留滿足感，但要避免大份量、含糖飲料與甜點一次疊加。",
    habit_screen: "今晚偏向場景習慣模式。先決定一份完整餐點，吃完離開用餐區，不要讓晚餐和追劇零食連成同一段。",
    drink_loop: "今晚需要特別留意飲料迴路。先把晚餐飲料固定成無糖或降階版本，比重新思考整餐更容易執行。",
    balanced: "今晚狀態相對中性，先用 3-1-1 結構讓晚餐穩定，不需要追求完美。",
  };
  return `${levelText}（${total}/100）。${modeText[mode]}`;
}

function buildCrossLevelInsights(context: ReturnType<typeof buildDinnerContext>) {
  const j = context.journey;
  const out: string[] = [];
  if (!j) return out;
  if (j.characterName || j.originalTypeName) out.push(`你的角色線索：${[j.characterName, j.originalTypeName].filter(Boolean).join("｜")}。`);
  if (j.timePatternType === "dinnerBeforeCrash") out.push("第 1 關顯示你偏向晚餐前爆餓，因此今晚要避免吃得太輕。");
  if (j.decodedSignalType === "fatigueCraving" || j.decodedSignalType === "trueHunger") out.push("第 3 關顯示嘴饞較像疲憊或真餓訊號，晚餐需要明確蛋白質與穩定主食。");
  if (context.selectedBranch === "energy_refill") out.push("第 4 關主要路線是能量補給，今晚分析會提高蛋白質與主食的重要性。");
  if (context.selectedBranch === "stress_rescue") out.push("第 4 關主要路線是壓力止損，今晚要留意是否把晚餐變成情緒犒賞出口。");
  if (context.selectedBranch === "habit_break") out.push("第 4 關主要路線是習慣破解，晚餐後收尾與離開零食場景會更重要。");
  if (context.selectedBranch === "drink_loop") out.push("第 4 關主要路線是飲料迴路，晚餐飲料會被視為關鍵防線。");
  if (Number(j.totalNutritionScore ?? 10) <= 6) out.push(`第 5 關營養補洞分數偏低（${j.totalNutritionScore}/10），今晚不建議只吃沙拉或水果。`);
  if (list(j.lowestItems).length) out.push(`第 5 關較明顯的缺口：${list(j.lowestItems).join("、")}。`);
  return out;
}

const proteinSuggestion = (scene?: string) => scene?.includes("超商") ? "雞胸或茶葉蛋 2 顆" : scene?.includes("麵") ? "滷蛋＋豆干" : scene?.includes("早餐") ? "加蛋＋無糖豆漿" : "一份雞肉、魚、豆腐或蛋";
const vegetableSuggestion = (scene?: string) => scene?.includes("便當") ? "多兩格青菜" : scene?.includes("超商") ? "沙拉或蔬菜盒" : scene?.includes("麵") ? "燙青菜" : "一份青菜或菇類";
const carbSuggestion = (scene?: string) => scene?.includes("超商") ? "飯糰或地瓜" : scene?.includes("便當") ? "半碗飯" : scene?.includes("早餐") ? "吐司或蛋餅主食保留一份" : "半碗飯、地瓜或一份主食";
