"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { buildDinnerSummary, dinnerFormulaContent as copy, type DinnerEntry } from "@/content/dinnerFormula";
import {
  buildDinnerFormulaResult,
  type DaytimeIntakeStatus,
  type DinnerFormulaInput,
  type DinnerFormulaResult,
  type DinnerTimeBand,
  type TonightConcern,
} from "@/lib/dinner-formula-analysis";

type Choice = {
  hungerScore: number;
  fatigueScore: number;
  stressScore: number;
  currentStates: string[];
  daytimeIntakeStatus: DaytimeIntakeStatus;
  dinnerTimeBand: DinnerTimeBand;
  tonightConcerns: TonightConcern[];
  mealScene: string;
  proteinChoice: string;
  vegetableChoice: string;
  carbChoice: string;
  drinkChoice: string;
  closingAction: string;
};

const blank: Choice = {
  hungerScore: 5,
  fatigueScore: 5,
  stressScore: 5,
  currentStates: [],
  daytimeIntakeStatus: "breakfast_and_lunch_stable",
  dinnerTimeBand: "normal_dinner",
  tonightConcerns: [],
  mealScene: "",
  proteinChoice: "",
  vegetableChoice: "",
  carbChoice: "",
  drinkChoice: "",
  closingAction: "",
};

const daytimeLabels: Record<DaytimeIntakeStatus, string> = {
  breakfast_and_lunch_stable: "早餐、午餐都有正常吃",
  breakfast_insufficient: "早餐吃太少",
  lunch_insufficient: "午餐吃太少",
  both_insufficient: "早餐、午餐都不穩",
  almost_no_food: "今天幾乎沒吃",
};
const dinnerTimeLabels: Record<DinnerTimeBand, string> = {
  early_dinner: "下午 5～7 點",
  normal_dinner: "晚上 7～9 點",
  late_dinner: "晚上 9 點後",
};
const concernLabels: Record<TonightConcern, string> = {
  still_hungry_later: "吃不飽，晚點又找東西",
  overeating: "一不小心吃太多",
  sugary_drink: "想喝含糖飲料",
  emotional_reward: "壓力大，容易用晚餐犒賞自己",
  screen_eating: "邊追劇邊繼續吃",
};
const scoreLevelLabels: Record<DinnerFormulaResult["scoreLevel"], string> = {
  weak: "防線偏弱",
  basic: "基礎防線",
  stable: "穩定防線",
  high_fit: "高適配防線",
};
const modeLabels: Record<DinnerFormulaResult["dinnerMode"], string> = {
  high_hunger_refill: "高飢餓補給模式",
  fatigue_rescue: "疲憊補給模式",
  late_light: "晚間輕量模式",
  emotional_reward: "情緒犒賞模式",
  habit_screen: "場景習慣模式",
  drink_loop: "飲料迴路模式",
  balanced: "穩定晚餐模式",
};

function Slider({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return <label className="dinner-field slider"><span>{label}<b>{value} / 10</b></span><input type="range" min="0" max="10" value={value} onChange={e => onChange(Number(e.target.value))} /></label>;
}

function Options({ options, value, onChange, multiple = false }: { options: readonly string[]; value: string | string[]; onChange: (v: string | string[]) => void; multiple?: boolean }) {
  const selected = Array.isArray(value) ? value : [value];
  return <div className="dinner-options">{options.map(x => <button type="button" className={selected.includes(x) ? "selected" : ""} key={x} onClick={() => onChange(multiple ? (selected.includes(x) ? selected.filter(y => y !== x) : [...selected, x]) : x)}><i>{selected.includes(x) ? "✓" : "○"}</i>{x}</button>)}</div>;
}

function SelectField<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: Record<T, string>; onChange: (v: T) => void }) {
  return <label className="dinner-field"><span>{label}</span><select value={value} onChange={e => onChange(e.target.value as T)}>{Object.entries(options).map(([key, labelText]) => <option key={key} value={key}>{labelText as string}</option>)}</select></label>;
}

