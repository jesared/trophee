/*
  Warnings:

  - You are about to drop the `SchedulePage` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "Tour" ADD COLUMN     "coverUrl" TEXT,
ADD COLUMN     "rulesUrl" TEXT;

-- DropTable
DROP TABLE "SchedulePage";
