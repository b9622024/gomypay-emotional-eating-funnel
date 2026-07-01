-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('pending', 'paid', 'failed', 'cancelled');

-- CreateEnum
CREATE TYPE "PaymentSource" AS ENUM ('return', 'callback', 'query', 'system');

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "lineId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "orderNo" VARCHAR(25) NOT NULL,
    "customerId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'pending',
    "buyerMemo" VARCHAR(500) NOT NULL,
    "gomypayOrderId" TEXT,
    "avcode" TEXT,
    "cardLastNum" TEXT,
    "rawReturnPayload" JSONB,
    "rawCallbackPayload" JSONB,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Entitlement" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "productCode" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "downloadUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Entitlement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentLog" (
    "id" TEXT NOT NULL,
    "orderNo" TEXT NOT NULL,
    "source" "PaymentSource" NOT NULL,
    "payload" JSONB NOT NULL,
    "isVerified" BOOLEAN NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailLog" (
    "id" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentAt" TIMESTAMP(3),

    CONSTRAINT "EmailLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RateLimitEntry" (
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "windowStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RateLimitEntry_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE INDEX "Customer_email_idx" ON "Customer"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Product_code_key" ON "Product"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderNo_key" ON "Order"("orderNo");

-- CreateIndex
CREATE INDEX "Order_customerId_idx" ON "Order"("customerId");

-- CreateIndex
CREATE INDEX "Order_status_createdAt_idx" ON "Order"("status", "createdAt");

-- CreateIndex
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "Entitlement_accessToken_key" ON "Entitlement"("accessToken");

-- CreateIndex
CREATE INDEX "Entitlement_customerId_idx" ON "Entitlement"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "Entitlement_orderId_productCode_key" ON "Entitlement"("orderId", "productCode");

-- CreateIndex
CREATE INDEX "PaymentLog_orderNo_createdAt_idx" ON "PaymentLog"("orderNo", "createdAt");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entitlement" ADD CONSTRAINT "Entitlement_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entitlement" ADD CONSTRAINT "Entitlement_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
