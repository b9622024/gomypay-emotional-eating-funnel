import { NextResponse } from "next/server";
import { z } from "zod";
import { emailService, safeSmtpError } from "@/lib/email";
import { rateLimit, requestIp } from "@/lib/rate-limit";

const inputSchema=z.object({to:z.string().email()});

export async function POST(req:Request){
  if(!process.env.ADMIN_SECRET||req.headers.get("x-admin-secret")!==process.env.ADMIN_SECRET)return NextResponse.json({error:"unauthorized"},{status:401});
  if(!await rateLimit(`admin-email-test:${requestIp(req)}`,5,60_000))return NextResponse.json({error:"rate limited"},{status:429});
  try{
    const {to}=inputSchema.parse(await req.json());
    const missing=["SMTP_HOST","SMTP_FROM","SMTP_USER","SMTP_PASS"].filter(name=>!process.env[name]);
    if(missing.length)return NextResponse.json({error:"Vercel 缺少 SMTP 環境變數",detail:`請補上：${missing.join("、")}，並重新部署`},{status:503});
    await emailService.send({to,subject:"可樂吉健康研究所｜SMTP 測試信",body:"如果你收到這封信，代表網站的 SMTP 寄信設定已經連線成功。"});
    return NextResponse.json({ok:true,message:"測試信已交給 SMTP 伺服器"});
  }catch(error){
    if(error instanceof z.ZodError)return NextResponse.json({error:"收件 Email 格式不正確"},{status:400});
    return NextResponse.json({error:"SMTP 寄送失敗",detail:safeSmtpError(error)},{status:502});
  }
}
