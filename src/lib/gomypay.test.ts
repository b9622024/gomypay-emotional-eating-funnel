import { afterEach, describe, expect, it } from "vitest";
import { callbackCheck, md5, normalizePaymentPayload, safePayload } from "./gomypay";
describe("GoMyPay security helpers",()=>{
 afterEach(()=>{delete process.env.GOMYPAY_HASH_CUSTOMER_ID;delete process.env.GOMYPAY_STR_CHECK});
 it("verifies callback str_check in the required order",()=>{process.env.GOMYPAY_HASH_CUSTOMER_ID="merchant";process.env.GOMYPAY_STR_CHECK="secret";const p={result:"1",e_orderno:"EE2607011234561234",e_money:"199",OrderID:"G123",str_check:md5("1EE2607011234561234merchant199G123secret")};expect(callbackCheck(p)).toBe(true);expect(callbackCheck({...p,e_money:"200"})).toBe(false)});
 it("accepts common GoMyPay field aliases when verifying payloads",()=>{process.env.GOMYPAY_HASH_CUSTOMER_ID="merchant";process.env.GOMYPAY_STR_CHECK="secret";const p={pay_result:"1",Order_No:"EE2607011234561234",Amount:"199",OrderID:"G123",Str_Check:md5("1EE2607011234561234merchant199G123secret")};expect(normalizePaymentPayload(p).orderNo).toBe("EE2607011234561234");expect(callbackCheck(p)).toBe(true)});
 it("removes forbidden card fields from logs",()=>{expect(safePayload({result:"1",CardNo:"4111",Creditcard_No:"411111******1111",ExpireDate:"12/30",CVV:"123",CardLastNum:"1111"})).toEqual({result:"1",CardLastNum:"1111"})});
});
