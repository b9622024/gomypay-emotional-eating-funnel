import { LockMark } from "@/components/ui/BrandUI";

export type Bump={code:string;name:string;price:number;text:string;note?:string;popularity?:string;priceNote?:string};

export function OrderBumpCard({item,selected,onChange}:{item:Bump;selected:boolean;onChange:(checked:boolean)=>void}){
  return <label className={`order-bump ${selected?"selected":""}`}><input type="checkbox" checked={selected} onChange={e=>onChange(e.target.checked)}/><span>{item.popularity&&<span className="bump-popularity">{item.popularity}</span>}<span className="bump-heading"><strong>{item.name}</strong><b>＋NT${item.price}</b></span>{item.priceNote&&<strong className="bump-price-note">{item.priceNote}</strong>}<p>{item.text}</p>{item.note&&<small>{item.note}</small>}</span></label>;
}

export function CheckoutSummaryCard({selected,total,busy,error}:{selected:Bump[];total:number;busy:boolean;error:string}){
  return <aside className="checkout-summary"><div className="summary-product"><span>你的數位工具包</span><h2>下班後嘴饞止損包</h2><small>7 天情緒性進食＋含糖飲料重置計畫</small></div><ul className="summary-includes"><li>7 天行動計畫</li><li>情緒性進食 6 型測驗</li><li>8 份記錄與急救工具</li><li>購買後立即取得</li></ul><div className="summary-lines"><div className="summary-line"><span>主商品</span><b>NT$199</b></div>{selected.length===0?<div className="summary-line muted-line"><span>尚未選擇加購</span><span>—</span></div>:selected.map(x=><div className="summary-line" key={x.code}><span>{x.name}</span><b>NT${x.price}</b></div>)}</div><div className="summary-total"><span>今日總金額</span><strong>NT${total}</strong></div><button className="btn" disabled={busy} type="submit"><span>{busy?"建立安全訂單中…":"前往安全付款頁"}</span><span>→</span></button>{error&&<p className="checkout-error">{error}</p>}<div className="secure-note"><LockMark/><span>信用卡資料將於 GoMyPay 安全頁面輸入，本網站不會儲存或處理信用卡資料。</span></div></aside>;
}
