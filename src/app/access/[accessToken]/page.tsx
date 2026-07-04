import { notFound } from "next/navigation";
import RememberAccessToken from "@/components/access/RememberAccessToken";
import BadgeCollection from "@/components/badges/BadgeCollection";
import { assetDeliveryLinks, digitalAssetsByProduct, type DigitalAsset } from "@/content/digitalProducts";
import { levels, typeName } from "@/content/breakthroughPlan";
import { salesPage } from "@/content/emotionalEatingSalesPage";
import { prisma } from "@/lib/db";
import { getBreakthroughState } from "@/lib/breakthrough-plan";

function Button({ href, label, kind }: { href: string; label: string; kind: string }) {
  if (href === "#") return <button disabled className={`btn delivery-button ${kind} disabled`}>{label}<small>準備中</small></button>;
  return <a className={`btn delivery-button ${kind}`} href={href} target={kind === "interactive" ? undefined : "_blank"} rel="noreferrer"><span>{label}</span><span>{kind === "interactive" ? "→" : "↓"}</span></a>;
}

function Actions({ asset, token }: { asset: DigitalAsset; token: string }) {
  if(asset.key==="ai-energy-assessment")return <div className="asset-actions unified ai-detail-action"><a className="btn delivery-button interactive" href={`/ai-energy-assessment?accessToken=${encodeURIComponent(token)}`}><span>點我了解詳情</span><span>→</span></a></div>;
  const delivery = assetDeliveryLinks[asset.key] ?? { interactivePath: "#", pdfUrl: "#" };
  const interactiveHref = delivery.interactivePath === "#" ? "#" : `/access/${token}${delivery.interactivePath}`;
  return <div className="asset-actions unified"><Button href={interactiveHref} label="開始使用" kind="interactive"/><Button href={delivery.pdfUrl} label="PDF 版" kind="pdf"/>{delivery.imageUrl && <Button href={delivery.imageUrl} label="圖卡" kind="image"/>}</div>;
}

const groups = [
  { title: "當下急救道具", keys: ["three-minute-workbook", "craving-rescue"] },
  { title: "線索分析道具", keys: ["trigger-analysis", "mindful-nutrition"] },
  { title: "飲料支線道具", keys: ["drink-reset", "sugary-drink-swap-pro"] },
  { title: "外食與晚餐道具", keys: ["dinner-formula", "anti-binge-meal-plan"] },
  { title: "替換清單道具", keys: ["safe-swaps"] },
  { title: "專屬評估道具", keys: ["ai-energy-assessment"] },
];

const timing: Record<string, string> = {
  "three-minute-workbook": "嘴饞剛出現、想分辨身體與情緒時",
  "craving-rescue": "嘴饞強度很高、快失控時",
  "trigger-analysis": "想回推固定破功時間與場景時",
  "mindful-nutrition": "想快速檢查白天營養是否穩定時",
  "drink-reset": "飲料依賴型或選擇飲料降糖支線時",
  "dinner-formula": "下班後不知道晚餐怎麼選時",
  "safe-swaps": "不知道零食或飲料可以換成什麼時",
  "sugary-drink-swap-pro": "想直接取得點餐話術與降糖攻略時",
  "anti-binge-meal-plan": "外食時想快速判斷這餐缺什麼時",
  "ai-energy-assessment": "想進一步了解能量狀態與減脂卡點時",
};

const advancedCopy: Record<string, { name: string; message: string; button: string }> = {
  "sugary-drink-swap-pro": {
    name: "手搖飲降糖攻略",
    message: "你已經找出自己的飲料觸發點。如果你想知道手搖飲、咖啡、超商飲料要怎麼直接點，可以解鎖進階道具《含糖飲料替換清單 Pro》。",
    button: "解鎖飲料降糖攻略",
  },
  "anti-binge-meal-plan": {
    name: "外食補給導航",
    message: "你已經建立了自己的晚餐防線。如果你想在不同外食場景快速判斷這餐缺什麼，可以解鎖進階道具《外食補給導航 Pro》。",
    button: "解鎖外食補給導航",
  },
};

