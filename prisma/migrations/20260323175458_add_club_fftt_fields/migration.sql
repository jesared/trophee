-- AlterTable
ALTER TABLE "Club" ADD COLUMN     "contactFirstName" TEXT,
ADD COLUMN     "contactName" TEXT,
ADD COLUMN     "ffttId" TEXT,
ADD COLUMN     "ffttNumber" TEXT,
ADD COLUMN     "hallAddress1" TEXT,
ADD COLUMN     "hallAddress2" TEXT,
ADD COLUMN     "hallAddress3" TEXT,
ADD COLUMN     "hallCity" TEXT,
ADD COLUMN     "hallName" TEXT,
ADD COLUMN     "hallZip" TEXT,
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD COLUMN     "website" TEXT;

-- CreateIndex
CREATE INDEX "Club_ffttNumber_idx" ON "Club"("ffttNumber");
