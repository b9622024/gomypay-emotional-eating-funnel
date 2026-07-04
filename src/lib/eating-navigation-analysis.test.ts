import { describe, expect, it } from "vitest";
import { eatingNavigationItems } from "../content/eatingNavigation";
import { analyzeMealCombination, analyzeNavigationMode, generateThreeRouteSuggestions } from "./eating-navigation-analysis";

const id = (sceneId: string, name: string, category?: string) => {
  const item = eatingNavigationItems.find(x => x.sceneIds.includes(sceneId) && x.name === name && (!category || x.category === category));
  if (!item) throw new Error(`missing fixture ${sceneId}/${name}`);
  return item.id;
};
const status = (overrides: Record<string, unknown> = {}) => ({ hungerScore: 5, fatigueScore: 5, rushScore: 5, previousIntakeFlags: [] as string[], currentGoal: "keepStable", optionalTime: "dinner", ...overrides });

describe("外食補給導航分析引擎", () => {
  it("案例 A：超商高飢餓、高疲憊與白天缺口，不會把沙拉＋茶判定為穩定", () => {
    const scan = status({ hungerScore: 9, fatigueScore: 8, rushScore: 4, previousIntakeFlags: ["smallLunch", "lowProtein"] });
    const modes = analyzeNavigationMode(scan);
    const analysis = analyzeMealCombination({ status: scan, sceneId: "convenienceStore", selectedItemIds: [id("convenienceStore", "沙拉"), id("convenienceStore", "無糖茶")] });
    const routes = generateThreeRouteSuggestions({ status: scan, sceneId: "convenienceStore", analysis });
    expect(modes.primaryMode).toBe("highHungerMode");
    expect(modes.secondaryModes).toEqual(expect.arrayContaining(["highFatigueMode", "daytimeGapMode"]));
    expect(analysis.missingElements).toEqual(expect.arrayContaining(["protein", "carb"]));
    expect(analysis.totalScore).toBeLessThan(75);
    expect(routes.easy.content + routes.minimum.content).toMatch(/蛋|豆腐|主食/);
  });

  it("案例 B：早餐店趕時間，蛋餅＋無糖豆漿屬中等以上快速組合", () => {
    const scan = status({ hungerScore: 5, fatigueScore: 3, rushScore: 8, optionalTime: "breakfast" });
    const modes = analyzeNavigationMode(scan);
    const analysis = analyzeMealCombination({ status: scan, sceneId: "breakfastShop", selectedItemIds: [id("breakfastShop", "蛋餅"), id("breakfastShop", "無糖豆漿", "protein"), id("breakfastShop", "無糖豆漿", "drink")] });
    expect(modes.primaryMode).toBe("rushMode");
    expect(analysis.totalScore).toBeGreaterThanOrEqual(50);
    expect(analysis.contextFitScore).toBe(10);
  });

  it("案例 C：外送高飢餓與高疲憊優先完整餐食，不推薦只吃沙拉", () => {
    const scan = status({ hungerScore: 8, fatigueScore: 9, rushScore: 2, currentGoal: "comfort" });
    const modes = analyzeNavigationMode(scan);
    const analysis = analyzeMealCombination({ status: scan, sceneId: "delivery", selectedItemIds: [id("delivery", "青菜配菜")] });
    const routes = generateThreeRouteSuggestions({ status: scan, sceneId: "delivery", analysis });
    expect(modes.primaryMode).toBe("highHungerMode");
    expect(modes.secondaryModes).toContain("highFatigueMode");
    expect(routes.stable.content).toMatch(/便當|主菜|飯/);
    expect(routes.stable.content).not.toBe("沙拉");
  });

  it("案例 D：咖啡店甜咖啡＋蛋糕找出蛋白質與飲料風險並給最小修正", () => {
    const scan = status({ hungerScore: 7, optionalTime: "afternoon" });
    const analysis = analyzeMealCombination({ status: scan, sceneId: "cafe", selectedItemIds: [id("cafe", "甜咖啡"), id("cafe", "蛋糕")] });
    expect(analysis.primaryGap).toBe("protein");
    expect(analysis.drinkScore).toBeLessThanOrEqual(4);
    expect(analysis.smallestUpgrade).toMatch(/無糖飲.*三明治|蛋白質/);
  });
});
