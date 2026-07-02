import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { assetsForProducts, emotionalEatingDownloadLinks, recommendedUsage } from "@/content/digitalProducts";
import { salesPage } from "@/content/emotionalEatingSalesPage";
import RememberAccessToken from "@/components/access/RememberAccessToken";

function PdfButton({href,label}:{href:string;label:string}){return href==="#"?<button className="btn asset-download disabled" type="button" disabled><span>{label}</span><small>連結準備中</small></button>:<a className="btn asset-download" href={href} target="_blank" rel="noopener noreferrer"><span>{label}</span><span>↓</span></a>}

export default async function Access({params}:{params:Promise<{accessToken:string}>}){
  const {accessToken}=await params;
  const canonical=await prisma.entitlement.findUnique({where:{accessToken},include:{order:{include:{entitlements:true}}}});
  if(!canonical||canonical.order.status!=="paid")notFound();

  const assets=assetsForProducts(canonical.order.entitlements.map(item=>item.productCode));
  const ownsMain=canonical.order.entitlements.some(item=>item.productCode==="emotional_eating_reset_7d");
  const pdfUrl=emotionalEatingDownloadLinks.actionGuidePdf;
  return <main className="access-page"><div className="container">
    <RememberAccessToken accessToken={accessToken}/>
    <header className="access-hero"><span className="eyebrow">可樂吉健康研究所</span><h1 className="title">你的下班後嘴饞止損包</h1><p className="muted">請依照順序完成工具包。建議每天花 5–10 分鐘填寫，先看懂自己的模式，再開始調整。</p></header>

    {ownsMain&&<section className="access-primary-actions"><a className="access-action quiz" href={`/access/${accessToken}/quiz/emotional-eating`}><span>6T</span><div><small>建議第一步</small><strong>情緒性進食 6 型測驗</strong><p>24 題手機互動測驗，找出主要與次要觸發模式。</p></div><i>→</i></a><a className="access-action pdf" href={pdfUrl}><span>PDF</span><div><small>閱讀版</small><strong>下載 PDF 手冊</strong><p>適合完整閱讀、列印或離線查看。</p></div><i>↓</i></a><a className="access-action interactive" href={`/access/${accessToken}/workbook`}><span>7D</span><div><small>手機填寫版</small><strong>開始 7 天互動工作本</strong><p>直接打勾、評分、填寫，並自動儲存。</p></div><i>→</i></a></section>}

    <section className="access-section"><div className="access-section-heading"><span>RECOMMENDED ORDER</span><h2>建議使用順序</h2><p>不用一次全部做完，照著順序慢慢開始就好。</p></div><div className="progress-strip access-five-steps">{recommendedUsage.map(item=><article key={item.step}><span>STEP {item.step}</span><h3>{item.title}</h3><p>{item.description}</p>{item.action==="quiz"&&ownsMain&&<a href={`/access/${accessToken}/quiz/emotional-eating`}>開始測驗 →</a>}{item.action==="three-minute"&&ownsMain&&<a href={`/access/${accessToken}/three-minute-check`}>開始 3 分鐘檢查 →</a>}{item.action==="trigger-analysis"&&ownsMain&&<a href={`/access/${accessToken}/trigger-analysis`}>開始觸發點分析 →</a>}{item.action==="workbook"&&ownsMain&&<a href={`/access/${accessToken}/workbook`}>開始七日紀錄 →</a>}</article>)}</div></section>

    <section className="access-section"><div className="access-section-heading"><span>YOUR PRODUCTS</span><h2>已購買產品</h2><p>以下內容只根據這筆訂單實際購買的商品顯示。</p></div>{assets.length?<div className="access-grid">{assets.map((item,index)=><article className="access-item" key={item.key}><div className="asset-meta"><span className="tool-number">TOOL {String(index+1).padStart(2,"0")}</span><small>{item.kind}</small></div><h2>{item.title}</h2><p>{item.description}</p>{item.key==="emotional-eating-quiz"?<div className="asset-actions"><a className="btn" href={`/access/${accessToken}/quiz/emotional-eating`}><span>開始手機互動測驗</span><span>→</span></a><PdfButton href={emotionalEatingDownloadLinks.quizGuidePdf} label="下載 PDF 解讀手冊"/></div>:item.key==="three-minute-workbook"?<a className="btn asset-three-minute" href={`/access/${accessToken}/three-minute-check`}><span>開始 3 分鐘檢查</span><span>→</span></a>:item.key==="trigger-analysis"?<a className="btn asset-trigger-analysis" href={`/access/${accessToken}/trigger-analysis`}><span>開啟觸發點分析器</span><span>→</span></a>:item.key==="drink-reset"?<a className="btn asset-interactive" href={`/access/${accessToken}/drink-reset`}><span>開始 7 天飲料重置</span><span>→</span></a>:item.key==="mindful-nutrition"?<a className="btn asset-interactive" href={`/access/${accessToken}/mindful-nutrition-tracker`}><span>開始追蹤</span><span>→</span></a>:item.key==="craving-rescue"?<a className="btn asset-interactive" href={`/access/${accessToken}/craving-rescue`}><span>立即啟動急救器</span><span>→</span></a>:item.key==="reset-action-guide"?<div className="asset-actions"><PdfButton href={emotionalEatingDownloadLinks.actionGuidePdf} label="下載 PDF 閱讀版"/><a className="btn asset-interactive" href={`/access/${accessToken}/workbook`}><span>開啟手機互動版</span><span>→</span></a></div>:item.key==="ai-energy-assessment"?<a className="btn asset-ai" href={`/ai-energy-assessment?accessToken=${encodeURIComponent(accessToken)}`}><span>了解領取與人工解析流程</span><span>→</span></a>:item.downloadUrl==="#"?<span className="tool-state">連結準備中 · 之後可替換為 Drive／Notion／Tally</span>:<a className="btn" href={item.downloadUrl} rel="noopener noreferrer"><span>開啟內容</span><span>→</span></a>}</article>)}</div>:<div className="access-empty">目前沒有可顯示的數位產品，請聯絡客服協助確認。</div>}</section>

    <footer className="access-support"><div><span>有問題嗎？</span><h2>可以立即跟我們聯繫</h2><p>工具包使用、測驗或內容上有任何問題，都歡迎透過官方社群詢問。</p><strong>{salesPage.brand}</strong></div><div className="access-support-links">{salesPage.contacts.map(item=><a href={item.href} target="_blank" rel="noreferrer" key={item.label}><span>{item.label}</span><small>{item.handle} ↗</small></a>)}</div></footer>
  </div></main>
}
