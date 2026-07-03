import { notFound } from "next/navigation";
import Link from "next/link";
import { RescueMap } from "@/components/breakthrough/BreakthroughPlanClient";
import { getBreakthroughState } from "@/lib/breakthrough-plan";

export default async function PersonalRescueMapPage({ params }: { params: Promise<{ accessToken:string }> }) {
  const { accessToken } = await params;
  const state = await getBreakthroughState(accessToken);
  if (!state) notFound();
  if (!state.map || state.progress.completedLevels.length < 7) return <main className="bt-loading"><h1>個人止損地圖尚未解鎖</h1><p>完成第 0 天角色創建與第 1～7 關後，地圖與破關獎勵會在這裡出現。</p><Link href={`/access/${accessToken}/breakthrough-plan`}>回到今日關卡 →</Link></main>;
  return <main className="bt-app"><header><Link href={`/access/${accessToken}`}>← 回到計畫首頁</Link><b>{state.progress.actionPoints} 行動點數</b></header><div className="bt-overview"><RescueMap token={accessToken} map={state.map} points={state.progress.actionPoints}/></div></main>;
}
