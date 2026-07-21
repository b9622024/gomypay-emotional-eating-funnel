"use client";

import { useMemo, useState } from "react";
import type { Scene02Character, Scene02CharacterGroup } from "@/content/scene02Characters";
import styles from "./Scene02CharacterPreview.module.css";

type BackgroundMode = "dark" | "light" | "checker";

type CharacterWithMeta = Scene02Character & {
  pngSizeLabel: string;
  webpSizeLabel: string;
  originalSizeLabel: string;
};

type Props = {
  characters: CharacterWithMeta[];
};

const groupLabels: Record<Scene02CharacterGroup, string> = {
  emotion: "情緒組",
  energy: "能量組",
  habit: "習慣組",
};

const stageClassByMode: Record<BackgroundMode, string> = {
  dark: styles.stageDark,
  light: styles.stageLight,
  checker: styles.stageChecker,
};

const pairTests: Array<{
  title: string;
  keys: string[];
}> = [
  { title: "情緒雙角色測試", keys: ["stress-mage", "healing-priest"] },
  { title: "能量雙角色測試", keys: ["energy-knight", "supply-guardian"] },
  { title: "習慣雙角色測試", keys: ["habit-ranger", "drink-alchemist"] },
];

export function Scene02CharacterPreview({ characters }: Props) {
  const [backgroundMode, setBackgroundMode] = useState<BackgroundMode>("dark");
  const [modalImage, setModalImage] = useState<string | null>(null);

  const byKey = useMemo(
    () => new Map(characters.map((character) => [character.key, character])),
    [characters],
  );

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.eyebrow}>Scene 02 Asset QA</div>
        <h1 className={styles.title}>六種角色集結｜透明素材預覽</h1>
        <p className={styles.lead}>
          這頁只用來檢查第二幕角色素材：透明去背、深淺背景可讀性、雙角色同框、六角色集合，以及原圖與處理後的差異。它不會出現在正式導覽列。
        </p>
        <div className={styles.controls} aria-label="背景切換">
          {(["dark", "light", "checker"] as const).map((mode) => (
            <button
              className={`${styles.controlButton} ${
                backgroundMode === mode ? styles.controlButtonActive : ""
              }`}
              key={mode}
              onClick={() => setBackgroundMode(mode)}
              type="button"
            >
              {mode === "dark" ? "深色背景" : mode === "light" ? "淺色背景" : "棋盤透明檢查"}
            </button>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>單一角色透明圖</h2>
        <div className={styles.grid}>
          {characters.map((character, index) => (
            <article
              className={styles.card}
              key={character.id}
              style={{ animationDelay: `${index * 70}ms` }}
            >
              <div className={`${styles.stage} ${stageClassByMode[backgroundMode]}`}>
                <img
                  alt={`${character.name}透明角色圖`}
                  className={styles.characterImage}
                  loading="lazy"
                  onClick={() => setModalImage(character.image)}
                  src={character.image}
                />
              </div>
              <div className={styles.cardBody}>
                <div className={styles.cardHeader}>
                  <div className={styles.name}>{character.name}</div>
                  <div className={styles.group}>{groupLabels[character.group]}</div>
                </div>
                <p className={styles.description}>{character.shortDescription}</p>
                <div className={styles.meta}>
                  PNG：1200×1600，{character.pngSizeLabel}
                  <br />
                  WebP：1200×1600，{character.webpSizeLabel}
                  <br />
                  原圖：1122×1402，{character.originalSizeLabel}
                </div>
                {character.needsManualReview && (
                  <div className={styles.warning}>
                    需人工複查：
                    {character.reviewNotes?.join(" ") ?? "原圖文字或光效距離角色太近。"}
                  </div>
                )}
                <div className={styles.comparison}>
                  <figure>
                    <img alt={`${character.name}原圖`} loading="lazy" src={character.originalImage} />
                    <figcaption>原始角色卡</figcaption>
                  </figure>
                  <figure>
                    <img alt={`${character.name}比較預覽`} loading="lazy" src={character.previewImage} />
                    <figcaption>原圖 / 透明圖比較</figcaption>
                  </figure>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>雙角色同框測試</h2>
        <div className={styles.pairGrid}>
          {pairTests.map((pair) => (
            <article className={styles.pairCard} key={pair.title}>
              <h3>{pair.title}</h3>
              <div className={`${styles.pairStage} ${stageClassByMode[backgroundMode]}`}>
                {pair.keys.map((key) => {
                  const character = byKey.get(key);
                  if (!character) return null;
                  return <img alt={`${character.name}同框測試`} key={key} loading="lazy" src={character.image} />;
                })}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>六角色集合測試</h2>
        <div className={`${styles.collectionStage} ${stageClassByMode[backgroundMode]}`}>
          {characters.map((character) => (
            <img alt={`${character.name}集合測試`} key={character.key} loading="lazy" src={character.image} />
          ))}
        </div>
      </section>

      {modalImage && (
        <div className={styles.modal} onClick={() => setModalImage(null)} role="presentation">
          <div className={styles.modalInner} onClick={(event) => event.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => setModalImage(null)} type="button">
              關閉放大預覽
            </button>
            <img alt="角色放大預覽" src={modalImage} />
          </div>
        </div>
      )}
    </main>
  );
}
