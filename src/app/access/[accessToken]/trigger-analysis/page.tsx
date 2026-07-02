import Link from "next/link";
import { authorizeWorkbook } from "@/lib/workbook";
import { triggerAnalysisContent as c } from "@/content/cravingTriggerAnalysis";
import { TriggerAnalysisHome } from "@/components/trigger-analysis/TriggerAnalysisHome";
export default async function TriggerAnalysisPage({params}:{params:Promise<{accessToken:string}>}){const {accessToken}=await params;if(!await authorizeWorkbook(accessToken))return <main className="tm-invalid"><section><span>連結無法使用</span><h1>目前無法開啟觸發點分析器</h1><p>{c.errors.invalid}</p><Link className="btn" href="/">回到網站首頁</Link></section></main>;return <TriggerAnalysisHome accessToken={accessToken}/>}
