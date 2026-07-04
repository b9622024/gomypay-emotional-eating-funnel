"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  eatingNavigationCopy as copy,
  eatingNavigationItems as allItems,
  eatingNavigationScenes as scenes,
  favoriteTags,
  intakeFlags,
  navigationGoals,
  navigationTimes,
} from "@/content/eatingNavigation";
import { analyzeMealCombination, analyzeNavigationMode } from "@/lib/eating-navigation-analysis";

const labels: Record<string, string> = {
  skippedBreakfast: "沒吃早餐", smallLunch: "午餐吃很少", lowProtein: "蛋白質不足",
  lowVegetable: "蔬菜不足", lowWater: "水喝太少", alreadyAtePlenty: "前面已吃很多",
  stableDay: "今天吃得穩定", eatFull: "想吃飽", comfort: "想吃療癒一點",
  quickSolution: "快速解決", controlDrink: "控制飲料", preventNightOvereating: "避免晚上繼續吃",
  keepStable: "維持穩定", breakfast: "早餐", lunch: "午餐", afternoon: "下午",
  dinner: "晚餐", lateNight: "深夜", worse: "更疲憊", same: "差不多", better: "更有精神",
  none: "沒有", mild: "有一點", strong: "很強", protein: "蛋白質", vegetable: "蔬菜",
  carb: "主食", drink: "飲料",
};

const initial = { hungerScore: 5, fatigueScore: 5, rushScore: 5, previousIntakeFlags: [] as string[], currentGoal: "keepStable", optionalTime: "dinner" };

function Slider({ label, value, set, max = 10 }: { label: string; value: number; set: (n: number) => void; max?: number }) {
  return <label className="en-slider"><span>{label}</span><b>{value}</b><input type="range" min="0" max={max} value={value} onChange={e => set(Number(e.target.value))} /></label>;
}

function Choices({ items, value, set, multiple = false }: { items: readonly string[]; value: string | string[]; set: (v: string | string[]) => void; multiple?: boolean }) {
  const selected = Array.isArray(value) ? value : [value];
  return <div className="en-choices">{items.map(item => <button type="button" className={selected.includes(item) ? "selected" : ""} key={item} onClick={() => multiple ? set(selected.includes(item) ? selected.filter(x => x !== item) : [...selected, item]) : set(item)}>{selected.includes(item) ? "✓ " : ""}{labels[item] || item}</button>)}</div>;
}

