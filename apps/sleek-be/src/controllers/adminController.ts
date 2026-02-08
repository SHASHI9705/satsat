import { Request, Response } from "express";
import prisma from "../prismaClient";

const DAY_WINDOW = 7;

const toDayStart = (date: Date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const addDays = (date: Date, days: number) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

const formatDateKey = (date: Date) => date.toISOString().slice(0, 10);

export const getAdminMetrics = async (req: Request, res: Response): Promise<void> => {
  try {
    const now = new Date();
    const todayStart = toDayStart(now);
    const weekStart = addDays(todayStart, -6);
    const last30Start = addDays(todayStart, -29);

    const [totalUsers, activeUsers7d, newUsersToday, totalListings, listingsAddedToday, itemsSold] =
      await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { updatedAt: { gte: addDays(now, -7) } } }),
        prisma.user.count({ where: { createdAt: { gte: todayStart } } }),
        prisma.item.count(),
        prisma.item.count({ where: { createdAt: { gte: todayStart } } }),
        prisma.item.count({ where: { sold: true } }),
      ]);

    const conversionRate = totalListings > 0 ? itemsSold / totalListings : 0;

    const days = Array.from({ length: DAY_WINDOW }).map((_, idx) => addDays(weekStart, idx));

    const dailyUserGrowth = await Promise.all(
      days.map(async (day) => {
        const nextDay = addDays(day, 1);
        const count = await prisma.user.count({
          where: { createdAt: { gte: day, lt: nextDay } },
        });
        return { date: formatDateKey(day), count };
      })
    );

    const dailyListings = await Promise.all(
      days.map(async (day) => {
        const nextDay = addDays(day, 1);
        const count = await prisma.item.count({
          where: { createdAt: { gte: day, lt: nextDay } },
        });
        return { date: formatDateKey(day), count };
      })
    );

    const dailySold = await Promise.all(
      days.map(async (day) => {
        const nextDay = addDays(day, 1);
        const count = await prisma.item.count({
          where: { sold: true, updatedAt: { gte: day, lt: nextDay } },
        });
        return { date: formatDateKey(day), count };
      })
    );

    const listingsByUser = await prisma.item.groupBy({
      by: ["userId"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
    });

    const soldByUser = await prisma.item.groupBy({
      by: ["userId"],
      where: { sold: true },
      _count: { id: true },
    });

    const soldByUserMap = new Map<number, number>();
    soldByUser.forEach((row) => {
      soldByUserMap.set(row.userId, row._count?.id ?? 0);
    });

    const topSellerCandidates = listingsByUser.slice(0, 5);
    const topSellerIds = topSellerCandidates.map((row) => row.userId);

    const topSellerUsers = await prisma.user.findMany({
      where: { id: { in: topSellerIds } },
      select: { id: true, name: true, email: true },
    });

    const topSellerMap = new Map(topSellerUsers.map((user) => [user.id, user]));

    const powerSellers = await Promise.all(
      topSellerCandidates.map(async (row) => {
        const user = topSellerMap.get(row.userId);
        const soldCount = soldByUserMap.get(row.userId) || 0;
        const listingCount = row._count?.id ?? 0;
        const sellThrough = listingCount > 0 ? soldCount / listingCount : 0;
        const topCategory = await prisma.item.groupBy({
          by: ["category"],
          where: { userId: row.userId },
          _count: { id: true },
          orderBy: { _count: { id: "desc" } },
          take: 1,
        });

        return {
          id: row.userId,
          name: user?.name || "Unknown",
          email: user?.email || "",
          listings: listingCount,
          topCategory: topCategory[0]?.category || "Unknown",
          sellThrough,
        };
      })
    );

    const repeatSellerCount = listingsByUser.filter((row) => (row._count?.id ?? 0) >= 2).length;

    const topCategories = await prisma.item.groupBy({
      by: ["category"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 4,
    });

    const recentSold = await prisma.item.findMany({
      where: { sold: true },
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: { user: { select: { name: true, email: true } } },
    });

    const featuredDemand = await prisma.item.count({
      where: { createdAt: { gte: addDays(now, -7) } },
    });

    const serviceProviders = await prisma.item.groupBy({
      by: ["userId"],
      where: { category: "Tutoring & Services" },
    });

    const highIntentSellers = await prisma.item.groupBy({
      by: ["userId"],
      where: { createdAt: { gte: last30Start } },
      _count: { id: true },
    });

    const highIntentCount = highIntentSellers.filter((row) => (row._count?.id ?? 0) >= 3).length;

    res.status(200).json({
      generatedAt: new Date().toISOString(),
      users: {
        total: totalUsers,
        active7d: activeUsers7d,
        newToday: newUsersToday,
        growthSeries: dailyUserGrowth,
      },
      listings: {
        total: totalListings,
        addedToday: listingsAddedToday,
        soldTotal: itemsSold,
        conversionRate,
        listingsSeries: dailyListings,
        soldSeries: dailySold,
      },
      sellers: {
        powerSellers,
        repeatSellerCount,
        topCategories: topCategories.map((row) => ({
          category: row.category,
          count: row._count?.id ?? 0,
        })),
        recentSold: recentSold.map((item) => ({
          id: item.id,
          name: item.name,
          category: item.category,
          price: item.discountedPrice,
          soldAt: item.updatedAt.toISOString(),
          userName: item.user?.name || "Unknown",
        })),
      },
      revenue: {
        featuredDemand,
        serviceProviders: serviceProviders.length,
        highIntentSellers: highIntentCount,
      },
      trust: {
        reportedListings: 0,
        blockedUsers: 0,
        suspiciousAlerts: 0,
      },
    });
  } catch (error) {
    console.error("Error building admin metrics", error);
    res.status(500).json({ message: "Failed to load admin metrics" });
  }
};
