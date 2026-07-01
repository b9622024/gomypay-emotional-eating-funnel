import { salesPage as c } from "@/content/emotionalEatingSalesPage";
import { AudienceSection, BeliefShiftSection, BonusGridSection, CheckoutLeadSection, FAQSection, HeroSection, PainPointsSection, PricingSection, ProductBundleSection, ProductPreviewSection, SalesFooter, TimelineSection, TrustFlowSection, WhyItWorksSection } from "@/components/sales/SalesSections";

export default function SalesPage(){return <main className="sales-page">
  <header className="site-header"><div className="container"><div className="brand-mark"><span>可</span><strong>{c.brand}</strong></div><a href="/checkout">安全結帳 <span>→</span></a></div></header>
  <HeroSection/>
  <PainPointsSection/>
  <BeliefShiftSection/>
  <ProductBundleSection/>
  <AudienceSection/>
  <TimelineSection/>
  <ProductPreviewSection/>
  <BonusGridSection/>
  <WhyItWorksSection/>
  <TrustFlowSection/>
  <PricingSection/>
  <FAQSection/>
  <CheckoutLeadSection/>
  <SalesFooter/>
</main>}
