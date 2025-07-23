/*
  Warnings:

  - You are about to drop the column `user_id` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `goals` table. All the data in the column will be lost.
  - Added the required column `userLogin` to the `Plan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userLogin` to the `goals` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Plan" DROP CONSTRAINT "Plan_user_id_fkey";

-- DropForeignKey
ALTER TABLE "goals" DROP CONSTRAINT "goals_user_id_fkey";

-- AlterTable
ALTER TABLE "Plan" DROP COLUMN "user_id",
ADD COLUMN     "userLogin" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "goals" DROP COLUMN "user_id",
ADD COLUMN     "userLogin" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "goals" ADD CONSTRAINT "goals_userLogin_fkey" FOREIGN KEY ("userLogin") REFERENCES "users"("login") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Plan" ADD CONSTRAINT "Plan_userLogin_fkey" FOREIGN KEY ("userLogin") REFERENCES "users"("login") ON DELETE CASCADE ON UPDATE CASCADE;
