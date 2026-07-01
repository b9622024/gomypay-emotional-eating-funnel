import { notFound } from "next/navigation";
import WorkbookClient from "@/components/workbook/WorkbookClient";

export const dynamic="force-dynamic";
export default function WorkbookPreview(){
  if(process.env.ENABLE_PREVIEW_PAGES!=="true")notFound();
  return <WorkbookClient accessToken="preview" preview/>;
}
