export type ProAddon = {
  slug: string;
  productCode: "sugary_drink_swap_pro" | "anti_binge_meal_plan_7d";
  title: string;
  subtitle: string;
  checkoutPrice: number;
  standalonePrice: number;
  description: string;
  features: string[];
  previewImage: string;
  interactivePath: string;
};

export const proAddons: ProAddon[] = [
  {
    slug: "drink-swap-pro",
    productCode: "sugary_drink_swap_pro",
    title: "含糖飲料替換清單 Pro",
    subtitle: "把「我要戒飲料」變成「我知道下一杯怎麼點」。",
    checkoutPrice: 99,
    standalonePrice: 149,
    description: "從手搖飲、咖啡到超商飲料，依照糖度、杯型與加料習慣，建立可以直接使用的點餐規則。",
    features: ["手搖飲與咖啡替換建議", "糖度、杯型與加料降階", "可複製的點餐話術", "收藏常用飲料備案"],
    previewImage: "/game-assets/pro-tools/drink-swap/mobile-preview.png",
    interactivePath: "/drink-swap-pro",
  },
  {
    slug: "eating-navigation",
    productCode: "anti_binge_meal_plan_7d",
    title: "外食補給導航 Pro",
    subtitle: "到哪裡吃，都知道這一餐下一步該補什麼。",
    checkoutPrice: 99,
    standalonePrice: 149,
    description: "先分析當下飢餓、疲憊與白天補給，再依外食場景產生最穩、最省事與最低止損三種導航。",
    features: ["10 大外食場景", "蛋白質、蔬菜、主食、飲料四格判讀", "三段式個人化導航", "餐後回顧與常用收藏"],
    previewImage: "/game-assets/pro-tools/eating-navigation/mobile-preview.png",
    interactivePath: "/pro/eating-navigation",
  },
];

export const proAddonBySlug = (slug: string) => proAddons.find(item => item.slug === slug);
export const proAddonByCode = (code: string) => proAddons.find(item => item.productCode === code);
