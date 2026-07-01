import { afterEach, describe, expect, it } from "vitest";
import { isZeroTestPurchaseCodeValid } from "./zero-test-purchase";

describe("zero-cost owner test purchase",()=>{
  afterEach(()=>{delete process.env.ALLOW_ZERO_TEST_PURCHASE;delete process.env.ZERO_TEST_PURCHASE_CODE});
  it("stays disabled unless explicitly enabled",()=>{
    process.env.ZERO_TEST_PURCHASE_CODE="a-long-private-test-code";
    expect(isZeroTestPurchaseCodeValid("a-long-private-test-code")).toBe(false);
  });
  it("accepts only the configured private code",()=>{
    process.env.ALLOW_ZERO_TEST_PURCHASE="true";
    process.env.ZERO_TEST_PURCHASE_CODE="a-long-private-test-code";
    expect(isZeroTestPurchaseCodeValid("a-long-private-test-code")).toBe(true);
    expect(isZeroTestPurchaseCodeValid("wrong-code")).toBe(false);
  });
});
