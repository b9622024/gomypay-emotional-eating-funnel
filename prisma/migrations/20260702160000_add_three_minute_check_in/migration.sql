CREATE TABLE "ThreeMinuteCheckIn" (
    "id" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "customerId" TEXT,
    "orderId" TEXT,
    "cravingItem" TEXT,
    "location" TEXT,
    "beforeActivity" TEXT,
    "bodySignals" JSONB,
    "hungerScore" INTEGER NOT NULL,
    "mouthCravingScore" INTEGER NOT NULL,
    "fatigueScore" INTEGER NOT NULL,
    "stressScore" INTEGER NOT NULL,
    "comfortNeedScore" INTEGER NOT NULL,
    "sugaryDrinkScore" INTEGER NOT NULL,
    "emotionTags" JSONB NOT NULL,
    "needType" TEXT,
    "chosenAction" TEXT,
    "cravingChange" TEXT,
    "finalChoice" TEXT,
    "selfReminder" TEXT,
    "resultType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ThreeMinuteCheckIn_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ThreeMinuteCheckIn_accessToken_createdAt_idx" ON "ThreeMinuteCheckIn"("accessToken", "createdAt");
CREATE INDEX "ThreeMinuteCheckIn_customerId_idx" ON "ThreeMinuteCheckIn"("customerId");
CREATE INDEX "ThreeMinuteCheckIn_orderId_idx" ON "ThreeMinuteCheckIn"("orderId");
ALTER TABLE "ThreeMinuteCheckIn" ADD CONSTRAINT "ThreeMinuteCheckIn_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ThreeMinuteCheckIn" ADD CONSTRAINT "ThreeMinuteCheckIn_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
