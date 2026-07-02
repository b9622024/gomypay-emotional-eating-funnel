import Link from "next/link";
import { authorizeWorkbook } from "@/lib/workbook";
import DrinkResetClient from "@/components/drink-reset/DrinkResetClient";
import { drinkResetContent } from "@/content/drinkReset";

export default async function DrinkResetPage({params}:{params:Promise<{accessToken:string}>}){
  const {accessToken}=await params;
  if(!await authorizeWorkbook(accessToken))return <main className="drink-invalid"><section><span>DRINK RESET</span><h1>目前無法開啟這份工具</h1><p>{drinkResetContent.invalid}</p><Link href="/sales/emotional-eating">回到產品介紹</Link></section></main>;
  return <DrinkResetClient accessToken={accessToken}/>;
}
