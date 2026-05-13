/*
  Warnings:

  - You are about to drop the `UserHistory` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `userId` to the `Check` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "UserHistory" DROP CONSTRAINT "UserHistory_checkId_fkey";

-- DropForeignKey
ALTER TABLE "UserHistory" DROP CONSTRAINT "UserHistory_userId_fkey";

-- AlterTable
ALTER TABLE "Check" ADD COLUMN     "userId" TEXT NOT NULL;

-- DropTable
DROP TABLE "UserHistory";

-- AddForeignKey
ALTER TABLE "Check" ADD CONSTRAINT "Check_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
