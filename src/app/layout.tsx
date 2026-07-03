import "./globals.css";
import "./enhancements.css";
import "./trigger-analysis.css";
import "./drink-reset.css";
import "./mindful-nutrition.css";
import "./craving-rescue.css";
import "./dinner-formula.css";
import "./safe-swap.css";
import "./pro-tools.css";
import "./breakthrough.css";
import "./access-breakthrough.css";
import "./game-achievements.css";
import "./flow-fixes.css";
import BadgeUnlockHost from "@/components/badges/BadgeUnlockHost";
export const metadata = { title: "下班後嘴饞止損包｜可樂吉健康研究所", description: "7 天情緒性進食＋含糖飲料重置計畫" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="zh-Hant"><body>{children}<BadgeUnlockHost/></body></html>; }
