import {NextResponse} from "next/server";
import {z} from "zod";
import {resetBreakthroughFromLevel} from "@/lib/breakthrough-plan";
import {rateLimit,requestIp} from "@/lib/rate-limit";
const body=z.object({fromLevel:z.number().int().min(1).max(7).default(1)});
export async function POST(req:Request,{params}:{params:Promise<{accessToken:string}>}){const {accessToken}=await params;if(!await rateLimit(`breakthrough-reset:${requestIp(req)}`,8,60000))return NextResponse.json({error:"操作太頻繁，請稍後再試"},{status:429});const parsed=body.safeParse(await req.json().catch(()=>({})));if(!parsed.success)return NextResponse.json({error:"重置關卡不正確"},{status:400});try{return NextResponse.json(await resetBreakthroughFromLevel(accessToken,parsed.data.fromLevel))}catch(error){return NextResponse.json({error:error instanceof Error?error.message:"無法重置關卡"},{status:400})}}
