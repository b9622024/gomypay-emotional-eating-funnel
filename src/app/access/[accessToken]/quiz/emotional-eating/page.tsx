import { notFound } from "next/navigation";
import EmotionalEatingQuizClient from "@/components/quiz/EmotionalEatingQuizClient";
import { authorizeWorkbook } from "@/lib/workbook";

export default async function EmotionalEatingQuizPage({params}:{params:Promise<{accessToken:string}>}){
  const {accessToken}=await params;
  const authorization=await authorizeWorkbook(accessToken);
  if(!authorization)notFound();
  return <EmotionalEatingQuizClient accessToken={accessToken} ownsAiAssessment={authorization.ownsAiAssessment}/>;
}
