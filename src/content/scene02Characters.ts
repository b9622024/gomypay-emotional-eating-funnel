export type Scene02CharacterGroup = "emotion" | "energy" | "habit";

export type Scene02Character = {
  id: string;
  name: string;
  key: string;
  group: Scene02CharacterGroup;
  image: string;
  webpImage: string;
  previewImage: string;
  originalImage: string;
  shortDescription: string;
  keywords: string[];
  accentClass: string;
  needsManualReview: boolean;
  reviewNotes?: string[];
};

export const scene02CharacterGroups: Array<{
  id: Scene02CharacterGroup;
  title: string;
  description: string;
}> = [
  {
    id: "emotion",
    title: "情緒線索",
    description: "壓力、委屈與安撫需求，是這組角色最常見的迷霧入口。",
  },
  {
    id: "energy",
    title: "能量線索",
    description: "疲憊、爆餓與白天補給不足，會讓晚上更容易失守。",
  },
  {
    id: "habit",
    title: "習慣線索",
    description: "固定時間、固定場景與飲料迴路，容易自動啟動嘴饞。",
  },
];

export const scene02Characters: Scene02Character[] = [
  {
    id: "stress-mage",
    name: "壓力法師",
    key: "stress-mage",
    group: "emotion",
    image: "/scroll-world/scene-02-class-hall/characters/png/stress-mage.png",
    webpImage: "/scroll-world/scene-02-class-hall/characters/webp/stress-mage.webp",
    previewImage:
      "/scroll-world/scene-02-class-hall/characters/preview/stress-mage-comparison.jpg",
    originalImage: "/scroll-world/scene-02-class-hall/characters/original/stress-mage.png",
    shortDescription: "壓力越高，越容易用食物或飲料快速放鬆。",
    keywords: ["壓力", "放鬆", "甜食", "情緒出口"],
    accentClass: "violet",
    needsManualReview: true,
    reviewNotes: ["原圖文字與角色外緣距離較近，透明版仍可能殘留少量字樣或光效。"],
  },
  {
    id: "healing-priest",
    name: "療癒牧師",
    key: "healing-priest",
    group: "emotion",
    image: "/scroll-world/scene-02-class-hall/characters/png/healing-priest.png",
    webpImage: "/scroll-world/scene-02-class-hall/characters/webp/healing-priest.webp",
    previewImage:
      "/scroll-world/scene-02-class-hall/characters/preview/healing-priest-comparison.jpg",
    originalImage: "/scroll-world/scene-02-class-hall/characters/original/healing-priest.png",
    shortDescription: "委屈、疲憊或心情低落時，容易用吃來安慰自己。",
    keywords: ["委屈", "安撫", "疲憊", "情緒補償"],
    accentClass: "rose",
    needsManualReview: true,
    reviewNotes: ["胸口光效與原圖文字重疊，若要正式動畫入鏡建議再人工修乾淨。"],
  },
  {
    id: "energy-knight",
    name: "能量騎士",
    key: "energy-knight",
    group: "energy",
    image: "/scroll-world/scene-02-class-hall/characters/png/energy-knight.png",
    webpImage: "/scroll-world/scene-02-class-hall/characters/webp/energy-knight.webp",
    previewImage:
      "/scroll-world/scene-02-class-hall/characters/preview/energy-knight-comparison.jpg",
    originalImage: "/scroll-world/scene-02-class-hall/characters/original/energy-knight.png",
    shortDescription: "白天消耗太多，到了下午或下班後容易爆餓。",
    keywords: ["疲憊", "爆餓", "下午耗電", "晚餐防線"],
    accentClass: "gold",
    needsManualReview: true,
    reviewNotes: ["角色旁保留少量原卡片文字/光暈，需在深色背景上複查。"],
  },
  {
    id: "supply-guardian",
    name: "補給守衛",
    key: "supply-guardian",
    group: "energy",
    image: "/scroll-world/scene-02-class-hall/characters/png/supply-guardian.png",
    webpImage: "/scroll-world/scene-02-class-hall/characters/webp/supply-guardian.webp",
    previewImage:
      "/scroll-world/scene-02-class-hall/characters/preview/supply-guardian-comparison.jpg",
    originalImage: "/scroll-world/scene-02-class-hall/characters/original/supply-guardian.png",
    shortDescription: "早餐、午餐或蛋白質不足，讓晚上的嘴饞反撲。",
    keywords: ["營養缺口", "蛋白質", "午餐不足", "補給節奏"],
    accentClass: "sage",
    needsManualReview: false,
  },
  {
    id: "habit-ranger",
    name: "習慣遊俠",
    key: "habit-ranger",
    group: "habit",
    image: "/scroll-world/scene-02-class-hall/characters/png/habit-ranger.png",
    webpImage: "/scroll-world/scene-02-class-hall/characters/webp/habit-ranger.webp",
    previewImage:
      "/scroll-world/scene-02-class-hall/characters/preview/habit-ranger-comparison.jpg",
    originalImage: "/scroll-world/scene-02-class-hall/characters/original/habit-ranger.png",
    shortDescription: "固定時間、沙發、追劇與外送場景，容易自動啟動嘴饞。",
    keywords: ["固定場景", "追劇", "沙發", "外送 App"],
    accentClass: "forest",
    needsManualReview: false,
  },
  {
    id: "drink-alchemist",
    name: "飲料鍊金師",
    key: "drink-alchemist",
    group: "habit",
    image: "/scroll-world/scene-02-class-hall/characters/png/drink-alchemist.png",
    webpImage: "/scroll-world/scene-02-class-hall/characters/webp/drink-alchemist.webp",
    previewImage:
      "/scroll-world/scene-02-class-hall/characters/preview/drink-alchemist-comparison.jpg",
    originalImage: "/scroll-world/scene-02-class-hall/characters/original/drink-alchemist.png",
    shortDescription: "奶茶、甜咖啡與手搖飲，是最難中斷的日常迴路。",
    keywords: ["手搖飲", "甜咖啡", "含糖飲", "飲料迴路"],
    accentClass: "copper",
    needsManualReview: true,
    reviewNotes: ["原圖背景文字與角色道具重疊較多，透明版適合先做節奏測試。"],
  },
];

export const scene02CharacterByKey = Object.fromEntries(
  scene02Characters.map((character) => [character.key, character]),
) as Record<string, Scene02Character>;
