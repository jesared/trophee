-- CreateEnum
CREATE TYPE "TourStatus" AS ENUM ('DRAFT', 'OPEN', 'CLOSED', 'DONE');

-- AlterTable
ALTER TABLE "Tour" ADD COLUMN     "status" "TourStatus" NOT NULL DEFAULT 'DRAFT';
