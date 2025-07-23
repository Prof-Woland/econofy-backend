/*
  Warnings:

  - You are about to drop the column `userLogin` on the `goals` table. All the data in the column will be lost.
  - Added the required column `userId` to the `goals` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "goals" DROP CONSTRAINT "goals_userLogin_fkey";

-- AlterTable
ALTER TABLE "goals" DROP COLUMN "userLogin",
ADD COLUMN     "userId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "goals" ADD CONSTRAINT "goals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
