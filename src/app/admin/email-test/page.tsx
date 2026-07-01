"use client";

import { FormEvent, useState } from "react";

export default function EmailTestPage(){
  const [busy,setBusy]=useState(false);
  const [result,setResult]=useState<{ok:boolean;message:string}|null>(null);

  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();setBusy(true);setResult(null);
    const data=new FormData(event.currentTarget);
    try{
      const response=await fetch("/api/admin/email/test",{method:"POST",headers:{"content-type":"application/json","x-admin-secret":String(data.get("adminSecret")||"")},body:JSON.stringify({to:data.get("email")})});
      const json=await response.json();
      setResult(response.ok?{ok:true,message:"測試信已送出，請檢查收件匣與垃圾郵件。"}:{ok:false,message:json.detail||json.error||"測試失敗"});
    }catch{
      setResult({ok:false,message:"無法連線到網站，請稍後再試。"});
    }finally{setBusy(false)}
  }

  return <main className="admin-test-page"><section className="admin-test-card"><span className="card-kicker">管理員工具</span><h1>SMTP 寄信測試</h1><p>輸入 Vercel 裡設定的 ADMIN_SECRET 與收件信箱，不需要重新建立購買訂單。</p><form onSubmit={submit}><label>管理員密碼<input name="adminSecret" type="password" required autoComplete="off"/></label><label>測試收件信箱<input name="email" type="email" required autoComplete="email"/></label><button className="btn" type="submit" disabled={busy}>{busy?"寄送測試中…":"寄送 SMTP 測試信"}</button></form>{result&&<div className={`admin-test-result ${result.ok?"success":"error"}`}>{result.message}</div>}<small>管理員密碼只會用來驗證這次請求，不會儲存在瀏覽器。</small></section></main>;
}
