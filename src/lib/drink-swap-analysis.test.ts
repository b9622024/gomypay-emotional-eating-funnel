import {describe,expect,it} from "vitest";
import {drinkItems} from "../content/drinkData";
import {analyzeSevenDayObservations,buildDrinkAnalysis} from "./drink-swap-analysis";

describe("含糖飲料替換清單 Pro 分析引擎",()=>{
  it("contains every requested drink and four replacement layers",()=>{
    for(const name of ["冬瓜茶","蜂蜜檸檬","水果茶","紅茶","綠茶","青茶","烏龍","珍珠奶茶","鮮奶茶","黑糖鮮奶","抹茶拿鐵","焙茶拿鐵","焦糖拿鐵","摩卡","即飲咖啡","咖啡冰沙","拿鐵","美式","柳橙汁","綜合果汁","果昔","葡萄柚飲","百香飲","可樂","雪碧","運動飲料","能量飲","調味乳","優酪乳","豆漿","超商奶茶"]){const item=drinkItems.find(x=>x.name===name);expect(item,name).toBeTruthy();expect(Object.keys(item!.versions)).toEqual(["original","step1","stable","light"])}
  });
  it("raises pearl milk tea topping, volume and dependency risks for a large full-sugar order",()=>{const result:any=buildDrinkAnalysis({drinkId:"pearl-milk-tea",feeling:"咀嚼感",sugarHabit:"全糖",cupSize:"大杯",toppings:["珍珠"],context:"壓力大"});expect(result.scores.topping).toBe(5);expect(result.scores.volume).toBe(5);expect(result.scores.dependency).toBe(5);expect(result.recommendedVersion).toContain("珍珠半份")});
  it("distinguishes sports drink context from empty-stomach stimulation",()=>{const result:any=buildDrinkAnalysis({drinkId:"sports-drink",feeling:"提神",sugarHabit:"半糖",cupSize:"大杯",toppings:["不加料"],context:"下午提神"});expect(result.scores.emptyStomach).toBeLessThan(3);expect(result.scores.sugar).toBeGreaterThanOrEqual(4);expect(result.scenarioNotes.join("")).toContain("沒有大量流汗")});
  it("does not fake a seven-day pattern with insufficient data",()=>{expect(analyzeSevenDayObservations([]).confidence).toBe("low");const result=analyzeSevenDayObservations([{time:"下午",feeling:"提神",version:"微糖",reflection:"累"},{time:"下午",feeling:"提神",version:"無糖",reflection:"還可以"}]);expect(result.summary).toContain("下午");expect(result.summary).toContain("提神")});
});
