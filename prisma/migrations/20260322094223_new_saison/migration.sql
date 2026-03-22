/*
  Warnings:

  - You are about to drop the column `tourId` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `tropheeId` on the `Tour` table. All the data in the column will be lost.
  - You are about to drop the `Trophee` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name]` on the table `Category` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tourId,categoryId,playerId]` on the table `Registration` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `tourId` to the `Registration` table without a default value. This is not possible if the table is not empty.
  - Added the required column `seasonId` to the `Tour` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Category" DROP CONSTRAINT "Category_tourId_fkey";

-- DropForeignKey
ALTER TABLE "Tour" DROP CONSTRAINT "Tour_tropheeId_fkey";

-- DropIndex
DROP INDEX "Registration_categoryId_playerId_key";

-- AlterTable
ALTER TABLE "Category" DROP COLUMN "tourId";

-- AlterTable
ALTER TABLE "Registration" ADD COLUMN     "tourId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Tour" DROP COLUMN "tropheeId",
ADD COLUMN     "seasonId" TEXT NOT NULL;

-- DropTable
DROP TABLE "Trophee";

-- CreateTable
CREATE TABLE "Season" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Season_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Season_year_key" ON "Season"("year");

-- CreateIndex
CREATE INDEX "Season_isActive_idx" ON "Season"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE INDEX "Registration_tourId_idx" ON "Registration"("tourId");

-- CreateIndex
CREATE INDEX "Registration_categoryId_idx" ON "Registration"("categoryId");

-- CreateIndex
CREATE INDEX "Registration_playerId_idx" ON "Registration"("playerId");

-- CreateIndex
CREATE UNIQUE INDEX "Registration_tourId_categoryId_playerId_key" ON "Registration"("tourId", "categoryId", "playerId");

-- CreateIndex
CREATE INDEX "Tour_seasonId_date_idx" ON "Tour"("seasonId", "date");

-- CreateIndex
CREATE INDEX "Tour_date_idx" ON "Tour"("date");

-- AddForeignKey
ALTER TABLE "Tour" ADD CONSTRAINT "Tour_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Registration" ADD CONSTRAINT "Registration_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES "Tour"("id") ON DELETE CASCADE ON UPDATE CASCADE;
