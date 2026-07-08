/*
  Warnings:

  - You are about to drop the column `tradeId` on the `user_card` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "user_card" DROP CONSTRAINT "user_card_tradeId_fkey";

-- AlterTable
ALTER TABLE "user_card" DROP COLUMN "tradeId";

-- CreateTable
CREATE TABLE "trade_item" (
    "id" TEXT NOT NULL,
    "tradeId" TEXT NOT NULL,
    "userCardId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,

    CONSTRAINT "trade_item_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "trade_item" ADD CONSTRAINT "trade_item_tradeId_fkey" FOREIGN KEY ("tradeId") REFERENCES "trade"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trade_item" ADD CONSTRAINT "trade_item_userCardId_fkey" FOREIGN KEY ("userCardId") REFERENCES "user_card"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
