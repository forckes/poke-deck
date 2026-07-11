-- AlterTable
ALTER TABLE "card" ADD COLUMN     "name" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "primaryType" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "types" TEXT[];
