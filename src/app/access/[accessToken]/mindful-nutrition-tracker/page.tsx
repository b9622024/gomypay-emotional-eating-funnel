import Link from "next/link";
import { authorizeWorkbook } from "@/lib/workbook";
import { mindfulNutritionContent as content } from "@/content/mindfulNutritionTracker";
import MindfulNutritionClient from "@/components/mindful-nutrition/MindfulNutritionClient";
export default async function Page({params}:{params:Promise<{accessToken:string}>}){const {accessToken}=await params;if(!await authorizeWorkbook(accessToken))return <main className="nutrition-invalid"><section><span>MINDFUL NUTRITION</span><h1>目前無法開啟追蹤器</h1><p>{content.invalid}</p><Link href="/sales/emotional-eating">回到產品介紹</Link></section></main>;return <MindfulNutritionClient accessToken={accessToken}/>}
