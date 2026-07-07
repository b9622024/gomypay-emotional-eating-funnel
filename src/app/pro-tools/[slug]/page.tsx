import { notFound } from "next/navigation";
import SalesAssetImage from "@/components/sales/SalesAssetImage";
import { proAddonBySlug } from "@/content/proAddons";
import { prisma } from "@/lib/db";
import ProAddonPurchaseClient from "./ProAddonPurchaseClient";
import { salesPageAssets } from "@/content/salesPageAssets";

export default async function ProAddonOverview({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ accessToken?: string }> }) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const addon = proAddonBySlug(slug);
  if (!addon || !query.accessToken || query.accessToken.length > 200) notFound();
  const source = await prisma.entitlement.findUnique({ where: { accessToken: query.accessToken }, include: { order: true } });
  if (!source || source.order.status !== "paid") notFound();
  const owned = Boolean(await prisma.entitlement.findFirst({ where: { customerId: source.customerId, productCode: addon.productCode, order: { status: "paid" } }, select: { id: true } }));
  const interactiveHref = `/access/${query.accessToken}${addon.interactivePath}`;
  const preview=salesPageAssets.proTools.find(item=>item.name===addon.title);
  return <main className="pro-overview"><div className="pro-overview-shell"><a className="pro-overview-back" href={`/access/${query.accessToken}`}>← 回到任務道具箱</a><section className="pro-overview-hero"><div><span>ADVANCED TOOL</span><h1>{addon.title}</h1><h2>{addon.subtitle}</h2><p>{addon.description}</p><div className="pro-price"><small>{owned ? "已解鎖" : "購後單獨加購"}</small><strong>{owned ? "可立即使用" : `NT$${addon.standalonePrice}`}</strong><del>結帳頁同步加購 NT${addon.checkoutPrice}</del></div><ProAddonPurchaseClient accessToken={query.accessToken} productCode={addon.productCode} owned={owned} interactiveHref={interactiveHref}/></div><div className="pro-overview-previews"><div><span>PDF</span><SalesAssetImage src={preview?.pdfImage||addon.previewImage} alt={`${addon.title} PDF 預覽`} label={`${addon.title} PDF 預覽`} className="pro-preview-placeholder"/></div><div><span>MOBILE</span><SalesAssetImage src={preview?.mobileImage||addon.previewImage} alt={`${addon.title}手機互動版預覽`} label={`${addon.title}手機互動版預覽`} className="pro-preview-placeholder"/></div></div></section><section className="pro-overview-features"><span>你會取得</span><h2>不是一張清單，而是一個可以反覆使用的互動道具</h2><div>{addon.features.map((feature, index) => <article key={feature}><b>0{index + 1}</b><p>{feature}</p></article>)}</div></section><section className="pro-overview-flow"><h2>購買後如何開始？</h2><p>完成付款後，系統會自動開通權限並寄送通知信。你可以從感謝頁回到原本的工具包主頁，立即開始使用。</p></section></div></main>;
}
