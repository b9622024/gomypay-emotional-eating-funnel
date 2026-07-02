import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { paymentEndpoint, paymentFields } from "@/lib/gomypay";
import PaymentHandoff from "./PaymentHandoff";
export default async function Redirect({params}:{params:Promise<{orderNo:string}>}){const {orderNo}=await params;const order=await prisma.order.findUnique({where:{orderNo},include:{customer:true}});if(!order||order.status!=="pending")notFound();return <PaymentHandoff endpoint={paymentEndpoint()} fields={paymentFields(order)}/>}
