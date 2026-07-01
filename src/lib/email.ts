import nodemailer from "nodemailer";
import { prisma } from "./db";
export type EmailAttachment={filename:string;path:string};
export interface EmailService { send(input:{to:string;subject:string;body:string;attachments?:EmailAttachment[]}):Promise<void> }
class DefaultEmailService implements EmailService {
  async send(input:{to:string;subject:string;body:string;attachments?:EmailAttachment[]}) {
    const configured = process.env.SMTP_HOST && process.env.SMTP_FROM;
    const log = await prisma.emailLog.create({data:{to:input.to,subject:input.subject,body:input.body,status:configured?"sending":"queued"}});
    if (!configured) return;
    try {
      const transport=nodemailer.createTransport({host:process.env.SMTP_HOST,port:Number(process.env.SMTP_PORT||587),secure:Number(process.env.SMTP_PORT)===465,auth:process.env.SMTP_USER?{user:process.env.SMTP_USER,pass:process.env.SMTP_PASS}:undefined});
      await transport.sendMail({from:process.env.SMTP_FROM,to:input.to,subject:input.subject,text:input.body,attachments:input.attachments});
      await prisma.emailLog.update({where:{id:log.id},data:{status:"sent",sentAt:new Date()}});
    } catch (e) { await prisma.emailLog.update({where:{id:log.id},data:{status:"failed"}}); throw e; }
  }
}
export const emailService: EmailService = new DefaultEmailService();
