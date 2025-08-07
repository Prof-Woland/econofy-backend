-- CreateEnum
CREATE TYPE "Categories" AS ENUM ('STORE_AND_HOUSEHOLD', 'COSMETICS', 'TRANSPORT', 'HOUSING_AND_COMMUNAL_SERVICES', 'HEALTH', 'INTERNET', 'HOBBY', 'LOANS', 'CLOTH', 'UNFORESSEN_EXPENSES', 'AIRBAG', 'ADDITIONAL_EXPENSES');

-- CreateTable
CREATE TABLE "Expenses" (
    "id" TEXT NOT NULL,
    "plan_id" TEXT NOT NULL,
    "category" "Categories" NOT NULL,
    "expense" DECIMAL(65,30) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Expenses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Expenses_id_key" ON "Expenses"("id");

-- AddForeignKey
ALTER TABLE "Expenses" ADD CONSTRAINT "Expenses_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "Plan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
