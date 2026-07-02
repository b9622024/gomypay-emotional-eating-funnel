CREATE TABLE "DrinkResetEntry" ("id" TEXT NOT NULL,"accessToken" TEXT NOT NULL,"customerId" TEXT,"orderId" TEXT,"dayNumber" INTEGER NOT NULL,"data" JSONB NOT NULL,"isCompleted" BOOLEAN NOT NULL DEFAULT false,"completedAt" TIMESTAMP(3),"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP(3) NOT NULL,CONSTRAINT "DrinkResetEntry_pkey" PRIMARY KEY ("id"));
CREATE UNIQUE INDEX "DrinkResetEntry_accessToken_dayNumber_key" ON "DrinkResetEntry"("accessToken", "dayNumber");
CREATE INDEX "DrinkResetEntry_customerId_idx" ON "DrinkResetEntry"("customerId");
CREATE INDEX "DrinkResetEntry_orderId_idx" ON "DrinkResetEntry"("orderId");
ALTER TABLE "DrinkResetEntry" ADD CONSTRAINT "DrinkResetEntry_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "DrinkResetEntry" ADD CONSTRAINT "DrinkResetEntry_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
