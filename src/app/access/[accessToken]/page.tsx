import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { assetsForProducts, digitalAssetsByProduct, recommendedUsage } from "@/content/digitalProducts";

export default async function Access({params}:{params:Promise<{accessToken:string}>}){
  const {accessToken}=await params;
  const canonical=await prisma.entitlement.findUnique({where:{accessToken},include:{order:{include:{entitlements:true}}}});
  if(!canonical||canonical.order.status!=="paid")notFound();

  const assets=assetsForProducts(canonical.order.entitlements.map(item=>item.productCode));
  const ownsMain=canonical.order.entitlements.some(item=>item.productCode==="emotional_eating_reset_7d");
  const pdfUrl=digitalAssetsByProduct.emotional_eating_reset_7d.find(item=>item.key==="reset-action-guide")?.downloadUrl??"#";
  return <main className="access-page"><div className="container">
    <header className="access-hero"><span className="eyebrow">可樂吉健康研究所</span><h1 className="title">你的下班後嘴饞止損包</h1><p className="muted">請依照順序完成工具包。建議每天花 5–10 分鐘填寫，先看懂自己的模式，再開始調整。</p></header>

    {ownsMain&&<section className="access-primary-actions"><a className="access-action pdf" href={pdfUrl}><span>PDF</span><div><small>閱讀版</small><strong>下載 PDF 手冊</strong><p>適合完整閱讀、列印或離線查看。</p></div><i>↓</i></a><a className="access-action interactive" href={`/access/${accessToken}/workbook`}><span>7D</span><div><small>手機填寫版</small><strong>開始 7 天互動工作本</strong><p>直接打勾、評分、填寫，並自動儲存。</p></div><i>→</i></a></section>}

    <section className="access-section"><div className="access-section-heading"><span>RECOMMENDED ORDER</span><h2>建議使用順序</h2><p>不用一次全部做完，照著三個步驟慢慢開始就好。</p></div><div className="progress-strip">{recommendedUsage.map(item=><article key={item.step}><span>STEP {item.step}</span><h3>{item.title}</h3><p>{item.description}</p></article>)}</div></section>

    <section className="access-section"><div className="access-section-heading"><span>YOUR PRODUCTS</span><h2>已購買產品</h2><p>以下內容只根據這筆訂單實際購買的商品顯示。</p></div>{assets.length?<div className="access-grid">{assets.map((item,index)=><article className="access-item" key={item.key}><div className="asset-meta"><span className="tool-number">TOOL {String(index+1).padStart(2,"0")}</span><small>{item.kind}</small></div><h2>{item.title}</h2><p>{item.description}</p>{item.downloadUrl==="#"?<span className="tool-state">連結準備中 · 之後可替換為 Drive／Notion／Tally</span>:<a className="btn" href={item.downloadUrl} rel="noopener noreferrer"><span>開啟內容</span><span>→</span></a>}</article>)}</div>:<div className="access-empty">目前沒有可顯示的數位產品，請聯絡客服協助確認。</div>}</section>
  </div></main>
}
