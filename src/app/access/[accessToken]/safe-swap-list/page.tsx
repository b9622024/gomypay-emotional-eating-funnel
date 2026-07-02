import Link from "next/link";
import { authorizeWorkbook } from "@/lib/workbook";
import { safeSwapContent as copy } from "@/content/safeSwap";
import SafeSwapClient from "@/components/safe-swap/SafeSwapClient";
export default async function Page({params}:{params:Promise<{accessToken:string}>}){const {accessToken}=await params;if(!await authorizeWorkbook(accessToken))return <main className="swap-invalid"><section><span>SAFE SWAP</span><h1>目前無法開啟安全替換清單</h1><p>{copy.invalid}</p><Link href="/sales/emotional-eating">回到產品介紹</Link></section></main>;return <SafeSwapClient accessToken={accessToken}/>}
