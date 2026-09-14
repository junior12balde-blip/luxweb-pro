-- CreateEnum
CREATE TYPE "AutomationType" AS ENUM ('WELCOME_MESSAGE', 'CHECKIN_REMINDER', 'CHECKOUT_REMINDER', 'POST_STAY_FOLLOWUP', 'REVIEW_REQUEST');

-- CreateEnum
CREATE TYPE "AutomationRunStatus" AS ENUM ('DUE', 'DONE', 'DISMISSED');

-- AlterTable
ALTER TABLE "conversations" ADD COLUMN     "checkInDate" TIMESTAMP(3),
ADD COLUMN     "checkOutDate" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "automations" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "type" "AutomationType" NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "offsetHours" INTEGER NOT NULL,
    "messageTemplate" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "automations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automation_runs" (
    "id" TEXT NOT NULL,
    "automationId" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "status" "AutomationRunStatus" NOT NULL DEFAULT 'DUE',
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "automation_runs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "automations_propertyId_type_key" ON "automations"("propertyId", "type");

-- CreateIndex
CREATE INDEX "automation_runs_conversationId_idx" ON "automation_runs"("conversationId");

-- CreateIndex
CREATE UNIQUE INDEX "automation_runs_automationId_conversationId_key" ON "automation_runs"("automationId", "conversationId");

-- AddForeignKey
ALTER TABLE "automations" ADD CONSTRAINT "automations_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automation_runs" ADD CONSTRAINT "automation_runs_automationId_fkey" FOREIGN KEY ("automationId") REFERENCES "automations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automation_runs" ADD CONSTRAINT "automation_runs_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
