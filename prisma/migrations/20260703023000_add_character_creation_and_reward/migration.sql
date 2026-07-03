ALTER TABLE "BreakthroughPlanProgress"
  ADD COLUMN "characterCreated" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "characterCreatedAt" TIMESTAMP(3),
  ADD COLUMN "primaryCharacterName" TEXT,
  ADD COLUMN "primaryOriginalTypeName" TEXT,
  ADD COLUMN "secondaryCharacterName" TEXT,
  ADD COLUMN "secondaryOriginalTypeName" TEXT;

ALTER TABLE "BreakthroughDailyEntry"
  ADD COLUMN "selectedBranch" TEXT,
  ADD COLUMN "userInputs" JSONB;

ALTER TABLE "PersonalRescueMap"
  ADD COLUMN "primaryCharacterName" TEXT,
  ADD COLUMN "primaryOriginalTypeName" TEXT,
  ADD COLUMN "secondaryCharacterName" TEXT,
  ADD COLUMN "secondaryOriginalTypeName" TEXT,
  ADD COLUMN "bodySignal" TEXT,
  ADD COLUMN "selectedBranch" TEXT,
  ADD COLUMN "firstRescueAction" TEXT,
  ADD COLUMN "rewardUnlocked" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "rewardUnlockedAt" TIMESTAMP(3);
