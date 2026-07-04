CREATE TABLE "EatingNavigationSession" (
  "id" TEXT NOT NULL,
  "accessToken" TEXT NOT NULL,
  "customerId" TEXT,
  "orderId" TEXT,
  "statusScan" JSONB NOT NULL,
  "navigationModes" JSONB NOT NULL,
  "sceneId" TEXT NOT NULL,
  "selectedItems" JSONB NOT NULL,
  "analysisResult" JSONB NOT NULL,
  "threeRouteSuggestions" JSONB NOT NULL,
  "finalSelectedItems" JSONB,
  "postMealReview" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "EatingNavigationSession_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "EatingNavigationSession_accessToken_createdAt_idx" ON "EatingNavigationSession"("accessToken", "createdAt");
CREATE TABLE "EatingNavigationFavorite" (
  "id" TEXT NOT NULL,
  "accessToken" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "sceneId" TEXT NOT NULL,
  "items" JSONB NOT NULL,
  "tags" JSONB NOT NULL,
  "score" INTEGER NOT NULL,
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "EatingNavigationFavorite_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "EatingNavigationFavorite_accessToken_sceneId_createdAt_idx" ON "EatingNavigationFavorite"("accessToken", "sceneId", "createdAt");
