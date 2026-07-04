"use client";
import { useState } from "react";

export default function ProAddonPurchaseClient({ accessToken, productCode, owned, interactiveHref }: { accessToken: string; productCode: string; owned: boolean; interactiveHref: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function buy() {
    setBusy(true); setError("");
    const response = await fetch("/api/orders/pro-addon", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ accessToken, productCode }) });
    const data = await response.json();
    if (response.ok) location.href = `/payment/redirect/${data.orderNo}`;
    else { setError(data.error || "目前無法建立訂單"); setBusy(false); }
  }
  if (owned) return <a className="pro-buy-button" href={interactiveHref}>開始使用已解鎖工具 →</a>;
  return <div><button className="pro-buy-button" disabled={busy} onClick={buy}>{busy ? "正在建立安全訂單…" : "以 NT$149 解鎖此進階道具"}</button>{error && <p className="pro-buy-error">{error}</p>}<small className="pro-payment-note">付款將前往 GoMyPay 安全付款頁；本站不儲存信用卡資料。</small></div>;
}
