import {describe,expect,it} from "vitest";
import {salesPage} from "./emotionalEatingSalesPage";
import {salesPageAssets} from "./salesPageAssets";
import {mysteryRewardConfig} from "./mysteryRewardConfig";

describe("sales page RPG refresh",()=>{
  it("keeps Day 0 separate from exactly seven task tools",()=>{
    expect(salesPage.days).toHaveLength(8);
    expect(salesPage.days[0]).toContain("第 0 天");
    expect(salesPage.bonuses).toHaveLength(7);
    expect(salesPageAssets.tools).toHaveLength(7);
    expect(salesPage.bonuses.map(item=>item[0])).not.toContain("情緒性進食 6 型測驗");
  });

  it("uses the requested tool order",()=>{
    expect(salesPage.bonuses.map(item=>item[0])).toEqual([
      "嘴饞前 3 分鐘身心連結工作本",
      "下班後嘴饞觸發點分析表",
      "正念營養缺口掃描",
      "10 分鐘嘴饞急救流程卡",
      "7 天含糖飲料重置表",
      "下班後防暴食晚餐公式",
      "安全零食與飲料替換清單"
    ]);
  });

  it("centralizes the cover and mystery reward content",()=>{
    expect(salesPageAssets.mistKingdomCover).toMatch(/mist-kindom-cover\.PNG$/);
    expect(mysteryRewardConfig.lockedDescription).toContain("第 7 關");
  });
});
