import Link from "next/link";
import { authorizeWorkbook } from "@/lib/workbook";
import { threeMinuteCheckContent as c } from "@/content/threeMinuteCheck";
import ThreeMinuteCheckPage from "@/components/three-minute/ThreeMinuteCheckPage";

export default async function ThreeMinutePage({params}:{params:Promise<{accessToken:string}>}){const {accessToken}=await params;const owner=await authorizeWorkbook(accessToken);if(!owner)return <main className="tm-invalid"><section><span>連結無法使用</span><h1>目前無法開啟 3 分鐘工作本</h1><p>{c.errors.invalid}</p><Link className="btn" href="/">回到網站首頁</Link></section></main>;return <ThreeMinuteCheckPage accessToken={accessToken}/>}
