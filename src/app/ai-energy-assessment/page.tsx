import { aiEnergyAssessmentContent as content } from "@/content/aiEnergyAssessment";
import { resolveAiAssessmentAccess } from "@/lib/ai-assessment";
import AiAssessmentPageClient from "./AiAssessmentPageClient";

export const dynamic="force-dynamic";
export default async function AiEnergyAssessmentPage({searchParams}:{searchParams:Promise<{accessToken?:string}>}){
  const accessToken=(await searchParams).accessToken;
  const access=await resolveAiAssessmentAccess(accessToken);
  return <AiAssessmentPageClient accessToken={access.valid?accessToken:null} attemptedAccessToken={Boolean(accessToken)} owned={access.owned} content={content}/>;
}
