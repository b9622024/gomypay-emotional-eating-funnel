import Link from "next/link";
import { authorizeWorkbook } from "@/lib/workbook";
import { cravingRescueContent as copy } from "@/content/cravingRescue";
import CravingRescueClient from "@/components/craving-rescue/CravingRescueClient";
export default async function Page({params}:{params:Promise<{accessToken:string}>}){const {accessToken}=await params;if(!await authorizeWorkbook(accessToken))return <main className="rescue-invalid"><section><span>CRAVING RESCUE</span><h1>目前無法開啟急救器</h1><p>{copy.invalid}</p><Link href="/sales/emotional-eating">回到產品介紹</Link></section></main>;return <CravingRescueClient accessToken={accessToken}/>}
