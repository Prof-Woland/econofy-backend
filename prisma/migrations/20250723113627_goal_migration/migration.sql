/*
  Warnings:

  - The primary key for the `Avatar` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `user_login` on the `Avatar` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[id]` on the table `Avatar` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id]` on the table `Avatar` will be added. If there are existing duplicate values, this will fail.
  - The required column `id` was added to the `Avatar` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `user_id` to the `Avatar` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Avatar" DROP CONSTRAINT "Avatar_user_login_fkey";

-- DropIndex
DROP INDEX "Avatar_user_login_key";

-- AlterTable
ALTER TABLE "Avatar" DROP CONSTRAINT "Avatar_pkey",
DROP COLUMN "user_login",
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL,
ADD CONSTRAINT "Avatar_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "Avatar_id_key" ON "Avatar"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Avatar_user_id_key" ON "Avatar"("user_id");

-- AddForeignKey
ALTER TABLE "Avatar" ADD CONSTRAINT "Avatar_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
