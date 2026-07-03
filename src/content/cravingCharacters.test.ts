import { describe, expect, it } from "vitest";
import { cravingCharacters, getCravingCharacter } from "./cravingCharacters";

describe("嘴饞角色設定", () => {
  it("六種原始類型都有角色、路線與任務道具", () => {
    expect(Object.keys(cravingCharacters)).toHaveLength(6);
    for (const character of Object.values(cravingCharacters)) {
      expect(character.characterName).toBeTruthy();
      expect(character.originalTypeName).toBeTruthy();
      expect(character.recommendedRoute).toContain("路線");
      expect(character.primaryTools.length).toBeGreaterThanOrEqual(3);
    }
  });
  it("疲憊失控型對應能量騎士", () => {
    expect(getCravingCharacter("fatigue_loss_control")?.characterName).toBe("能量騎士");
  });
});
