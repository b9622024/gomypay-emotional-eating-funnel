import { salesPage as c } from "@/content/emotionalEatingSalesPage";
import { AudienceSection, BonusGridSection, CheckoutLeadSection, FAQSection, HeroSection, PainPointsSection, PricingSection, ProductBundleSection, SalesFooter, TestimonialsSection, TimelineSection } from "@/components/sales/SalesSections";
import {AdvancedToolsSection,CreatorStorySection,MistKingdomSection,PurchaseStartSection,ToolPreviewSection,UsageModesSection,WhyJourneySection} from "@/components/sales/SalesTrustSections";

export const metadata={title:"7 天嘴饞破關計畫｜可樂吉健康研究所",description:"7 天嘴饞破關計畫，透過情緒性進食角色測驗、7 個互動關卡、7 項日常任務道具與個人止損地圖，幫助你看懂下班後嘴饞、含糖飲料、壓力進食與營養缺口。"};

export default function SalesPage(){return <main className="sales-page">
  <header className="site-header"><div className="container"><div className="brand-mark"><span>可</span><strong>{c.brand}</strong></div><a href="/checkout">安全結帳 <span>→</span></a></div></header>
  <HeroSection/>
  <PainPointsSection/>
  <MistKingdomSection/>
  <CreatorStorySection/>
  <WhyJourneySection/>
  <AudienceSection/>
  <ProductBundleSection/>
  <TimelineSection/>
  <UsageModesSection/>
  <ToolPreviewSection/>
  <BonusGridSection/>
  <AdvancedToolsSection/>
  <TestimonialsSection/>
  <PurchaseStartSection/>
  <PricingSection/>
  <FAQSection/>
  <CheckoutLeadSection/>
  <SalesFooter/>
</main>}