export default function EatingNavigationClient({ token }: { token: string }) {
  const [step, setStep] = useState(1);
  const [status, setStatus] = useState(initial);
  const [sceneId, setScene] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [result, setResult] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [favoriteTitle, setFavoriteTitle] = useState("我的外食備案");
  const [favoriteTag, setFavoriteTag] = useState("超餓止損版");
  const [review, setReview] = useState({ satietyAfter: 3, energyAfter: "same", stillCraving: "mild", saveAsFavorite: false, note: "" });

  useEffect(() => {
    fetch(`/api/eating-navigation/${token}`).then(r => r.ok ? r.json() : null).then(data => {
      if (data) { setSessions(data.sessions); setFavorites(data.favorites); }
    });
  }, [token]);

  const scene = scenes.find(x => x.id === sceneId);
  const items = allItems.filter(x => x.sceneIds.includes(sceneId));
  const mode = useMemo(() => analyzeNavigationMode(status), [status]);
  const preview = useMemo(() => sceneId ? analyzeMealCombination({ status, sceneId, selectedItemIds: selected }) : null, [status, sceneId, selected]);
  const setStatusKey = (key: string, value: unknown) => setStatus(current => ({ ...current, [key]: value }));

  async function navigate() {
    if (!sceneId || !selected.length) return setMessage("請先選擇場景與正在考慮的餐點");
    setSaving(true);
    const response = await fetch(`/api/eating-navigation/${token}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ statusScan: status, sceneId, selectedItemIds: selected }) });
    const data = await response.json();
    if (response.ok) { setResult(data); setSessions(current => [data.session, ...current].slice(0, 20)); setStep(4); setMessage(""); }
    else setMessage(data.error);
    setSaving(false);
  }

  async function saveReview() {
    setSaving(true);
    const response = await fetch(`/api/eating-navigation/${token}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: result.session.id, finalSelectedItems: selected, ...review }) });
    const data = await response.json();
    if (!response.ok) { setMessage(data.error); setSaving(false); return; }
    setMessage(data.post.suggestedAction);
    if (review.saveAsFavorite) await favorite();
    setStep(5);
    setSaving(false);
  }

  async function favorite() {
    const response = await fetch(`/api/eating-navigation/${token}/favorites`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ title: favoriteTitle, sceneId, items: selected, tags: [favoriteTag], score: result.analysis.totalScore, note: review.note }) });
    const data = await response.json();
    if (response.ok) setFavorites(current => [data.favorite, ...current]);
    setMessage(response.ok ? "✓ 已加入常用外食收藏" : "收藏失敗");
  }

  return <div className="en-app">
    <header><Link href={`/access/${token}`}>← 回到任務道具箱</Link><b>外食補給導航 Pro</b></header>
    <main>
      <section className="en-hero"><span>PRO TOOL · EATING NAVIGATION</span><h1>{copy.title}</h1><h2>{copy.subtitle}</h2><p>這不是固定菜單。先分析你現在的飢餓、疲憊、時間與白天補給，再判斷這一餐最小要補什麼。</p><a href={copy.pdf} target="_blank" rel="noreferrer">下載 PDF 隨身版手冊 ↓</a><small>手機互動時快速導航；想收藏、閱讀或列印時，可以使用 PDF 隨身版手冊。</small></section>

      {step === 1 && <section className="en-panel"><span>01 · 出發前狀態掃描</span><h2>出發前，先看看你現在的狀態</h2><p>同一份外食，會因為你現在的飢餓、疲憊與前一餐狀態，而有不同導航方向。</p><Slider label="現在多餓？" value={status.hungerScore} set={v => setStatusKey("hungerScore", v)} /><Slider label="現在多累？" value={status.fatigueScore} set={v => setStatusKey("fatigueScore", v)} /><Slider label="現在有多趕？" value={status.rushScore} set={v => setStatusKey("rushScore", v)} /><h3>今天前面吃得怎麼樣？</h3><Choices items={intakeFlags} value={status.previousIntakeFlags} multiple set={v => setStatusKey("previousIntakeFlags", v)} /><h3>今天最想要什麼？</h3><Choices items={navigationGoals} value={status.currentGoal} set={v => setStatusKey("currentGoal", v)} /><h3>目前用餐時段</h3><Choices items={navigationTimes} value={status.optionalTime} set={v => setStatusKey("optionalTime", v)} /><aside><b>目前導航模式：{mode.primaryModeName}</b><p>{mode.reasons.join("；") || "目前狀態相對穩定。"}</p><small>{mode.caution}</small></aside><button className="en-primary" onClick={() => setStep(2)}>選擇外食場景 →</button></section>}

      {step === 2 && <section className="en-panel"><span>02 · 10 大外食場景</span><h2>你現在準備去哪裡吃？</h2><div className="en-scenes">{scenes.map(item => <button className={sceneId === item.id ? "selected" : ""} key={item.id} onClick={() => { setScene(item.id); setSelected([]); }}><b>{item.name}</b><small>{item.description}</small></button>)}</div>{scene && <><div className="en-risk"><b>這個場景常見風險</b><p>{scene.commonRisks.join("、")}</p></div><button className="en-primary" onClick={() => setStep(3)}>開始四格判讀 →</button></>}<button className="en-back" onClick={() => setStep(1)}>← 返回狀態掃描</button></section>}

      {step === 3 && scene && <section className="en-panel"><span>03 · 外食補給四格</span><h2>我現在考慮吃什麼？</h2>{(["protein", "vegetable", "carb", "drink"] as const).map(category => <div className="en-category" key={category}><h3>{labels[category]}</h3><Choices items={items.filter(x => x.category === category).map(x => x.name)} value={items.filter(x => selected.includes(x.id)).map(x => x.name)} multiple set={names => setSelected(old => [...old.filter(id => items.find(x => x.id === id)?.category !== category), ...items.filter(x => x.category === category && (names as string[]).includes(x.name)).map(x => x.id)])} /></div>)}{preview && <section className="en-live"><b>即時分數 {preview.totalScore} / 100</b><div><i style={{ width: `${preview.totalScore}%` }} /></div><p>{preview.explanation}</p><strong>最小修正：{preview.smallestUpgrade}</strong></section>}{message && <p className="en-message">{message}</p>}<button className="en-primary" disabled={saving} onClick={navigate}>{saving ? "正在分析…" : "產生三段式導航 →"}</button><button className="en-back" onClick={() => setStep(2)}>← 重新選場景</button></section>}

      {step === 4 && result && <><section className="en-result"><span>YOUR NAVIGATION</span><h2>{result.analysis.totalScore} / 100</h2><p>{result.analysis.explanation}</p><div className="en-score-grid">{[["蛋白質", result.analysis.proteinScore, 30], ["蔬菜", result.analysis.vegetableScore, 25], ["主食", result.analysis.carbScore, 20], ["飲料", result.analysis.drinkScore, 15], ["情境適配", result.analysis.contextFitScore, 10]].map(row => <article key={row[0]}><small>{row[0]}</small><b>{row[1]} / {row[2]}</b></article>)}</div><p>主要缺口：<b>{labels[result.analysis.primaryGap] || "無明顯缺口"}</b></p><strong>先做最小修正：{result.analysis.smallestUpgrade}</strong></section><section className="en-routes">{Object.values(result.suggestions).map((suggestion: any) => <article key={suggestion.title}><span>{suggestion.title}</span><h3>{suggestion.content}</h3><p>{suggestion.why}</p></article>)}</section><section className="en-panel"><span>04 · 吃完後 30 秒回顧</span><Slider label="吃完飽足感" value={review.satietyAfter} max={5} set={v => setReview(x => ({ ...x, satietyAfter: v }))} /><h3>吃完後能量</h3><Choices items={["worse", "same", "better"]} value={review.energyAfter} set={v => setReview(x => ({ ...x, energyAfter: v as string }))} /><h3>還會嘴饞嗎？</h3><Choices items={["none", "mild", "strong"]} value={review.stillCraving} set={v => setReview(x => ({ ...x, stillCraving: v as string }))} /><label className="en-check"><input type="checkbox" checked={review.saveAsFavorite} onChange={e => setReview(x => ({ ...x, saveAsFavorite: e.target.checked }))} /> 收藏成常用備案</label>{review.saveAsFavorite && <div className="en-favorite-fields"><input value={favoriteTitle} onChange={e => setFavoriteTitle(e.target.value)} placeholder="替這個備案命名" /><Choices items={favoriteTags} value={favoriteTag} set={v => setFavoriteTag(v as string)} /></div>}<textarea placeholder="這次觀察（選填）" value={review.note} onChange={e => setReview(x => ({ ...x, note: e.target.value }))} /><button className="en-primary" disabled={saving} onClick={saveReview}>{saving ? "儲存中…" : "儲存 30 秒回顧"}</button></section></>}

      {step === 5 && <section className="en-panel en-finished"><h2>這次導航已完成</h2><p>{message}</p><button className="en-primary" onClick={() => { setStep(1); setScene(""); setSelected([]); setResult(null); }}>再開始一次導航</button></section>}

      <section className="en-library"><div><h2>我的常用外食收藏</h2>{favorites.length ? favorites.map(item => <article key={item.id}><b>{item.title}</b><span>{scenes.find(s => s.id === item.sceneId)?.name}｜{item.score} 分</span></article>) : <p>收藏後，趕時間或再次進入同場景時會優先顯示。</p>}</div><div><h2>最近導航紀錄</h2>{sessions.length ? sessions.slice(0, 20).map(item => <article key={item.id}><b>{scenes.find(s => s.id === item.sceneId)?.name}</b><span>{new Date(item.createdAt).toLocaleString("zh-TW")}</span></article>) : <p>完成第一次導航後，紀錄會顯示在這裡。</p>}</div></section>
    </main>
  </div>;
}
