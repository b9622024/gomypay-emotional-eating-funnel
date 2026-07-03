import { notFound } from "next/navigation";
import BreakthroughPlanClient from "@/components/breakthrough/BreakthroughPlanClient";
import { authorizeWorkbook } from "@/lib/workbook";

export default async function LevelPage({ params }: { params: Promise<{ accessToken:string; levelNumber:string }> }) {
  const { accessToken, levelNumber } = await params;
  const level = Number(levelNumber);
  if (!await authorizeWorkbook(accessToken) || !Number.isInteger(level) || level < 1 || level > 7) notFound();
  return <BreakthroughPlanClient token={accessToken} initialLevel={level}/>;
}
