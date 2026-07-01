import { describe,expect,it } from "vitest";
import { assetsForProducts } from "./digitalProducts";
import { fulfillmentEmail } from "../lib/fulfillment";

describe("digital fulfillment content",()=>{
  it("maps the main product and every add-on to the expected assets",()=>{
    expect(assetsForProducts(["emotional_eating_reset_7d"])).toHaveLength(9);
    expect(assetsForProducts(["ai_energy_assessment"])[0]?.title).toBe("AI 能量減脂初評表單");
    expect(assetsForProducts(["sugary_drink_swap_pro"])[0]?.title).toBe("含糖飲料替換清單 Pro");
    expect(assetsForProducts(["anti_binge_meal_plan_7d"])[0]?.title).toBe("7 天外食防暴食菜單");
    expect(assetsForProducts(["coaching_deposit_3d"])[0]?.title).toBe("三天陪跑資料填寫表單");
  });

  it("builds the required personalized delivery email",()=>{
    const email=fulfillmentEmail({name:"王小美",accessUrl:"https://example.com/access/token"});
    expect(email.subject).toBe("你的《下班後嘴饞止損包》已準備好了");
    expect(email.body).toContain("王小美");
    expect(email.body).toContain("https://example.com/access/token");
    expect(email.body).toContain("建議使用順序");
    expect(email.body).toContain("LINE");
  });
});
