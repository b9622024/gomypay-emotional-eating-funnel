import Link from "next/link";
import EatingNavigationClient from "@/components/pro-tools/EatingNavigationClient";
import { eatingNavigationCopy } from "@/content/eatingNavigation";
import { authorizeProductAccess } from "@/lib/workbook";

export default async function EatingNavigationPage({ params }: { params: Promise<{ accessToken: string }> }) {
  const { accessToken } = await params;
  const access = await authorizeProductAccess(accessToken, "anti_binge_meal_plan_7d");

  if (!access) {
    return <main className="en-access-error"><section><span>PRO TOOL</span><h1>這個進階道具尚未解鎖</h1><p>{eatingNavigationCopy.invalid}</p><Link href={`/access/${accessToken}`}>回到任務道具箱</Link></section></main>;
  }

  return <EatingNavigationClient token={accessToken} />;
}
