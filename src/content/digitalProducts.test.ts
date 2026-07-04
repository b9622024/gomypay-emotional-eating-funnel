import { describe,expect,it } from "vitest";
import { assetDeliveryLinks, assetsForProducts, digitalAssetsByProduct } from "./digitalProducts";
import { fulfillmentEmail } from "../lib/fulfillment";

describe("digital fulfillment content",()=>{
  it("maps the main product and every add-on to the expected assets",()=>{
    expect(assetsForProducts(["emotional_eating_reset_7d"])).toHaveLength(9);
    expect(assetsForProducts(["ai_energy_assessment"])[0]?.title).toBe("AI 能量減脂測驗");
    expect(assetsForProducts(["sugary_drink_swap_pro"])[0]?.title).toBe("含糖飲料替換清單 Pro");
    expect(assetsForProducts(["anti_binge_meal_plan_7d"])[0]?.title).toBe("外食補給導航 Pro");
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

  it("builds a dedicated Pro add-on delivery email with the main access link",()=>{
    const drink=fulfillmentEmail({name:"王小美",accessUrl:"https://example.com/access/main-token",productCodes:["sugary_drink_swap_pro"]});
    const eating=fulfillmentEmail({name:"王小美",accessUrl:"https://example.com/access/main-token",productCodes:["anti_binge_meal_plan_7d"]});
    expect(drink.subject).toContain("含糖飲料替換清單 Pro");
    expect(eating.subject).toContain("外食補給導航 Pro");
    expect(drink.body).toContain("https://example.com/access/main-token");
    expect(eating.body).toContain("工具包主頁");
  });
});

describe("asset delivery buttons",()=>{
  it("provides interactive and PDF destinations for every asset",()=>{for(const asset of Object.values(digitalAssetsByProduct).flat()){expect(assetDeliveryLinks[asset.key]).toBeTruthy();expect(assetDeliveryLinks[asset.key].interactivePath).toBeTruthy();expect(assetDeliveryLinks[asset.key].pdfUrl).toBeTruthy()}});
  it("provides image downloads for the four requested tools",()=>{for(const key of ["craving-rescue","dinner-formula","safe-swaps","sugary-drink-swap-pro"])expect(assetDeliveryLinks[key].imageUrl).toBeDefined()});
  it("routes the eating-out add-on to the Pro navigator and handbook",()=>{expect(assetDeliveryLinks["anti-binge-meal-plan"].interactivePath).toBe("/pro/eating-navigation");expect(assetDeliveryLinks["anti-binge-meal-plan"].pdfUrl).toBe("/game-assets/pro-tools/eating-navigation/handbook.pdf")});
});
