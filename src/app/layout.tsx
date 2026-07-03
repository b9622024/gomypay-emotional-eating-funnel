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
import "./real-3d-badges.css";
import "./sales-game-refresh.css";
import BadgeUnlockHost from "@/components/badges/BadgeUnlockHost";
export const metadata = { title: "7 天嘴饞破關計畫｜可樂吉健康研究所", description: "每天完成一個小任務，解鎖你的減脂止損地圖" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="zh-Hant"><body>{children}<BadgeUnlockHost/></body></html>; }
