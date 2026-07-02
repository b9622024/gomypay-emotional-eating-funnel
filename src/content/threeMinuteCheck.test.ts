import { describe,expect,it } from "vitest";
import { determineThreeMinuteResult,emptyThreeMinuteData } from "./threeMinuteCheck";

describe("three-minute check result",()=>{
  it("detects true hunger",()=>expect(determineThreeMinuteResult({...emptyThreeMinuteData,hungerScore:8,mouthCravingScore:7})).toBe("true_hunger"));
  it("detects stress and sugary drink patterns",()=>{
    expect(determineThreeMinuteResult({...emptyThreeMinuteData,stressScore:8,hungerScore:3})).toBe("stress_eating");
    expect(determineThreeMinuteResult({...emptyThreeMinuteData,sugaryDrinkScore:8})).toBe("sugary_drink");
  });
  it("prioritizes mixed when multiple signals are high",()=>expect(determineThreeMinuteResult({...emptyThreeMinuteData,stressScore:8,fatigueScore:8})).toBe("mixed"));
  it("uses emotion tags and falls back to unclear",()=>{
    expect(determineThreeMinuteResult({...emptyThreeMinuteData,emotionTags:["想被安慰"]})).toBe("comfort_need");
    expect(determineThreeMinuteResult({...emptyThreeMinuteData})).toBe("unclear");
  });
});
