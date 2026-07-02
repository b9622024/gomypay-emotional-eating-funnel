"use client";
import { useEffect,useRef,useState } from "react";

export default function PaymentHandoff({endpoint,fields}:{endpoint:string;fields:Record<string,string|number>}){
  const formRef=useRef<HTMLFormElement>(null),[waiting,setWaiting]=useState(true);
  useEffect(()=>{const timer=window.setTimeout(()=>formRef.current?.submit(),650);return()=>window.clearTimeout(timer)},[]);
  return <main className="payment-handoff"><section className="payment-handoff-card"><div className="payment-loader"><i/><i/><i/></div><span className="eyebrow">SECURE PAYMENT</span><h1>正在前往 GoMyPay<br/>安全付款頁</h1><p>正在準備你的訂單與安全付款連線，請稍候，不要關閉這個頁面。</p><div className="handoff-steps"><span className="done">✓ 訂單已建立</span><span className={waiting?"active":"done"}>• 連接 GoMyPay</span><span>• 前往付款頁</span></div><form ref={formRef} action={endpoint} method="POST" onSubmit={()=>setWaiting(false)}>{Object.entries(fields).map(([key,value])=><input key={key} type="hidden" name={key} value={value}/>) }<button className="btn" type="submit"><span>若沒有自動跳轉，請點這裡</span><span>→</span></button></form><small>信用卡資料只會在 GoMyPay 頁面輸入；本網站不會接觸或儲存卡號、有效期限或安全碼。</small></section></main>;
}
