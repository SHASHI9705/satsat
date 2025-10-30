-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "dashboardMetricsId" INTEGER;

-- CreateTable
CREATE TABLE "DashboardMetrics" (
    "id" SERIAL NOT NULL,
    "activeListings" INTEGER NOT NULL DEFAULT 0,
    "totalEarnings" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "totalSales" INTEGER NOT NULL DEFAULT 0,
    "newListings" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "DashboardMetrics_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_dashboardMetricsId_fkey" FOREIGN KEY ("dashboardMetricsId") REFERENCES "DashboardMetrics"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DashboardMetrics" ADD CONSTRAINT "DashboardMetrics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
