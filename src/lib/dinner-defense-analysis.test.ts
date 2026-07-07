import {describe,expect,it} from "vitest";
import {buildDinnerPriorityProfile,generateDinnerAnalysis} from "./dinner-defense-analysis";

describe("dinner defense analysis",()=>{
 it("flags missing carb for high hunger and low daytime nutrition",()=>{
  const profile=buildDinnerPriorityProfile({1:{timePatternType:"dinnerBeforeCrash",hungerScore:9,fatigueScore:8},5:{totalNutritionScore:3,nutritionGapTypes:["proteinGap"]}});
  const result=generateDinnerAnalysis("convenience_store",{protein:["雞胸"],vegetable:["沙拉"],drink:"無糖茶"},profile);
  expect(profile.primaryPriority).toBe("protein");
  expect(result.vulnerabilities.join(" ")).toContain("主食");
  expect(result.minimalUpgrade?.groupId).toBe("carb");
  expect(result.upgradedScore).toBeGreaterThan(result.totalScore);
 });

 it("does not force carb when hunger is low and daytime intake is stable",()=>{
  const profile=buildDinnerPriorityProfile({1:{hungerScore:3},5:{totalNutritionScore:9,nutritionGapTypes:[]}});
  const result=generateDinnerAnalysis("convenience_store",{protein:["雞胸"],vegetable:["沙拉"],drink:"無糖茶"},profile);
  expect(result.vulnerabilities.join(" ")).not.toContain("主食偏少");
  expect(result.structureScore).toBeGreaterThanOrEqual(50);
 });

 it("keeps hotpot strengths while identifying scene risks",()=>{
  const profile=buildDinnerPriorityProfile({1:{hungerScore:7},5:{totalNutritionScore:5,nutritionGapTypes:[]}});
  const result=generateDinnerAnalysis("hotpot",{soupBase:"麻辣",protein:["牛肉"],vegetableAmount:"吃完整份",carb:"不吃",risks:["火鍋料很多","喝很多湯"]},profile);
  expect(result.strengths).toContain("蛋白質足夠");
  expect(result.strengths).toContain("蔬菜份量相對完整");
  expect(result.sceneSpecificRisks.join(" ")).toMatch(/火鍋料|喝很多湯/);
  expect(result.vulnerabilities.join(" ")).toContain("主食");
 });
});
