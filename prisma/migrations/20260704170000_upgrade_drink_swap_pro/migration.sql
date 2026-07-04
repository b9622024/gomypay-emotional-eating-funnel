ALTER TABLE "DrinkSwapProRecord" ADD COLUMN "drinkId" TEXT;
ALTER TABLE "DrinkSwapProRecord" ADD COLUMN "feeling" TEXT;
ALTER TABLE "DrinkSwapProRecord" ADD COLUMN "context" TEXT;
ALTER TABLE "DrinkSwapProRecord" ADD COLUMN "analysisResult" JSONB;

ALTER TABLE "DrinkSwapProFavorite" ADD COLUMN "drinkId" TEXT;
ALTER TABLE "DrinkSwapProFavorite" ADD COLUMN "context" TEXT;
ALTER TABLE "DrinkSwapProFavorite" ADD COLUMN "originalVersion" TEXT;
ALTER TABLE "DrinkSwapProFavorite" ADD COLUMN "currentVersion" TEXT;
ALTER TABLE "DrinkSwapProFavorite" ADD COLUMN "note" TEXT;

CREATE TABLE "DrinkSwapProProfile" (
  "id" TEXT NOT NULL,
  "accessToken" TEXT NOT NULL,
  "rules" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "DrinkSwapProProfile_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "DrinkSwapProProfile_accessToken_key" ON "DrinkSwapProProfile"("accessToken");

CREATE TABLE "DrinkSwapProObservation" (
  "id" TEXT NOT NULL,
  "accessToken" TEXT NOT NULL,
  "dayNumber" INTEGER NOT NULL,
  "time" TEXT NOT NULL,
  "feeling" TEXT NOT NULL,
  "version" TEXT NOT NULL,
  "reflection" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "DrinkSwapProObservation_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "DrinkSwapProObservation_accessToken_dayNumber_key" ON "DrinkSwapProObservation"("accessToken", "dayNumber");
CREATE INDEX "DrinkSwapProObservation_accessToken_createdAt_idx" ON "DrinkSwapProObservation"("accessToken", "createdAt");
