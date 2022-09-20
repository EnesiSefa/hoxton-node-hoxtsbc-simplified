/*
  Warnings:

  - A unique constraint covering the columns `[currency]` on the table `Transaction` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Transaction_currency_key" ON "Transaction"("currency");
