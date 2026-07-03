import {describe,expect,it} from "vitest";
import {analyzeLevel1TimeFog,analyzeLevel2SceneMaze,analyzeLevel3SignalDecoder,analyzeLevel5NutritionGap,generatePersonalRescueMap} from "./breakthrough-analysis";

describe("關卡分析引擎指定案例",()=>{
 it("案例 A：下午耗電型與疲憊訊號",()=>{
  const time=analyzeLevel1TimeFog({selectedTimes:["下午 3～5 點"],primaryTime:"下午 3～5 點",cravingScore:8,fatigueScore:9,stressScore:5,hungerScore:4});
  const signal=analyzeLevel3SignalDecoder({stomachScore:3,fatigueScore:9,emotionStressScore:5,specificFoodCravingScore:6,trueHungerScore:4,selectedState:"我是累了"});
  expect(time.timePatternType).toBe("afternoonCrash");expect(time.timeRiskScore).toBe(7);expect(signal.decodedSignalType).toBe("fatigueCraving");
 });
 it("案例 B：晚餐後習慣型與習慣迴路",()=>{
  const time=analyzeLevel1TimeFog({selectedTimes:["晚餐後"],primaryTime:"晚餐後",cravingScore:8,fatigueScore:3,stressScore:3,hungerScore:2});
  const scene=analyzeLevel2SceneMaze({selectedScenes:["家裡沙發","追劇時"],selectedTriggers:["食物放太近"]});
  expect(time.timePatternType).toBe("afterDinnerHabit");expect(scene.triggerType).toBe("habitLoop");
 });
 it("案例 C：壓力時間與情緒迴路",()=>{
  const time=analyzeLevel1TimeFog({selectedTimes:["下班前"],primaryTime:"下班前",cravingScore:7,fatigueScore:4,stressScore:9,hungerScore:3});
  const scene=analyzeLevel2SceneMaze({selectedScenes:["辦公室"],selectedTriggers:["壓力很大","想獎勵自己"]});
  expect(time.timePatternType).toBe("stressTime");expect(scene.triggerType).toBe("emotionalLoop");
 });
 it("案例 D：晚餐前爆餓整合成營養模式",()=>{
  const time=analyzeLevel1TimeFog({selectedTimes:["晚餐前"],primaryTime:"晚餐前",cravingScore:8,fatigueScore:7,stressScore:3,hungerScore:9});
  const nutrition=analyzeLevel5NutritionGap({breakfastScore:0,lunchScore:0,waterScore:1,proteinScore:1,afternoonEnergyScore:1});
  const map=generatePersonalRescueMap({1:time,2:{confidence:"high",triggerType:"bodyLoop",highRiskScenes:["下班路上"]},3:{confidence:"high",decodedSignalType:"trueHunger"},4:{confidence:"high",selectedBranch:"nutrition"},5:nutrition,6:{confidence:"high",dinnerStabilityScore:60,primaryResult:"基礎防線"}},{primaryType:"nutrition_gap"},{firstRescueAction:"下班先吃穩定晚餐"});
  expect(time.timePatternType).toBe("dinnerBeforeCrash");expect(nutrition.totalNutritionScore).toBe(3);expect(map.primaryCravingPattern).toBe("nutritionPattern");
 });
 it("資料不足時不做假精準分析",()=>expect(analyzeLevel1TimeFog({}).confidence).toBe("low"));
});