function ConcernOptions({ value, onChange }: { value: TonightConcern[]; onChange: (v: TonightConcern[]) => void }) {
  return <div className="dinner-options">{Object.entries(concernLabels).map(([key, label]) => {
    const k = key as TonightConcern;
    const selected = value.includes(k);
    return <button key={k} type="button" className={selected ? "selected" : ""} onClick={() => onChange(selected ? value.filter(x => x !== k) : value.length >= 2 ? value : [...value, k])}><i>{selected ? "✓" : "○"}</i>{label}</button>;
  })}</div>;
}

function AfterReport({ entry, onSaved }: { entry: DinnerEntry; onSaved: (x: Partial<DinnerEntry>) => void }) {
  const [data, setData] = useState({ fullnessAfterDinner: entry.fullnessAfterDinner ?? 5, cravingAfterDinner: entry.cravingAfterDinner ?? "", hadSweetDrink: entry.hadSweetDrink, didClosingAction: entry.didClosingAction ?? "", reflection: entry.reflection ?? "" });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  async function save() {
    if (!data.cravingAfterDinner || data.hadSweetDrink === null || !data.didClosingAction) { setMessage("請完成所有回報欄位"); return; }
    setSaving(true);
    const r = await fetch(`/api/dinner-formula/${location.pathname.split("/")[2]}/${entry.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(data) });
    const json = await r.json();
    if (r.ok) { setMessage("✓ 晚餐後回報已儲存"); onSaved(json.entry); } else setMessage(json.error || "儲存失敗");
    setSaving(false);
  }
  return <section className="dinner-after"><span>LATER TONIGHT</span><h2>晚餐後回報</h2><p>可以吃完後再回來填，幫自己看懂這份晚餐是否真的穩定。</p><Slider label="晚餐後飽足感" value={data.fullnessAfterDinner} onChange={v => setData(x => ({ ...x, fullnessAfterDinner: v }))} /><div className="dinner-field"><span>晚餐後有嘴饞嗎？</span><Options options={["有", "沒有", "一點點"]} value={data.cravingAfterDinner} onChange={v => setData(x => ({ ...x, cravingAfterDinner: v as string }))} /></div><div className="dinner-field"><span>有喝甜飲嗎？</span><Options options={["有", "沒有"]} value={data.hadSweetDrink === null ? "" : data.hadSweetDrink ? "有" : "沒有"} onChange={v => setData(x => ({ ...x, hadSweetDrink: v === "有" }))} /></div><div className="dinner-field"><span>有做到晚餐後收尾動作嗎？</span><Options options={["有", "沒有", "部分有"]} value={data.didClosingAction} onChange={v => setData(x => ({ ...x, didClosingAction: v as string }))} /></div><label className="dinner-field"><span>今晚觀察到什麼？</span><textarea rows={3} value={data.reflection} onChange={e => setData(x => ({ ...x, reflection: e.target.value }))} /></label>{message && <p className="dinner-message">{message}</p>}<button className="dinner-primary" disabled={saving} onClick={save}>{saving ? "儲存中…" : "儲存晚餐後回報"}</button></section>;
}

function DiagnosisList({ title, items, empty }: { title: string; items?: string[]; empty: string }) {
  return <article className="dinner-diagnosis-card"><h3>{title}</h3>{items?.length ? <ul>{items.map(item => <li key={item}>{item}</li>)}</ul> : <p>{empty}</p>}</article>;
}

function DinnerDiagnosis({ entry, onApplyUpgrade }: { entry: DinnerEntry; onApplyUpgrade: (entry: DinnerEntry) => void }) {
  const result = entry.dinnerFormulaResult as DinnerFormulaResult | null | undefined;
  if (!result) return <p>{entry.generatedSuggestion}</p>;
  const upgrade = result.minimalUpgrade;
  return <div className="dinner-diagnosis">
    <article className="dinner-score-card">
      <small>今晚防線適配度</small>
      <strong>{result.totalScore}</strong>
      <b>{scoreLevelLabels[result.scoreLevel]}</b>
      <p>{modeLabels[result.dinnerMode]}</p>
    </article>
    <section className="dinner-diagnosis-card wide">
      <h3>系統判斷摘要</h3>
      <p>{result.analysisSummary}</p>
    </section>
    <DiagnosisList title="目前做得好的地方" items={result.strengths} empty="目前還沒有明顯強項，先從最小升級開始即可。" />
    <DiagnosisList title="最大防線漏洞" items={result.vulnerabilities} empty="目前沒有明顯漏洞，這份晚餐和今晚狀態相對匹配。" />
    <DiagnosisList title="和前面關卡的連動" items={result.crossLevelInsights} empty="這次是獨立使用晚餐公式；系統會先根據今晚狀態判斷。" />
    {upgrade && <article className="dinner-upgrade-card">
      <small>最小升級</small>
      <h3>{upgrade.title}</h3>
      <p>{upgrade.reason}</p>
      <b>{upgrade.scoreBefore} → {upgrade.scoreAfter}</b>
      <button type="button" onClick={() => onApplyUpgrade(entry)}>套用這個升級</button>
    </article>}
    <article className="dinner-diagnosis-card wide"><h3>今晚可以這樣吃</h3><p>{result.practicalDinnerAdvice}</p></article>
    <article className="dinner-diagnosis-card wide"><h3>三種晚餐版本</h3><div className="dinner-variations"><p><b>最符合今晚狀態版</b>{result.dinnerVariations.bestFit}</p><p><b>最省事版</b>{result.dinnerVariations.easiest}</p><p><b>最低限度止損版</b>{result.dinnerVariations.minimumRescue}</p></div></article>
    <article className="dinner-diagnosis-card wide"><h3>晚餐後止損提醒</h3><p>{result.afterDinnerTip}</p></article>
  </div>;
}

function Summary({ entries }: { entries: DinnerEntry[] }) {
  if (entries.length < 3) return null;
  const x = buildDinnerSummary(entries);
  return <section className="dinner-summary"><span>YOUR DINNER PATTERN</span><h2>最近的晚餐模式</h2><div><article><small>最常晚餐場景</small><strong>{x.commonScene}</strong></article><article><small>較需要留意</small><strong>{x.mostMissing}</strong></article><article><small>晚餐後嘴饞日</small><strong>{x.cravingDays.length ? x.cravingDays.join("、") : "目前沒有"}</strong></article><article><small>甜飲伴隨嘴饞</small><strong>{x.sweetWithCraving} 次</strong></article></div><p>{x.suggestion}</p></section>;
}

function applyUpgrade(entry: DinnerEntry): DinnerEntry {
  const result = entry.dinnerFormulaResult as DinnerFormulaResult | null | undefined;
  const upgrade = result?.minimalUpgrade;
  if (!upgrade) return entry;
  const next: DinnerEntry = { ...entry };
  if (upgrade.actionType === "add_carb") next.carbChoice = upgrade.suggestedItem;
  if (upgrade.actionType === "add_protein") next.proteinChoice = upgrade.suggestedItem;
  if (upgrade.actionType === "add_vegetable") next.vegetableChoice = upgrade.suggestedItem;
  if (upgrade.actionType === "change_drink" || upgrade.actionType === "reduce_reward_stack") next.drinkChoice = "無糖茶";
  const nextInput: DinnerFormulaInput = {
    hungerScore: next.hungerScore,
    fatigueScore: next.fatigueScore,
    stressScore: next.stressScore,
    currentStates: Array.isArray(next.currentStates) ? next.currentStates.map(String) : [],
    mealScene: next.mealScene,
    proteinChoice: next.proteinChoice,
    vegetableChoice: next.vegetableChoice,
    carbChoice: next.carbChoice,
    drinkChoice: next.drinkChoice,
    closingAction: next.closingAction,
    daytimeIntakeStatus: next.daytimeIntakeStatus as DaytimeIntakeStatus,
    dinnerTimeBand: next.dinnerTimeBand as DinnerTimeBand,
    tonightConcerns: Array.isArray(next.tonightConcerns) ? next.tonightConcerns as TonightConcern[] : [],
  };
  const updated = buildDinnerFormulaResult(nextInput, next.contextData as any);
  return { ...next, generatedSuggestion: updated.analysisSummary, dinnerFormulaResult: updated };
}

export default function DinnerFormulaClient({ accessToken }: { accessToken: string }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(blank);
  const [entries, setEntries] = useState<DinnerEntry[]>([]);
  const [current, setCurrent] = useState<DinnerEntry | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => { fetch(`/api/dinner-formula/${accessToken}`).then(r => r.ok ? r.json() : null).then(x => x && setEntries(x.entries)); }, [accessToken]);
  const scene = form.mealScene ? copy.scenes[form.mealScene] : null;
  function set<K extends keyof Choice>(key: K, value: Choice[K]) { setForm(x => ({ ...x, [key]: value })); }
  function chooseScene(value: string | string[]) {
    const mealScene = value as string;
    setForm(x => ({ ...x, mealScene, proteinChoice: "", vegetableChoice: "", carbChoice: "", drinkChoice: "" }));
    setStep(3);
  }
  async function create() {
    if (!form.proteinChoice || !form.vegetableChoice || !form.carbChoice || !form.drinkChoice || !form.closingAction) { setError("請完成 3-1-1 晚餐與收尾動作"); return; }
    setSaving(true);
    setError("");
    const r = await fetch(`/api/dinner-formula/${accessToken}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(form) });
    const json = await r.json();
    if (r.ok) { setCurrent(json.entry); setEntries(old => [json.entry, ...old].slice(0, 7)); setStep(4); } else setError(json.error || "目前無法儲存");
    setSaving(false);
  }
  function restart() { setForm(blank); setCurrent(null); setStep(1); setError(""); }
  async function applyUpgradeToCurrent(entry: DinnerEntry) {
    const updated = applyUpgrade(entry);
    setCurrent(updated);
    setEntries(old => old.map(x => x.id === updated.id ? updated : x));
    const r = await fetch(`/api/dinner-formula/${accessToken}/${updated.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        mode: "upgrade",
        proteinChoice: updated.proteinChoice,
        vegetableChoice: updated.vegetableChoice,
        carbChoice: updated.carbChoice,
        drinkChoice: updated.drinkChoice,
      }),
    });
    const json = await r.json().catch(() => null);
    if (r.ok && json?.entry) {
      setCurrent(json.entry);
      setEntries(old => old.map(x => x.id === updated.id ? json.entry : x));
    }
  }
  return <div className="dinner-app"><header><Link href={`/access/${accessToken}`}>← 回到工具包</Link><strong>今晚 3-1-1 晚餐診斷與升級器</strong></header><main><section className="dinner-hero"><span>DINNER FORMULA</span><h1>{copy.title}</h1><h2>{copy.subtitle}</h2><p>{copy.intro}</p><div>{copy.formula.map(x => <b key={x}>{x}</b>)}</div></section>
    {step === 1 && <section className="dinner-panel"><span>STEP 1 / 4</span><h2>今晚狀態掃描</h2><Slider label="我現在飢餓程度" value={form.hungerScore} onChange={v => set("hungerScore", v)} /><Slider label="我現在疲憊程度" value={form.fatigueScore} onChange={v => set("fatigueScore", v)} /><Slider label="我現在壓力程度" value={form.stressScore} onChange={v => set("stressScore", v)} /><SelectField label="今天前面吃得如何？" value={form.daytimeIntakeStatus} options={daytimeLabels} onChange={v => set("daytimeIntakeStatus", v)} /><SelectField label="現在的用餐時間" value={form.dinnerTimeBand} options={dinnerTimeLabels} onChange={v => set("dinnerTimeBand", v)} /><div className="dinner-field"><span>今晚最擔心什麼？（最多 2 項）</span><ConcernOptions value={form.tonightConcerns} onChange={v => set("tonightConcerns", v)} /></div><div className="dinner-field"><span>我現在最像哪一種狀態？</span><Options options={copy.states} value={form.currentStates} multiple onChange={v => set("currentStates", v as string[])} /></div>{error && <p className="dinner-error">{error}</p>}<button className="dinner-primary" onClick={() => form.currentStates.length ? (setError(""), setStep(2)) : setError("請至少選擇一個目前狀態")}>選擇外食場景 →</button></section>}
    {step === 2 && <section className="dinner-panel"><span>STEP 2 / 4</span><h2>選擇今晚外食場景</h2><Options options={Object.keys(copy.scenes)} value={form.mealScene} onChange={chooseScene} /><button className="dinner-back" onClick={() => setStep(1)}>← 回到狀態檢查</button></section>}
    {step === 3 && scene && <section className="dinner-panel"><span>STEP 3 / 4</span><h2>建立今晚的 3-1-1 晚餐</h2><p className="dinner-scene">今晚場景：<b>{form.mealScene}</b></p>{scene.note && <aside>{scene.note}</aside>}<div className="dinner-field"><span>1 掌蛋白質</span><Options options={scene.protein} value={form.proteinChoice} onChange={v => set("proteinChoice", v as string)} /></div><div className="dinner-field"><span>3 拳蔬菜或高纖</span><Options options={scene.vegetable} value={form.vegetableChoice} onChange={v => set("vegetableChoice", v as string)} /></div><div className="dinner-field"><span>1 拳澱粉</span><Options options={scene.carb} value={form.carbChoice} onChange={v => set("carbChoice", v as string)} /></div><div className="dinner-field"><span>水或無糖飲</span><Options options={scene.drink} value={form.drinkChoice} onChange={v => set("drinkChoice", v as string)} /></div><div className="dinner-field"><span>晚餐後收尾動作</span><Options options={copy.closingActions} value={form.closingAction} onChange={v => set("closingAction", v as string)} /></div>{error && <p className="dinner-error">{error}</p>}<button className="dinner-primary" disabled={saving} onClick={create}>{saving ? "診斷中…" : "診斷並升級今晚晚餐"}</button><button className="dinner-back" onClick={() => setStep(2)}>← 重新選擇場景</button></section>}
    {step === 4 && current && <><section className="dinner-result"><span>TONIGHT&apos;S DINNER</span><h2>今晚 3-1-1 晚餐診斷</h2><div><article><small>你的蛋白質</small><strong>{current.proteinChoice}</strong></article><article><small>你的蔬菜或高纖</small><strong>{current.vegetableChoice}</strong></article><article><small>你的澱粉</small><strong>{current.carbChoice}</strong></article><article><small>你的飲料</small><strong>{current.drinkChoice}</strong></article><article><small>晚餐後收尾</small><strong>{current.closingAction}</strong></article></div><DinnerDiagnosis entry={current} onApplyUpgrade={applyUpgradeToCurrent} /><aside>{copy.reminder}</aside></section><AfterReport entry={current} onSaved={patch => { setCurrent(x => x ? { ...x, ...patch } : x); setEntries(old => old.map(x => x.id === current.id ? { ...x, ...patch } : x)); }} /><button className="dinner-primary" onClick={restart}>再選一次晚餐</button></>}
    <section className="dinner-history"><h2>最近 7 筆晚餐選擇</h2>{entries.length ? entries.map(x => <article key={x.id}><time>{new Date(x.createdAt).toLocaleString("zh-TW")}</time><strong>{x.mealScene}｜{x.proteinChoice} + {x.vegetableChoice}</strong><span>晚餐後嘴饞：{x.cravingAfterDinner ?? "尚未回報"}</span>{x.fullnessAfterDinner === null && <button onClick={() => { setCurrent(x); setStep(4); scrollTo({ top: 0, behavior: "smooth" }); }}>填寫晚餐後回報</button>}</article>) : <p>完成第一次選擇後，紀錄會出現在這裡。</p>}</section><Summary entries={entries} /><section className="dinner-ai"><span>NEXT STEP</span><h2>{copy.cta.title}</h2><p>{copy.cta.text}</p><small>{copy.cta.note}</small><a href="https://gomypay-emotional-eating-funnel.vercel.app/ai-energy-assessment">{copy.cta.button} →</a></section><p className="dinner-disclaimer">{copy.disclaimer}</p></main></div>;
}
