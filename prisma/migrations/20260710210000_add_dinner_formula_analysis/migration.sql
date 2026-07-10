ALTER TABLE "DinnerFormulaEntry"
  ADD COLUMN "daytimeIntakeStatus" TEXT,
  ADD COLUMN "dinnerTimeBand" TEXT,
  ADD COLUMN "tonightConcerns" JSONB,
  ADD COLUMN "contextData" JSONB,
  ADD COLUMN "dinnerFormulaResult" JSONB;
