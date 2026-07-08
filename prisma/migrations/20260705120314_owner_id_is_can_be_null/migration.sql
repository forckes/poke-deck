-- DropForeignKey
ALTER TABLE "user_card" DROP CONSTRAINT "user_card_ownerId_fkey";

-- AlterTable
ALTER TABLE "user_card" ALTER COLUMN "ownerId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "user_card" ADD CONSTRAINT "user_card_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
