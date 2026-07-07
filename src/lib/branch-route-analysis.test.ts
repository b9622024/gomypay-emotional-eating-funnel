import {describe,expect,it} from "vitest";
import {analyzeBranchRoutes} from "./branch-route-analysis";

describe("攻略路線分析",()=>{
 it("案例 A：壓力法師＋高壓力＋情緒迴路",()=>{
  const answers={"1":"今天太累了，想犒賞自己","2":"找甜食或大吃一頓","3":"想讓自己舒服或放鬆","4":"覺得辛苦一週，應該犒賞自己","5":"覺得煩躁，很難停下來","6":"晚上常常餓到失控","7":"下午先補一份蛋白質","8":"晚上又餓到失控"};
  const result=analyzeBranchRoutes({answers},{1:{sourceScores:{stress:9}},2:{triggerType:"emotionalLoop",highRiskScenes:["辦公室"]},3:{decodedSignalType:"stressCraving",primaryResult:"壓力型嘴饞"}},{primaryType:"stress_release",characterName:"壓力法師"});
  expect(result.recommendedBranch).toBe("stress_rescue");
  expect(result.secondaryBranch).toBe("energy_refill");
  expect(result.primaryEvidence.join(" ")).toMatch(/壓力|情緒/);
  expect(Object.values(result.scores).every(x=>x.total>0)).toBe(true);
 });
 it("案例 B：能量騎士＋晚餐前爆餓",()=>{
  const answers={"1":"我真的需要提神","2":"忙到忘記吃，晚點爆餓","3":"身體其實還很餓","4":"三餐時間亂掉，晚上很餓","5":"看到什麼就吃什麼","6":"晚上常常餓到失控","7":"下午先補一份蛋白質","8":"晚上又餓到失控"};
  const result=analyzeBranchRoutes({answers},{1:{timePatternType:"dinnerBeforeCrash",sourceScores:{hunger:9}},2:{highRiskScenes:["下班路上"]},3:{decodedSignalType:"trueHunger",primaryResult:"真餓型訊號"}},{primaryType:"fatigue_loss_control",characterName:"能量騎士"});
  expect(result.recommendedBranch).toBe("energy_refill");
  expect(result.scores.energy_refill.total).toBeGreaterThan(result.scores.drink_loop.total);
 });
 it("資料不足時誠實標示低信心，但不顯示全零",()=>{const result=analyzeBranchRoutes({});expect(result.confidence).toBe("low");expect(Object.values(result.scores).every(x=>x.total>0)).toBe(true)});
});
