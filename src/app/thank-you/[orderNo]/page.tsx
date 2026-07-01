import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { salesPage as c } from "@/content/emotionalEatingSalesPage";
import { SuccessMark } from "@/components/ui/BrandUI";
import OtoButton from "./OtoButton";

const otoItems=["完整 AI 能量減脂測驗","提交 1 天飲食與嘴饞紀錄","教練協助看一次嘴饞觸發點","3 天每日回報提醒","提供外食與飲料調整方向","NT$399 可折抵正式方案"];

export default async function ThankYou({params}:{params:Promise<{orderNo:string}>}){
  const {orderNo}=await params;
  const order=await prisma.order.findUnique({where:{orderNo},include:{customer:true,entitlements:{where:{accessToken:{not:null}},take:1}}});
  if(!order||order.status!=="paid"||!order.entitlements[0]?.accessToken)notFound();
  return <main className="success-page"><div className="container">
    <section className="success-card"><SuccessMark/><span className="eyebrow">付款完成</span><h1 className="title">恭喜你完成購買</h1><p>你的《下班後嘴饞止損包》已經準備好了。</p><p className="muted">請先完成第 1 天的情緒性進食 6 型測驗，接著開始記錄今天最容易嘴饞的時間點。</p><div className="next-steps"><article><span>STEP 1</span><p>打開工具包</p></article><article><span>STEP 2</span><p>完成 6 型測驗</p></article><article><span>STEP 3</span><p>開始今天的記錄</p></article></div><a className="btn" href={`/access/${order.entitlements[0].accessToken}`}><span>前往我的工具包</span><span>→</span></a><div className="contact-links">{c.contacts.map(item=><a href={item.href} target="_blank" rel="noreferrer" key={item.label}>{item.label} ↗</a>)}</div><p className="muted" style={{fontSize:12}}>使用上有任何問題，都可以透過以上官方社群聯絡我們。</p></section>
    <section className="oto-card"><div className="oto-visual"><div className="oto-calendar"><small>3 DAY SUPPORT</small><strong>03</strong><p>嘴饞止損<br/>陪跑計畫</p></div></div><div className="oto-copy"><span className="eyebrow light">限本頁一次加購</span><h2>3 天嘴饞止損陪跑預約金</h2><p className="oto-price">NT$399</p><p>如果你不想自己看資料，也希望教練幫你看一次狀況，可以加購 3 天嘴饞止損陪跑預約金。</p><ul className="checklist">{otoItems.map(x=><li key={x}>{x}</li>)}</ul><OtoButton customer={order.customer}/></div></section>
  </div></main>;
}
