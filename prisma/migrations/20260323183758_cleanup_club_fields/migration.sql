/*
  Warnings:

  - You are about to drop the column `hallAddress2` on the `Club` table. All the data in the column will be lost.
  - You are about to drop the column `hallAddress3` on the `Club` table. All the data in the column will be lost.
  - You are about to drop the column `latitude` on the `Club` table. All the data in the column will be lost.
  - You are about to drop the column `longitude` on the `Club` table. All the data in the column will be lost.
  - You are about to drop the column `website` on the `Club` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Club" DROP COLUMN "hallAddress2",
DROP COLUMN "hallAddress3",
DROP COLUMN "latitude",
DROP COLUMN "longitude",
DROP COLUMN "website";
