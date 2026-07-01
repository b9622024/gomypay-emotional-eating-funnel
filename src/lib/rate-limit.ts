import { prisma } from "./db";
export async function rateLimit(key:string, limit=20, windowMs=60_000) {
  const now = new Date();
  const row = await prisma.rateLimitEntry.findUnique({where:{key}});
  if (!row || now.getTime()-row.windowStart.getTime() >= windowMs) {
    await prisma.rateLimitEntry.upsert({where:{key},create:{key,count:1,windowStart:now},update:{count:1,windowStart:now}}); return true;
  }
  if (row.count >= limit) return false;
  await prisma.rateLimitEntry.update({where:{key},data:{count:{increment:1}}}); return true;
}
export const requestIp=(r:Request)=>r.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
