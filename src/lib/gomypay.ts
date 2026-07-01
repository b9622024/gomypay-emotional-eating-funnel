import { createHash, timingSafeEqual } from "crypto";

export const paymentEndpoint = () => process.env.GOMYPAY_MODE === "production"
  ? "https://n.gomypay.asia/ShuntClass.aspx" : "https://n.gomypay.asia/TestShuntClass.aspx";
export const queryEndpoint = () => process.env.GOMYPAY_MODE === "production"
  ? "https://n.gomypay.asia/CallOrder.aspx" : "https://n.gomypay.asia/TestCallOrder.aspx";
export const md5 = (value:string) => createHash("md5").update(value, "utf8").digest("hex");

export function callbackCheck(p: Record<string,string>) {
  const expected = md5(`${p.result ?? ""}${p.e_orderno ?? ""}${process.env.GOMYPAY_HASH_CUSTOMER_ID ?? ""}${p.e_money ?? ""}${p.OrderID ?? ""}${process.env.GOMYPAY_STR_CHECK ?? ""}`);
  const actual = (p.str_check ?? "").toLowerCase();
  if (expected.length !== actual.length) return false;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(actual));
}

const forbidden = /card.?no|creditcard.?no|expire.?date|cvv/i;
export function safePayload(input: Record<string, unknown>): Record<string,string> {
  return Object.fromEntries(Object.entries(input).filter(([key]) => !forbidden.test(key)).map(([key,value]) => [key, String(value).slice(0,1000)]));
}

export function paymentFields(order: {orderNo:string;amount:number;buyerMemo:string;customer:{name:string;phone:string;email:string}}) {
  const base = process.env.APP_BASE_URL?.replace(/\/$/, "") ?? "";
  return {
    Send_Type:"0", Pay_Mode_No:"2", CustomerId:process.env.GOMYPAY_CUSTOMER_ID ?? "", Order_No:order.orderNo,
    Amount:String(order.amount), TransCode:"00", Buyer_Name:order.customer.name, Buyer_Telm:order.customer.phone,
    Buyer_Mail:order.customer.email, Buyer_Memo:order.buyerMemo.slice(0,500), TransMode:"1", Installment:"0",
    Return_url:`${base}/payment/return`, Callback_Url:`${base}/api/gomypay/callback`
  };
}
