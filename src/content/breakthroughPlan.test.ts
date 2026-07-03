import { describe, expect, it } from "vitest";
import { completionFeedback, levels, normalizeType, recommendation, typeName, validateBreakthroughLevel } from "./breakthroughPlan";

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

describe("關卡最低完成條件",()=>{
  it("不允許空白資料直接通過",()=>{
    expect(validateBreakthroughLevel(1,{})).toContain("時間");
    expect(validateBreakthroughLevel(2,{})).toContain("場景");
    expect(validateBreakthroughLevel(3,{})).toContain("身心");
    expect(validateBreakthroughLevel(5,{})).toContain("5 項");
    expect(validateBreakthroughLevel(6,{savedDinnerBackups:["","",""]})).toContain("3-1-1");
    expect(validateBreakthroughLevel(7,{},{})).toContain("六張線索卡");
  });
  it("完整填寫後可通過",()=>{
    expect(validateBreakthroughLevel(1,{selectedTimes:["晚餐後"],primaryTime:"晚餐後",cravingScore:8,hungerScore:5,fatigueScore:7,stressScore:4})).toBeNull();
    expect(validateBreakthroughLevel(6,{selectedProtein:"雞胸",selectedVegetable:"沙拉",selectedCarb:"地瓜",selectedDrink:"水",savedDinnerBackups:["便當","滷味","超商雞胸"]})).toBeNull();
  });
});

describe("成熟版破關文案", () => {
  it("使用統一的七個關卡與徽章名稱", () => {
    expect(levels.map(x => x.name)).toEqual(["時間迷霧", "場景迷宮", "情緒之門", "支線岔路", "補給裂縫", "晚餐防線", "迷霧核心"]);
    expect(levels.map(x => x.badge)).toEqual(["時間偵探徽章", "場景偵探徽章", "身心連結徽章", "專屬支線徽章", "營養補洞徽章", "晚餐穩定徽章", "止損地圖完成徽章"]);
  });
  it("完成回饋以徽章與下一關為主，不再強調點數", () => {
    const text = completionFeedback(3);
    expect(text).toContain("身心連結徽章");
    expect(text).toContain("新的嘴饞線索");
    expect(text).not.toContain("行動點數");
    expect(text).toContain("下一關預告：第 4 關");
  });
});
