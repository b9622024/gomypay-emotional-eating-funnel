import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { salesPage as c } from "@/content/emotionalEatingSalesPage";
import { SuccessMark } from "@/components/ui/BrandUI";
import { proAddonByCode } from "@/content/proAddons";

export default async function ThankYou({ params }: { params: Promise<{ orderNo: string }> }) {
  const { orderNo } = await params;
  const order = await prisma.order.findUnique({ where: { orderNo }, include: { items: true, entitlements: { where: { accessToken: { not: null } }, take: 1 } } });
  if (!order || order.status !== "paid" || !order.entitlements[0]?.accessToken) notFound();
  const accessToken = order.entitlements[0].accessToken;
  const aiOnly = order.items.length === 1 && order.items[0].productCode === "ai_energy_assessment";
  if (aiOnly) return <main className="success-page"><div className="container"><section className="success-card"><SuccessMark/><span className="eyebrow">付款完成</span><h1 className="title">感謝你購買 AI 能量減脂測驗</h1><p>請查看領取說明，再加入 LINE 官方帳號確認測驗與解析時間。</p><a className="btn" href={`/ai-energy-assessment?accessToken=${accessToken}`}><span>查看測驗領取與人工解析流程</span><span>→</span></a></section></div></main>;
  const proAddon = order.items.length === 1 ? proAddonByCode(order.items[0].productCode) : undefined;
  if (proAddon) {
    const mainAccess = await prisma.entitlement.findFirst({ where: { customerId: order.customerId, productCode: "emotional_eating_reset_7d", accessToken: { not: null }, order: { status: "paid" } }, orderBy: { createdAt: "asc" }, select: { accessToken: true } });
    if (!mainAccess?.accessToken) notFound();
    return <main className="success-page"><div className="container"><section className="success-card"><SuccessMark/><span className="eyebrow">付款完成 · 進階道具已解鎖</span><h1 className="title">感謝你購買《{proAddon.title}》</h1><p>你的加購權限已經開通，確認信也會寄送到購買時使用的 Email。</p><p className="muted">回到工具包主頁後，展開「任務道具箱」即可開始使用。</p><a className="btn" href={`/access/${mainAccess.accessToken}`}><span>回到我的工具包主頁</span><span>→</span></a><a className="btn secondary" href={`/access/${mainAccess.accessToken}${proAddon.interactivePath}`}><span>立即開始使用</span><span>→</span></a></section></div></main>;
  }

  return <main className="success-page"><div className="container">
    <section className="success-card"><SuccessMark/><span className="eyebrow">付款完成 · 破關權限已解鎖</span><h1 className="title">恭喜你解鎖《7 天嘴饞破關計畫》</h1><p>接下來不用一次看完所有工具，先從第 0 天開始，創建你的嘴饞角色。</p><p className="muted">角色創建測驗會找出你的嘴饞類型，並依照結果安排後續破關路線。每天完成一個小任務，就能收集線索、解鎖徽章，最後生成自己的個人止損地圖。</p><div className="next-steps"><article><span>DAY 0</span><p>創建嘴饞角色</p></article><article><span>LEVEL 1–7</span><p>每天完成一關</p></article><article><span>FINAL</span><p>生成個人止損地圖</p></article></div><a className="btn" href={`/access/${accessToken}/character-creation`}><span>開始第 0 天｜創建我的嘴饞角色</span><span>→</span></a><div className="contact-links">{c.contacts.map(item => <a href={item.href} target="_blank" rel="noreferrer" key={item.label}>{item.label} ↗</a>)}</div></section>
    <section className="oto-card"><div className="oto-copy"><span className="eyebrow light">你的第一步</span><h2>第 0 天角色創建</h2><p>完成角色創建後，你會知道自己屬於哪一種嘴饞角色，例如壓力法師、能量騎士、療癒牧師、習慣遊俠、飲料鍊金師或補給守衛。</p><p>系統會依照你的角色，推薦最適合的破關路線。</p><a className="btn" href={`/access/${accessToken}/character-creation`}><span>開始角色創建</span><span>→</span></a></div></section>
  </div></main>;
}
