import { describe,expect,it } from "vitest";
import { buildTriggerSummary,type TriggerEntry } from "./cravingTriggerAnalysis";
const base:TriggerEntry={afterFeeling:[],triggerTypes:[]};
describe("craving trigger summary",()=>{
  it("returns a basic empty summary",()=>expect(buildTriggerSummary([]).count).toBe(0));
  it("calculates averages, top values and eating ratio",()=>{const summary=buildTriggerSummary([{...base,cravingScore:8,stressScore:8,location:"家裡",cravingItem:"奶茶",didEatOrDrink:true,triggerTypes:["壓力太大"],mainTrigger:"壓力"},{...base,cravingScore:6,stressScore:8,location:"家裡",cravingItem:"奶茶",didEatOrDrink:false,triggerTypes:["壓力太大"],mainTrigger:"壓力"}]);expect(summary.averages.craving).toBe(7);expect(summary.topLocations[0]).toEqual({label:"家裡",count:2});expect(summary.eatRatio).toBe(50);expect(summary.mainTrigger).toBe("壓力")});
  it("detects fatigue, nutrition, habit and drink patterns",()=>{const entries=Array.from({length:3},()=>({...base,fatigueScore:8,hungerScore:8,triggerTypes:["白天吃太少","飯後習慣想吃","下班後一定要喝飲料"]}));expect(buildTriggerSummary(entries).patterns).toEqual(expect.arrayContaining(["fatigue","nutrition","habit","drink"]))});
});
