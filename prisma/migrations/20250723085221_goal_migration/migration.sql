/*
  Warnings:

  - Added the required column `all_money` to the `goals` table without a default value. This is not possible if the table is not empty.
  - Added the required column `date` to the `goals` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "goals" ADD COLUMN     "all_money" INTEGER NOT NULL,
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "saved_money" INTEGER NOT NULL DEFAULT 0;
