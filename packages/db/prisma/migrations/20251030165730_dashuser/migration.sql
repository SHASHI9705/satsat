/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `DashboardMetrics` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "DashboardMetrics_userId_key" ON "DashboardMetrics"("userId");
