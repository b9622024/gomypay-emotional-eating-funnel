import { createHash, timingSafeEqual } from "crypto";

const digest=(value:string)=>createHash("sha256").update(value).digest();

/** 站長零元測試通道；必須由伺服器環境變數明確開啟。 */
export function isZeroTestPurchaseCodeValid(input?:string|null){
  const expected=process.env.ZERO_TEST_PURCHASE_CODE?.trim();
  if(process.env.ALLOW_ZERO_TEST_PURCHASE!=="true"||!expected||!input)return false;
  return timingSafeEqual(digest(input.normalize("NFKC").trim()),digest(expected));
}
