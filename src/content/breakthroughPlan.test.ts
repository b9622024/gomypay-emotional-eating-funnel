import { describe, expect, it } from "vitest";
import { completionFeedback, levels, normalizeType, recommendation, typeName } from "./breakthroughPlan";

describe("breakthrough routes", () => {
  it.each([
    ["stress_release", "壓力止損路線", "stress"],
    ["fatigue_loss_control", "營養補電路線", "nutrition"],
    ["compensation", "情緒安撫路線", "stress"],
    ["boredom_habit", "習慣迴路拆解路線", "swap"],
    ["sugary_drink_dependency", "飲料降糖路線", "drink"],
    ["nutrition_gap", "白天營養補洞路線", "nutrition"],
  ])("maps %s", (type, route, branch) => {
    expect(recommendation(type)?.route).toBe(route);
    expect(recommendation(type)?.branch).toBe(branch);
  });
  it("uses primary type from mixed string", () => expect(normalizeType("fatigue_loss_control,sugary_drink_dependency")).toBe("fatigue_loss_control"));
  it("shows localized type", () => expect(typeName("nutrition_gap")).toBe("營養不足型"));
  it("is safe before quiz", () => expect(recommendation(null)).toBeNull());
});

describe("成熟版破關文案", () => {
  it("使用統一的七個關卡與徽章名稱", () => {
    expect(levels.map(x => x.name)).toEqual(["找出嘴饞角色", "找出破功時間與場景", "破解情緒與身體訊號", "選擇專屬支線任務", "掃描白天營養缺口", "建立晚餐防線", "生成個人止損地圖"]);
    expect(levels.map(x => x.badge)).toEqual(["嘴饞角色徽章", "觸發點偵探徽章", "身心連結徽章", "專屬支線徽章", "營養補洞徽章", "晚餐穩定徽章", "止損地圖完成徽章"]);
  });
  it("完成回饋包含徽章、線索、點數與下一關", () => {
    const text = completionFeedback(3);
    expect(text).toContain("身心連結徽章");
    expect(text).toContain("情緒線索與身體訊號線索");
    expect(text).toContain("10 行動點數");
    expect(text).toContain("下一關預告：第 4 關");
  });
});
