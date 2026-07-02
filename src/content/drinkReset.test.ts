import { describe,expect,it } from "vitest";
import { buildDrinkResetReport,type DrinkDayState } from "./drinkReset";

const state=(data:Record<string,unknown>):DrinkDayState=>({data,isCompleted:true,completedAt:new Date().toISOString()});
describe("drink reset report",()=>{
  it("summarizes triggers and water response",()=>{const report=buildDrinkResetReport({1:state({sugarLevel:"半糖",toppings:["珍珠"],emotionBefore:["累"]}),2:state({triggerTypes:["下午2-5點","睡不好很累"]}),5:state({cravingAfter10Min:"降低很多"})});expect(report.recordedDays).toBe(3);expect(report.sugar).toBe("半糖");expect(report.topping).toBe("珍珠");expect(report.highRisk).toBe(true);expect(report.waterWorked).toBe(true);expect(report.patterns).toContain("疲憊提神型")});
  it("returns gentle fallbacks when empty",()=>{const report=buildDrinkResetReport({});expect(report.recordedDays).toBe(0);expect(report.sugar).toBe("資料不足");expect(report.patterns).toEqual([])});
});
