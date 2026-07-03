import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { badgeConfig } from "./badgeConfig";
import { cravingCharacters } from "./cravingCharacters";

describe("正式遊戲素材",()=>{
  it("12 張角色圖都可從 public 讀取",()=>{
    for(const character of Object.values(cravingCharacters))for(const url of [character.femaleImage,character.maleImage])expect(existsSync(join(process.cwd(),"public",url))).toBe(true);
  });
  it("8 張徽章圖都可從 public 讀取",()=>{
    expect(badgeConfig).toHaveLength(8);
    for(const badge of badgeConfig){const actualPath=badge.imageUrl.replace("/game-assets/badges/","/game-assets/characters/badges/");expect(existsSync(join(process.cwd(),"public",actualPath))).toBe(true)}
  });
});
