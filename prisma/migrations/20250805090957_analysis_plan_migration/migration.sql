/*
  Warnings:

  - Added the required column `analysis` to the `Plan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recommendations` to the `Plan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Plan" ADD COLUMN     "analysis" TEXT NOT NULL,
ADD COLUMN     "recommendations" TEXT NOT NULL;
