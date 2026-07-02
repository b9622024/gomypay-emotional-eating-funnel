import Link from "next/link";
import { authorizeWorkbook } from "@/lib/workbook";
import { dinnerFormulaContent as copy } from "@/content/dinnerFormula";
import DinnerFormulaClient from "@/components/dinner-formula/DinnerFormulaClient";
export default async function Page({params}:{params:Promise<{accessToken:string}>}){const {accessToken}=await params;if(!await authorizeWorkbook(accessToken))return <main className="dinner-invalid"><section><span>DINNER FORMULA</span><h1>目前無法開啟晚餐選擇器</h1><p>{copy.invalid}</p><Link href="/sales/emotional-eating">回到產品介紹</Link></section></main>;return <DinnerFormulaClient accessToken={accessToken}/>}
