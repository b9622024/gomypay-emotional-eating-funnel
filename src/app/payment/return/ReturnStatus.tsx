"use client";
import { useEffect, useState } from "react";

export default function ReturnStatus({orderNo,initial}:{orderNo:string;initial:string}) {
  const [status,setStatus]=useState(initial);
  const [checking,setChecking]=useState(false);
  const [message,setMessage]=useState("");

  async function reconcile() {
    if(checking||status==="paid")return;
    setChecking(true);
    setMessage("正在重新向 GoMyPay 確認付款狀態…");
    try{
      const response=await fetch(`/api/orders/${encodeURIComponent(orderNo)}/reconcile`,{method:"POST"});
      const result=await response.json();
      if(response.ok&&result.status)setStatus(result.status);
      if(response.ok&&result.status==="paid"){
        location.href=`/thank-you/${orderNo}`;
        return;
      }
      setMessage("目前還沒查到付款完成。若你已經收到扣款通知，請不要重複付款，保留畫面並聯絡客服協助確認。");
    }catch{
      setMessage("重新確認暫時失敗。若你已完成付款，請不要重複付款，保留畫面並聯絡客服。");
    }finally{
      setChecking(false);
    }
  }

  useEffect(()=>{
    if(status==="paid"||!orderNo)return;
    const id=setInterval(async()=>{
      const r=await fetch(`/api/orders/${encodeURIComponent(orderNo)}`);
      if(r.ok){
        const j=await r.json();
        setStatus(j.status);
        if(j.status==="paid"){
          clearInterval(id);
          location.href=`/thank-you/${orderNo}`;
        }
      }
    },2500);
    return()=>clearInterval(id);
  },[orderNo,status]);

  useEffect(()=>{
    if(status==="paid"||!orderNo)return;
    const timer=setTimeout(()=>void reconcile(),7000);
    return()=>clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[orderNo,status]);

  return <div className="card"><h2>{status==="paid"?"付款完成":"付款確認中，請稍候"}</h2><p>{status==="paid"?"訂單已完成開通。":"我們正在確認 GoMyPay 付款結果。如果背景通知比較慢，你也可以手動重新確認一次。"}</p>{message&&<p className="muted">{message}</p>}<div className="actions">{status==="paid"?<a className="btn" href={`/thank-you/${orderNo}`}>查看我的工具包</a>:<button className="btn" type="button" onClick={reconcile} disabled={checking}>{checking?"確認中…":"重新確認付款狀態"}</button>}</div><p className="muted small">如果你已經完成刷卡或看到扣款通知，請不要再次付款；這個頁面只會在確認成功後開通產品。</p></div>;
}
