import { describe, expect, it } from "vitest";
import { proAddonByCode, proAddons } from "./proAddons";

describe("Pro add-on storefront", () => {
  it("keeps checkout and standalone prices distinct", () => {
    expect(proAddons).toHaveLength(2);
    for (const addon of proAddons) {
      expect(addon.checkoutPrice).toBe(99);
      expect(addon.standalonePrice).toBe(149);
      expect(addon.previewImage).toMatch(/^\/game-assets\/pro-tools\//);
    }
  });

  it("maps both entitlement product codes", () => {
    expect(proAddonByCode("sugary_drink_swap_pro")?.slug).toBe("drink-swap-pro");
    expect(proAddonByCode("anti_binge_meal_plan_7d")?.slug).toBe("eating-navigation");
  });
});
