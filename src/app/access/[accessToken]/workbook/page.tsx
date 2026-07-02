import { notFound } from "next/navigation";
import { authorizeWorkbook } from "@/lib/workbook";
import WorkbookClient from "@/components/workbook/WorkbookClient";

export default async function WorkbookPage({params}:{params:Promise<{accessToken:string}>}){
  const {accessToken}=await params;
  const authorization=await authorizeWorkbook(accessToken);
  if(!authorization)notFound();
  return <WorkbookClient accessToken={accessToken} ownsAiAssessment={authorization.ownsAiAssessment}/>;
}
