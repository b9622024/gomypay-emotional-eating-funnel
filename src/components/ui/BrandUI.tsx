import Link from "next/link";

export function SectionHeading({eyebrow,title,description,align="center"}:{eyebrow?:string;title:string;description?:string;align?:"center"|"left"}){
  return <div className={`section-heading ${align==="left"?"align-left":""}`}>{eyebrow&&<span className="eyebrow">{eyebrow}</span>}<h2>{title}</h2>{description&&<p>{description}</p>}</div>;
}

export function PrimaryCTA({children,href="/checkout",className=""}:{children:string;href?:string;className?:string}){
  return <Link className={`btn ${className}`} href={href}><span>{children}</span><span aria-hidden="true">→</span></Link>;
}

export function TrustPill({children}:{children:string}){return <span className="trust-pill"><span aria-hidden="true">✓</span>{children}</span>}

export function ProductBundleMockup(){return <div className="bundle-stage game-bundle" aria-label="7 天嘴饞破關計畫內容示意">
  <span className="blob blob-one"/><span className="blob blob-two"/>
  <div className="phone-mock"><div className="phone-speaker"/><div className="phone-screen"><span className="mini-brand">可樂吉健康研究所</span><strong>7 天嘴饞<br/>破關計畫</strong><small>今日關卡 · 第 3 關</small><div className="phone-progress"><i/><i/><i/><i/><i/><i/><i/></div></div></div>
  <div className="workbook workbook-back"><span>FINAL REWARD</span><b>完成 7 關<br/>解鎖神秘禮物</b><div className="paper-lines"/></div>
  <div className="workbook workbook-front game-character-preview"><span>DAY 0 · ROLE</span><img src="/game-assets/characters/female/energy-knight.png" alt="能量騎士角色插圖"/><b>先創建你的<br/>嘴饞角色</b></div>
  <div className="bundle-sticker">7 關<br/><b>破關任務</b></div>
</div>}

export function WorkbookPreview(){return <div className="preview-board">
  <div className="preview-paper paper-a"><div className="paper-tag">WORKBOOK 01</div><h3>嘴饞前 3 分鐘</h3><p>此刻我的身體感覺是？</p><div className="scale-row"><i/><i/><i/><i/><i/></div><p>我現在是真的餓，還是想放鬆？</p><div className="choice-row"><span>真的餓</span><span>情緒累</span><span>嘴巴想吃</span></div></div>
  <div className="preview-paper paper-b"><div className="paper-tag green">7 DAY TRACKER</div><h3>含糖飲料重置表</h3>{["今天喝了什麼？","甜度與容量","下一次替換選擇"].map((x,i)=><div className="tracker-row" key={x}><span>{i+1}</span><b>{x}</b><i/></div>)}</div>
</div>}

export function QuizPreview(){return <div className="quiz-preview"><div className="quiz-top"><span>情緒性進食 6 型測驗</span><small>QUESTION 03 / 12</small></div><h3>當工作壓力變大時，<br/>你最常出現哪一種反應？</h3>{["想來一杯甜飲放鬆","回家後一直找零食","白天沒胃口，晚上特別餓"].map((x,i)=><div className="quiz-option" key={x}><span>{String.fromCharCode(65+i)}</span>{x}</div>)}<div className="quiz-types">壓力釋放型 · 疲憊失控型 · 委屈補償型 · 無聊習慣型 · 飲料依賴型 · 營養不足型</div></div>}

export function StickyCheckoutBar(){return <div className="sticky-checkout"><div><small>今日體驗價</small><strong>NT$199</strong></div><PrimaryCTA>立即開始破關</PrimaryCTA></div>}

export function SuccessMark(){return <div className="success-mark" aria-hidden="true">✓</div>}

export function LockMark(){return <span className="lock-mark" aria-hidden="true">⌁</span>}
