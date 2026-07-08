-- CreateTable
CREATE TABLE "crash_game_round" (
    "id" TEXT NOT NULL,
    "crashPoint" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "crash_game_round_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crash_game_bet" (
    "id" TEXT NOT NULL,
    "roundId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "betAmount" INTEGER NOT NULL,
    "cashOutAt" DOUBLE PRECISION,
    "winnings" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "crash_game_bet_pkey" PRIMARY KEY ("id")
);
