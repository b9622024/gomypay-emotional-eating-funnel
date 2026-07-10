import { describe, expect, it } from "vitest";
import { buildDinnerFormulaResult } from "./dinner-formula-analysis";

describe("dinner formula analysis", () => {
  it("case A: high hunger + insufficient lunch should not treat no-carb dinner as stable", () => {
    const result = buildDinnerFormulaResult({
      hungerScore: 9,
      fatigueScore: 8,
      daytimeIntakeStatus: "lunch_insufficient",
      dinnerTimeBand: "normal_dinner",
      tonightConcerns: ["still_hungry_later"],
      mealScene: "超商",
      proteinChoice: "雞胸",
      vegetableChoice: "沙拉",
      carbChoice: "",
      drinkChoice: "無糖茶",
      closingAction: "刷牙",
    });

    expect(result.dinnerMode).toBe("high_hunger_refill");
    expect(result.totalScore).toBeGreaterThanOrEqual(60);
    expect(result.totalScore).toBeLessThan(80);
    expect(result.strengths.join(" ")).toMatch(/蛋白質|飲料/);
    expect(result.vulnerabilities.join(" ")).toMatch(/主食不足|晚點又想找食物/);
    expect(result.minimalUpgrade?.actionType).toBe("add_carb");
    expect(result.minimalUpgrade?.suggestedItem).toMatch(/飯糰|地瓜|飯/);
    expect(result.minimalUpgrade?.scoreAfter).toBeGreaterThan(result.totalScore);
  });

  it("case B: late light dinner with stable daytime intake should not force more carbs", () => {
    const result = buildDinnerFormulaResult({
      hungerScore: 3,
      fatigueScore: 3,
      daytimeIntakeStatus: "breakfast_and_lunch_stable",
      dinnerTimeBand: "late_dinner",
      tonightConcerns: [],
      mealScene: "其他",
      proteinChoice: "豆腐",
      vegetableChoice: "青菜",
      carbChoice: "少量地瓜",
      drinkChoice: "無糖茶",
      closingAction: "泡熱茶",
    });

    expect(result.dinnerMode).toBe("late_light");
    expect(result.totalScore).toBeGreaterThanOrEqual(85);
    expect(result.analysisSummary).toMatch(/晚間輕量模式/);
    expect(result.minimalUpgrade?.actionType).not.toBe("add_carb");
    expect(result.vulnerabilities.join(" ")).not.toMatch(/主食不足/);
  });

  it("case C: complete meal with large milk tea should identify drink as the biggest leak", () => {
    const result = buildDinnerFormulaResult({
      hungerScore: 6,
      fatigueScore: 6,
      daytimeIntakeStatus: "breakfast_and_lunch_stable",
      dinnerTimeBand: "normal_dinner",
      tonightConcerns: ["sugary_drink"],
      mealScene: "便當店",
      proteinChoice: "烤雞腿",
      vegetableChoice: "兩份青菜",
      carbChoice: "半碗飯",
      drinkChoice: "大杯奶茶",
      closingAction: "散步 5 分鐘",
    });

    expect(result.totalScore).toBeLessThan(85);
    expect(result.vulnerabilities.join(" ")).toMatch(/飲料|含糖|加料/);
    expect(result.minimalUpgrade?.actionType).toBe("change_drink");
    expect(result.minimalUpgrade?.reason).toMatch(/飲料/);
    expect(result.minimalUpgrade?.scoreAfter).toBeGreaterThan(result.totalScore);
  });

  it("case D: stress branch + reward foods should reduce stacked reward elements", () => {
    const result = buildDinnerFormulaResult({
      hungerScore: 6,
      fatigueScore: 6,
      stressScore: 8,
      daytimeIntakeStatus: "breakfast_and_lunch_stable",
      dinnerTimeBand: "normal_dinner",
      tonightConcerns: ["emotional_reward"],
      mealScene: "速食店",
      proteinChoice: "炸雞＋甜點",
      vegetableChoice: "",
      carbChoice: "白飯",
      drinkChoice: "含糖飲料",
      closingAction: "收拾餐桌後離開用餐區",
    }, {
      selectedBranch: "stress_rescue",
      originalTypeName: "壓力釋放型",
      characterName: "壓力法師",
    });

    expect(result.dinnerMode).toBe("emotional_reward");
    expect(result.analysisSummary).toMatch(/情緒犒賞模式/);
    expect(result.vulnerabilities.join(" ")).toMatch(/犒賞|飲料/);
    expect(result.crossLevelInsights.join(" ")).toMatch(/壓力止損/);
    expect(result.minimalUpgrade?.actionType).toBe("reduce_reward_stack");
    expect(result.minimalUpgrade?.suggestedItem).toMatch(/無糖|甜點/);
  });
});
