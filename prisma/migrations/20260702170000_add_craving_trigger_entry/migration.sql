CREATE TABLE "CravingTriggerEntry" (
    "id" TEXT NOT NULL,"accessToken" TEXT NOT NULL,"customerId" TEXT,"orderId" TEXT,"occurredAt" TIMESTAMP(3),"location" TEXT,"cravingItem" TEXT,"cravingScore" INTEGER,"hungerScore" INTEGER,"stressScore" INTEGER,"fatigueScore" INTEGER,"didEatOrDrink" BOOLEAN,"consumedItem" TEXT,"afterFeeling" JSONB,"beforeActivity" TEXT,"beforeEvent" TEXT,"beforeEmotion" TEXT,"bodyState" TEXT,"lastMealTime" TEXT,"lastMealEnough" TEXT,"waterEnough" TEXT,"sleepPoor" BOOLEAN,"triggerTypes" JSONB,"mainTrigger" TEXT,"notes" TEXT,"nextStrategy" TEXT,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP(3) NOT NULL,CONSTRAINT "CravingTriggerEntry_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "CravingTriggerEntry_accessToken_createdAt_idx" ON "CravingTriggerEntry"("accessToken", "createdAt");
CREATE INDEX "CravingTriggerEntry_customerId_idx" ON "CravingTriggerEntry"("customerId");
CREATE INDEX "CravingTriggerEntry_orderId_idx" ON "CravingTriggerEntry"("orderId");
ALTER TABLE "CravingTriggerEntry" ADD CONSTRAINT "CravingTriggerEntry_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CravingTriggerEntry" ADD CONSTRAINT "CravingTriggerEntry_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
