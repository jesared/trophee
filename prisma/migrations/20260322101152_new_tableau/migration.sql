/*
  Warnings:

  - You are about to drop the column `categoryId` on the `Registration` table. All the data in the column will be lost.
  - You are about to drop the `Category` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[tourId,tableauId,playerId]` on the table `Registration` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `tableauId` to the `Registration` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Registration" DROP CONSTRAINT "Registration_categoryId_fkey";

-- DropIndex
DROP INDEX "Registration_categoryId_idx";

-- DropIndex
DROP INDEX "Registration_playerId_idx";

-- DropIndex
DROP INDEX "Registration_tourId_categoryId_playerId_key";

-- DropIndex
DROP INDEX "Registration_tourId_idx";

-- AlterTable
ALTER TABLE "Player" ADD COLUMN     "club" TEXT,
ADD COLUMN     "licence" TEXT,
ADD COLUMN     "points" INTEGER;

-- AlterTable
ALTER TABLE "Registration" DROP COLUMN "categoryId",
ADD COLUMN     "tableauId" TEXT NOT NULL;

-- DropTable
DROP TABLE "Category";

-- CreateTable
CREATE TABLE "TableauTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "minPoints" INTEGER,
    "maxPoints" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TableauTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tableau" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "tourId" TEXT NOT NULL,

    CONSTRAINT "Tableau_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TableauTemplate_name_key" ON "TableauTemplate"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Registration_tourId_tableauId_playerId_key" ON "Registration"("tourId", "tableauId", "playerId");

-- AddForeignKey
ALTER TABLE "Tableau" ADD CONSTRAINT "Tableau_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "TableauTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tableau" ADD CONSTRAINT "Tableau_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES "Tour"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Registration" ADD CONSTRAINT "Registration_tableauId_fkey" FOREIGN KEY ("tableauId") REFERENCES "Tableau"("id") ON DELETE CASCADE ON UPDATE CASCADE;
