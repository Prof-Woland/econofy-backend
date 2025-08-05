/*
  Warnings:

  - Added the required column `date` to the `Plan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `limit_money` to the `Plan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `remainder` to the `Plan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `term` to the `Plan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Plan" ADD COLUMN     "date" TEXT NOT NULL,
ADD COLUMN     "limit_money" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "remainder" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "spent_money" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "term" TEXT NOT NULL;