export default async function Access({ params }: { params: Promise<{ accessToken: string }> }) {
  const { accessToken } = await params;
  const canonical = await prisma.entitlement.findUnique({ where: { accessToken }, include: { order: true } });
  if (!canonical || canonical.order.status !== "paid") notFound();
  const state = await getBreakthroughState(accessToken);
  if (!state) notFound();

  const ownedCodes = (await prisma.entitlement.findMany({ where: { customerId: canonical.customerId, order: { status: "paid" } }, select: { productCode: true } })).map(x => x.productCode);
  const all = [...digitalAssetsByProduct.emotional_eating_reset_7d, ...digitalAssetsByProduct.ai_energy_assessment, ...digitalAssetsByProduct.sugary_drink_swap_pro, ...digitalAssetsByProduct.anti_binge_meal_plan_7d];
  const completed = state.progress.completedLevels.length;
  const done = completed >= 7;
  const cta = !state.quiz ? `/access/${accessToken}/character-creation` : done && state.map ? `/access/${accessToken}/personal-rescue-map` : `/access/${accessToken}/breakthrough-plan`;
  const today = done ? "個人止損地圖已完成" : `第 ${state.progress.currentLevel} 關`;
  const characterImage=state.characters.primary?(state.progress.selectedGender==="male"?state.characters.primary.maleImage:state.characters.primary.femaleImage):null;

  return <main className="access-page bt-home"><div className="container">
    <RememberAccessToken accessToken={accessToken}/>
    <section className="bt-home-hero">
      <span>可樂吉健康研究所</span>
      <h1>7 天嘴饞破關計畫</h1>
      <h2>穿越嘴饞迷霧王國，解鎖你的減脂止損地圖</h2>
      <p>你不是沒有自制力，只是還沒有看見嘴饞迷霧背後的真正線索。在這 7 天裡，你會先創建自己的嘴饞角色，再穿越 7 個關卡。每一關都會幫你收集關鍵線索並解鎖一枚徽章；集齊 8 枚徽章後，就能破解迷霧核心，生成個人止損地圖。</p>
      <a href={cta}>{state.quiz ? "開始我的破關旅程" : "開始第 0 天｜創建嘴饞角色"} →</a>
    </section>

    {!state.quiz ? <section className="bt-home-progress"><div><span>第 0 天尚未完成</span><h2>你還沒有創建嘴饞角色</h2><p>完成角色創建後，系統才能依照你的結果安排專屬破關路線。</p></div><div className="bt-home-stats"><article><strong>🔒</strong><span>第 1～7 關將在角色創建後解鎖</span></article></div><a href={cta}>開始第 0 天｜創建嘴饞角色 →</a></section> : <section className="bt-home-progress"><div><span>嘴饞迷霧王國進度</span><h2>{today}</h2><p>目前關卡：第 {done?7:state.progress.currentLevel} 關 / 共 7 關</p></div><div className="bt-home-stats"><article><strong>{state.progress.earnedBadges.length}</strong><span>已解鎖徽章 / 8</span></article><article><strong>{done?"已完成":levels[state.progress.currentLevel-1]?.name}</strong><span>今日關卡</span></article><article><strong>{done?"個人止損地圖":levels[state.progress.currentLevel]?.name||"迷霧核心"}</strong><span>下一關預告</span></article></div><a href={cta}>{done ? "查看個人止損地圖" : `開始第 ${state.progress.currentLevel} 關`} →</a></section>}

    {state.quiz && state.profile && <section className="bt-home-route bt-home-character">{characterImage&&<img src={characterImage} alt={`${state.characters.primary?.characterName}角色圖`} loading="lazy"/>}<div><span>你的嘴饞角色</span><h2>{state.characters.primary?.accentIcon} {state.characters.primary?.characterName}</h2><p>對應類型：<b>{typeName(state.quiz.primaryType)}</b></p>{state.characters.secondary&&<p>次要角色：<b>{state.characters.secondary.characterName}</b>｜{typeName(state.quiz.secondaryType)}</p>}<p>推薦破關路線：<b>{state.profile.route}</b></p><small>你的破關路線會以主要類型為主，次要類型作為加強任務。</small><div>{state.profile.tools.map(x => <strong key={x}>{x}</strong>)}</div></div></section>}

    <BadgeCollection earnedBadges={state.progress.earnedBadges.map(String)} entries={state.entries.map(entry=>({earnedBadge:entry.earnedBadge,completedAt:entry.completedAt,actionPointsEarned:entry.actionPointsEarned}))} characterCreated={state.progress.characterCreated}/>

    <section className="bt-intro"><h2>這不是一堆 PDF。<br/>這是一套 7 天嘴饞破關系統。</h2><p>你不需要一次使用所有道具。每天完成一關，就能解鎖一個線索，最後拼出自己的個人止損地圖。</p><ol>{["找出嘴饞角色", "找出破功時間與場景", "破解情緒與身體訊號", "選擇專屬支線任務", "掃描白天營養缺口", "建立晚餐防線", "生成個人止損地圖"].map((x, i) => <li key={x}><span>{i + 1}</span>{x}</li>)}</ol></section>

    <details className="bt-toolbox"><summary><div><span>MISSION TOOLBOX</span><h2>任務道具箱</h2><p>需要時再打開，不必一次使用所有道具。</p></div><b>展開道具箱＋</b></summary>{groups.map(group => <section key={group.title}><h3>{group.title}</h3><div>{group.keys.map(key => {
      const asset = all.find(x => x.key === key);
      if (!asset) return null;
      if (key === "ai-energy-assessment" && !ownedCodes.includes("ai_energy_assessment")) return null;
      const advanced = Boolean(advancedCopy[key]);
      const code = key === "sugary-drink-swap-pro" ? "sugary_drink_swap_pro" : "anti_binge_meal_plan_7d";
      const owned = !advanced || ownedCodes.includes(code);
      const prompt = advancedCopy[key];
      const slug = key === "sugary-drink-swap-pro" ? "drink-swap-pro" : "eating-navigation";
      return <article className={!owned ? "locked" : ""} key={key}><div><small>{advanced ? `進階道具｜${prompt.name}` : "已解鎖道具"}</small><h4>{asset.title}</h4><p>{asset.description}</p><span>使用時機：{timing[key]}</span></div>{owned ? <Actions asset={asset} token={accessToken}/> : <div className="bt-unlock"><b>進階道具尚未解鎖</b><p>{prompt.message}</p><a href={`/pro-tools/${slug}?accessToken=${encodeURIComponent(accessToken)}`}>查看介紹與加購解鎖 →</a></div>}</article>;
    })}</div></section>)}</details>

    <footer className="access-support"><div><span>有問題嗎？</span><h2>可以立即跟我們聯繫</h2><p>破關任務或道具使用有任何問題，都歡迎透過官方社群詢問。</p><strong>{salesPage.brand}</strong></div><div className="access-support-links">{salesPage.contacts.map(x => <a href={x.href} target="_blank" rel="noreferrer" key={x.label}><span>{x.label}</span><small>{x.handle} ↗</small></a>)}</div></footer>
  </div></main>;
}
