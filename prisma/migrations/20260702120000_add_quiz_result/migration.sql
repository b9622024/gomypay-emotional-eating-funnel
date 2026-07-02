-- CreateTable
CREATE TABLE "QuizResult" (
    "id" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "customerId" TEXT,
    "orderId" TEXT,
    "quizType" TEXT NOT NULL,
    "answers" JSONB NOT NULL,
    "scores" JSONB NOT NULL,
    "primaryType" TEXT NOT NULL,
    "secondaryType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "QuizResult_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "QuizResult_accessToken_quizType_key" ON "QuizResult"("accessToken", "quizType");
CREATE INDEX "QuizResult_customerId_idx" ON "QuizResult"("customerId");
CREATE INDEX "QuizResult_orderId_idx" ON "QuizResult"("orderId");
ALTER TABLE "QuizResult" ADD CONSTRAINT "QuizResult_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "QuizResult" ADD CONSTRAINT "QuizResult_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
