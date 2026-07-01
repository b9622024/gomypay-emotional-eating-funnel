import { notFound } from "next/navigation";
import { authorizeWorkbook } from "@/lib/workbook";
import WorkbookClient from "@/components/workbook/WorkbookClient";

export default async function WorkbookPage({params}:{params:Promise<{accessToken:string}>}){
  const {accessToken}=await params;
  if(!await authorizeWorkbook(accessToken))notFound();
  return <WorkbookClient accessToken={accessToken}/>;
}
