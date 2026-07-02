CREATE TABLE "MindfulNutritionEntry" ("id" TEXT NOT NULL,"accessToken" TEXT NOT NULL,"customerId" TEXT,"orderId" TEXT,"dayNumber" INTEGER NOT NULL,"data" JSONB NOT NULL,"isCompleted" BOOLEAN NOT NULL DEFAULT false,"completedAt" TIMESTAMP(3),"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP(3) NOT NULL,CONSTRAINT "MindfulNutritionEntry_pkey" PRIMARY KEY ("id"));
CREATE UNIQUE INDEX "MindfulNutritionEntry_accessToken_dayNumber_key" ON "MindfulNutritionEntry"("accessToken", "dayNumber");
CREATE INDEX "MindfulNutritionEntry_customerId_idx" ON "MindfulNutritionEntry"("customerId");
CREATE INDEX "MindfulNutritionEntry_orderId_idx" ON "MindfulNutritionEntry"("orderId");
ALTER TABLE "MindfulNutritionEntry" ADD CONSTRAINT "MindfulNutritionEntry_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "MindfulNutritionEntry" ADD CONSTRAINT "MindfulNutritionEntry_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
