-- CreateTable
CREATE TABLE "listing_drafts" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "highlights" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "seoKeywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "isApplied" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "listing_drafts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "listing_drafts_propertyId_idx" ON "listing_drafts"("propertyId");

-- AddForeignKey
ALTER TABLE "listing_drafts" ADD CONSTRAINT "listing_drafts_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;
