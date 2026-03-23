-- CreateEnum
CREATE TYPE "PresenceStatus" AS ENUM ('UNKNOWN', 'PRESENT', 'ABSENT');

-- AlterTable
ALTER TABLE "Registration" ADD COLUMN     "presence" "PresenceStatus" NOT NULL DEFAULT 'UNKNOWN';
