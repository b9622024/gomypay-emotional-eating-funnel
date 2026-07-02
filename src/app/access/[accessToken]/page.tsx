import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { assetDeliveryLinks, assetsForProducts, recommendedUsage, type DigitalAsset } from "@/content/digitalProducts";
import { salesPage } from "@/content/emotionalEatingSalesPage";
import RememberAccessToken from "@/components/access/RememberAccessToken";

function DeliveryButton({href,label,kind}:{href:string;label:string;kind:"interactive"|"pdf"|"image"}){return href==="#"?<button className={`btn delivery-button ${kind} disabled`} type="button" disabled><span>{label}</span><small>連結準備中</small></button>:<a className={`btn delivery-button ${kind}`} href={href} target={kind==="interactive"?undefined:"_blank"} rel={kind==="interactive"?undefined:"noopener noreferrer"}><span>{label}</span><span>{kind==="interactive"?"→":"↓"}</span></a>}
function ProductAssetActions({item,accessToken}:{item:DigitalAsset;accessToken:string}){const delivery=assetDeliveryLinks[item.key]??{interactivePath:"#",pdfUrl:"#"};const interactive=delivery.interactivePath==="#"?"#":delivery.interactivePath==="/ai-energy-assessment"?`${delivery.interactivePath}?accessToken=${encodeURIComponent(accessToken)}`:`/access/${accessToken}${delivery.interactivePath}`;if(item.key==="ai-energy-assessment")return <div className="asset-actions unified ai-detail-action"><a className="btn delivery-button interactive" href={interactive}><span>點我了解詳情</span><span>→</span></a></div>;return <div className={`asset-actions unified ${delivery.imageUrl!==undefined?"three-buttons":"two-buttons"}`}><DeliveryButton href={interactive} label="手機互動版" kind="interactive"/><DeliveryButton href={delivery.pdfUrl} label="下載 PDF 版" kind="pdf"/>{delivery.imageUrl!==undefined&&<DeliveryButton href={delivery.imageUrl} label="下載單張圖片" kind="image"/>}</div>}

export default async function Access({params}:{params:Promise<{accessToken:string}>}){
  const {accessToken}=await params;
  const canonical=await prisma.entitlement.findUnique({where:{accessToken},include:{order:{include:{entitlements:true}}}});
  if(!canonical||canonical.order.status!=="paid")notFound();

  const assets=assetsForProducts(canonical.order.entitlements.map(item=>item.productCode));
  const ownsMain=canonical.order.entitlements.some(item=>item.productCode==="emotional_eating_reset_7d");
  return <main className="access-page"><div className="container">
    <RememberAccessToken accessToken={accessToken}/>
    <header className="access-hero"><span className="eyebrow">可樂吉健康研究所</span><h1 className="title">你的下班後嘴饞止損包</h1><p className="muted">請依照順序完成工具包。建議每天花 5–10 分鐘填寫，先看懂自己的模式，再開始調整。</p></header>

    <section className="access-section"><div className="access-section-heading"><span>RECOMMENDED ORDER</span><h2>建議使用順序</h2><p>不用一次全部做完，照著順序慢慢開始就好。</p></div><div className="progress-strip access-three-steps">{recommendedUsage.map(item=><article key={item.step}><span>STEP {item.step}</span><h3>{item.title}</h3><p>{item.description}</p>{item.action==="quiz"&&ownsMain&&<a href={`/access/${accessToken}/quiz/emotional-eating`}>開始測驗 →</a>}{item.action==="workbook"&&ownsMain&&<a href={`/access/${accessToken}/workbook`}>開始七日紀錄 →</a>}{item.action==="tools"&&<a href="#purchased-tools">選擇追蹤工具 ↓</a>}</article>)}</div></section>

    <span id="purchased-tools" className="scroll-anchor"/>
    <section className="access-section"><div className="access-section-heading"><span>YOUR PRODUCTS</span><h2>已購買產品</h2><p>手機互動版適合直接操作；PDF 與單張圖片可下載永久保存。</p></div>{assets.length?<div className="access-grid">{assets.map((item,index)=><article className="access-item" key={item.key}><div className="asset-meta"><span className="tool-number">TOOL {String(index+1).padStart(2,"0")}</span><small>{item.kind}</small></div><h2>{item.title}</h2>{item.badge&&<span className="asset-paid-badge">{item.badge}</span>}<p>{item.description}</p><ProductAssetActions item={item} accessToken={accessToken}/></article>)}</div>:<div className="access-empty">目前沒有可顯示的數位產品，請聯絡客服協助確認。</div>}</section>

    <footer className="access-support"><div><span>有問題嗎？</span><h2>可以立即跟我們聯繫</h2><p>工具包使用、測驗或內容上有任何問題，都歡迎透過官方社群詢問。</p><strong>{salesPage.brand}</strong></div><div className="access-support-links">{salesPage.contacts.map(item=><a href={item.href} target="_blank" rel="noreferrer" key={item.label}><span>{item.label}</span><small>{item.handle} ↗</small></a>)}</div></footer>
  </div></main>
}
