"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { collection, getDocs } from "firebase/firestore";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Clock,
  MessageCircle,
  PackageCheck,
  Percent,
  ShieldCheck,
  ShoppingBag,
  TrendingDown,
  TrendingUp,
  Users,
  UserPlus,
  Zap,
} from "lucide-react";

import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Card } from "../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import Loader from "../../components/Loader";
import { useAuth } from "../../firebase/AuthProvider";
import { db } from "../../firebase/firebaseConfig";

const containerMotion = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const staggerMotion = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const trendVariants = {
  up: "bg-emerald-50 text-emerald-700",
  down: "bg-rose-50 text-rose-700",
};

const chartPalette = {
  primary: "#0f766e",
  secondary: "#1d4ed8",
  muted: "#94a3b8",
};

function buildLinePath(points: { x: number; y: number }[]) {
  return points.map((point, idx) => `${idx === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
}

function LineChart({
  data,
  comparison,
  height = 160,
}: {
  data: number[];
  comparison?: number[];
  height?: number;
}) {
  const safeData = data.length > 1 ? data : [0, ...data];
  const safeComparison = comparison && comparison.length > 1 ? comparison : comparison && comparison.length === 1 ? [0, ...comparison] : comparison;
  const width = 320;
  const padding = 16;
  const allValues = safeComparison ? safeData.concat(safeComparison) : safeData;
  const max = Math.max(...allValues) || 1;
  const min = Math.min(...allValues) || 0;
  const span = max - min || 1;

  const toPoints = (values: number[]) =>
    values.map((value, idx) => {
      const x = padding + (idx / (values.length - 1)) * (width - padding * 2);
      const y = height - padding - ((value - min) / span) * (height - padding * 2);
      return { x, y };
    });

  const primaryPoints = toPoints(safeData);
  const primaryPath = buildLinePath(primaryPoints);

  const comparisonPoints = safeComparison ? toPoints(safeComparison) : [];
  const comparisonPath = safeComparison ? buildLinePath(comparisonPoints) : "";

  const areaPath = `${primaryPath} L ${width - padding} ${height - padding} L ${padding} ${height - padding} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-40" role="img">
      <defs>
        <linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={chartPalette.primary} stopOpacity="0.25" />
          <stop offset="100%" stopColor={chartPalette.primary} stopOpacity="0" />
        </linearGradient>
      </defs>
      <g stroke={chartPalette.muted} strokeWidth="1" opacity="0.2">
        {[0, 1, 2, 3].map((idx) => (
          <line
            key={idx}
            x1={padding}
            x2={width - padding}
            y1={padding + (idx / 3) * (height - padding * 2)}
            y2={padding + (idx / 3) * (height - padding * 2)}
          />
        ))}
      </g>
      <path d={areaPath} fill="url(#chartFill)" />
      <motion.path
        d={primaryPath}
        fill="none"
        stroke={chartPalette.primary}
        strokeWidth="3"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1 }}
      />
      {safeComparison && (
        <motion.path
          d={comparisonPath}
          fill="none"
          stroke={chartPalette.secondary}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="6 6"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.1, delay: 0.1 }}
        />
      )}
    </svg>
  );
}

function HeatmapCell({ value }: { value: number }) {
  const classes =
    value > 0.85
      ? "bg-emerald-600"
      : value > 0.65
      ? "bg-emerald-500"
      : value > 0.45
      ? "bg-emerald-400"
      : value > 0.25
      ? "bg-emerald-300"
      : "bg-emerald-100";

  return <div className={`h-8 w-8 rounded-md ${classes}`} />;
}

type AdminMetrics = {
  generatedAt: string;
  users: {
    total: number;
    active7d: number;
    newToday: number;
    growthSeries: { date: string; count: number }[];
  };
  listings: {
    total: number;
    addedToday: number;
    soldTotal: number;
    conversionRate: number;
    listingsSeries: { date: string; count: number }[];
    soldSeries: { date: string; count: number }[];
  };
  sellers: {
    powerSellers: {
      id: number;
      name: string;
      email: string;
      listings: number;
      topCategory: string;
      sellThrough: number;
    }[];
    repeatSellerCount: number;
    topCategories: { category: string; count: number }[];
    recentSold: {
      id: number;
      name: string;
      category: string;
      price: number;
      soldAt: string;
      userName: string;
    }[];
  };
  revenue: {
    featuredDemand: number;
    serviceProviders: number;
    highIntentSellers: number;
  };
  trust: {
    reportedListings: number;
    blockedUsers: number;
    suspiciousAlerts: number;
  };
};

type ChatStats = {
  totalChats: number;
  chatsPerListing: number;
  listingsWithZeroChatsRate: number;
  averageFirstMessageMinutes: number | null;
  mostActiveWindow: string;
  dailySeries: { date: string; count: number }[];
  heatmapRows: { label: string; values: number[] }[];
};

const formatNumber = (value: number) => value.toLocaleString();

const formatPercent = (value: number, withSign = false) => {
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";
  const formatted = `${Math.abs(value * 100).toFixed(1)}%`;
  return withSign ? `${sign}${formatted}` : formatted;
};

const formatMinutes = (value: number | null) => {
  if (!value || Number.isNaN(value)) return "-";
  if (value < 60) return `${Math.round(value)}m`;
  const hours = Math.floor(value / 60);
  const minutes = Math.round(value % 60);
  return `${hours}h ${minutes}m`;
};

const toDate = (value: any) => {
  if (!value) return null;
  if (typeof value.toDate === "function") return value.toDate();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const toSeriesChange = (series: { count: number }[]) => {
  if (series.length < 2) return 0;
  const current = series[series.length - 1].count;
  const previous = series[series.length - 2].count;
  if (previous === 0) return 0;
  return (current - previous) / previous;
};

export default function AdminPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [authReady, setAuthReady] = useState(false);
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [chatStats, setChatStats] = useState<ChatStats | null>(null);
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [loadingChats, setLoadingChats] = useState(true);
  const [metricsError, setMetricsError] = useState<string | null>(null);

  const adminEmails = useMemo(() => {
    return (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean);
  }, []);

  const isAdmin = !!user?.email && adminEmails.includes(user.email.toLowerCase());
  const adminAccess = adminEmails.length > 0 && isAdmin;

  useEffect(() => {
    setAuthReady(true);
  }, [user]);

  useEffect(() => {
    if (!adminAccess) return;
    let isMounted = true;

    const loadMetrics = async () => {
      setLoadingMetrics(true);
      setMetricsError(null);
      try {
        if (!process.env.NEXT_PUBLIC_BACKEND_URL) {
          throw new Error("NEXT_PUBLIC_BACKEND_URL is not configured.");
        }
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/metrics`);
        if (!response.ok) {
          throw new Error(`Admin metrics request failed (${response.status}).`);
        }
        const data = (await response.json()) as AdminMetrics;
        if (isMounted) setMetrics(data);
      } catch (error: any) {
        if (isMounted) setMetricsError(error?.message || "Failed to load admin metrics.");
      } finally {
        if (isMounted) setLoadingMetrics(false);
      }
    };

    loadMetrics();
    return () => {
      isMounted = false;
    };
  }, [adminAccess]);

  useEffect(() => {
    if (!adminAccess || !metrics) return;
    let isMounted = true;

    const loadChats = async () => {
      setLoadingChats(true);
      try {
        const chatsSnap = await getDocs(collection(db, "chats"));
        const chats = chatsSnap.docs.map((doc) => ({ id: doc.id, ...(doc.data() as any) }));
        const totalChats = chats.length;
        const totalListings = metrics.listings.total;
        const productIds = new Set(
          chats.map((chat) => chat.productId).filter((id) => typeof id === "string" && id.length > 0)
        );
        const chatsPerListing = totalListings ? totalChats / totalListings : 0;
        const listingsWithZeroChatsRate = totalListings
          ? Math.max(0, (totalListings - productIds.size) / totalListings)
          : 0;

        const firstMessageDurations = chats
          .map((chat) => {
            const createdAt = toDate(chat.createdAt);
            const lastMessageTime = toDate(chat.lastMessageTime);
            if (!createdAt || !lastMessageTime) return null;
            const minutes = (lastMessageTime.getTime() - createdAt.getTime()) / 60000;
            return minutes >= 0 ? minutes : null;
          })
          .filter((value): value is number => typeof value === "number");

        const averageFirstMessageMinutes = firstMessageDurations.length
          ? firstMessageDurations.reduce((sum, value) => sum + value, 0) / firstMessageDurations.length
          : null;

        const dayStart = (date: Date) => {
          const d = new Date(date);
          d.setHours(0, 0, 0, 0);
          return d;
        };

        const rangeEnd = dayStart(new Date());
        const rangeStart = new Date(rangeEnd);
        rangeStart.setDate(rangeStart.getDate() - 6);
        const dailySeries = Array.from({ length: 7 }).map((_, idx) => {
          const day = new Date(rangeStart);
          day.setDate(rangeStart.getDate() + idx);
          const nextDay = new Date(day);
          nextDay.setDate(day.getDate() + 1);
          const count = chats.filter((chat) => {
            const createdAt = toDate(chat.createdAt);
            return createdAt && createdAt >= day && createdAt < nextDay;
          }).length;
          return { date: day.toISOString().slice(0, 10), count };
        });

        const hourCounts = Array.from({ length: 24 }, () => 0);
        chats.forEach((chat) => {
          const timestamp = toDate(chat.lastMessageTime) || toDate(chat.createdAt);
          if (!timestamp) return;
          hourCounts[timestamp.getHours()] += 1;
        });

        const windows = [
          { label: "12am - 3am", hours: [0, 1, 2] },
          { label: "3am - 6am", hours: [3, 4, 5] },
          { label: "6am - 9am", hours: [6, 7, 8] },
          { label: "9am - 12pm", hours: [9, 10, 11] },
          { label: "12pm - 3pm", hours: [12, 13, 14] },
          { label: "3pm - 6pm", hours: [15, 16, 17] },
          { label: "6pm - 9pm", hours: [18, 19, 20] },
          { label: "9pm - 12am", hours: [21, 22, 23] },
        ];

        const mostActive = windows.reduce(
          (acc, window) => {
            const total = window.hours.reduce((sum, hour) => sum + hourCounts[hour], 0);
            if (total > acc.total) return { label: window.label, total };
            return acc;
          },
          { label: "-", total: 0 }
        );

        const heatmapRows = [
          { label: "Morning", hours: [6, 7, 8, 9] },
          { label: "Afternoon", hours: [11, 12, 13, 14, 15] },
          { label: "Evening", hours: [16, 17, 18, 19] },
          { label: "Night", hours: [20, 21, 22, 23] },
          { label: "Late", hours: [0, 1, 2, 3, 4, 5] },
        ];

        const rowTotals = heatmapRows.map((row) =>
          row.hours.reduce((sum, hour) => sum + hourCounts[hour], 0)
        );
        const maxRowTotal = Math.max(...rowTotals, 1);
        const segmentWeights = [0.24, 0.18, 0.16, 0.14, 0.16, 0.12];
        const heatmapRowsWithValues = heatmapRows.map((row, index) => {
          const intensity = rowTotals[index] / maxRowTotal;
          const values = segmentWeights.map((weight) => {
            const scaled = intensity * (0.55 + weight * 2);
            return Math.max(0.1, Math.min(1, scaled));
          });
          return { label: row.label, values };
        });

        if (isMounted) {
          setChatStats({
            totalChats,
            chatsPerListing,
            listingsWithZeroChatsRate,
            averageFirstMessageMinutes,
            mostActiveWindow: mostActive.label,
            dailySeries,
            heatmapRows: heatmapRowsWithValues,
          });
        }
      } catch (error) {
        console.warn("Failed to load chat metrics", error);
        if (isMounted) setChatStats(null);
      } finally {
        if (isMounted) setLoadingChats(false);
      }
    };

    loadChats();
    return () => {
      isMounted = false;
    };
  }, [adminAccess, metrics]);

  useEffect(() => {
    if (!authReady) return;
    if (!user) {
      router.replace("/signin");
      return;
    }
    if (!adminAccess) {
      router.replace("/");
    }
  }, [authReady, user, adminAccess, router]);

  if (!authReady || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!adminAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <Card className="max-w-lg w-full p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-2xl font-semibold">Admin access only</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Configure NEXT_PUBLIC_ADMIN_EMAILS with comma-separated admin emails to unlock this dashboard.
          </p>
        </Card>
      </div>
    );
  }

  if (loadingMetrics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (metricsError || !metrics) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <Card className="max-w-lg w-full p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-2xl font-semibold">Unable to load metrics</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {metricsError || "The admin metrics endpoint did not return data."}
          </p>
        </Card>
      </div>
    );
  }

  const userChange = toSeriesChange(metrics.users.growthSeries);
  const listingsChange = toSeriesChange(metrics.listings.listingsSeries);
  const soldChange = toSeriesChange(metrics.listings.soldSeries);
  const conversionChange = soldChange;
  const lastUpdated = new Date(metrics.generatedAt).toLocaleString();

  const pulseStats = [
    {
      title: "Total Registered Users",
      value: formatNumber(metrics.users.total),
      change: formatPercent(userChange, true),
      trend: userChange >= 0 ? "up" : "down",
      icon: Users,
      hint: "All time",
    },
    {
      title: "Active Users (7 days)",
      value: formatNumber(metrics.users.active7d),
      change: formatPercent(userChange, true),
      trend: userChange >= 0 ? "up" : "down",
      icon: Activity,
      hint: "Weekly activity",
    },
    {
      title: "New Users Today",
      value: formatNumber(metrics.users.newToday),
      change: formatPercent(userChange, true),
      trend: userChange >= 0 ? "up" : "down",
      icon: UserPlus,
      hint: "Since yesterday",
    },
    {
      title: "Total Listings",
      value: formatNumber(metrics.listings.total),
      change: formatPercent(listingsChange, true),
      trend: listingsChange >= 0 ? "up" : "down",
      icon: ShoppingBag,
      hint: "All time",
    },
    {
      title: "Listings Added Today",
      value: formatNumber(metrics.listings.addedToday),
      change: formatPercent(listingsChange, true),
      trend: listingsChange >= 0 ? "up" : "down",
      icon: PackageCheck,
      hint: "Past 24 hours",
    },
    {
      title: "Items Sold",
      value: formatNumber(metrics.listings.soldTotal),
      change: formatPercent(soldChange, true),
      trend: soldChange >= 0 ? "up" : "down",
      icon: ShieldCheck,
      hint: "Monthly",
    },
    {
      title: "Conversion Rate (Listings -> Sold)",
      value: formatPercent(metrics.listings.conversionRate),
      change: formatPercent(conversionChange, true),
      trend: conversionChange >= 0 ? "up" : "down",
      icon: Percent,
      hint: "Monthly",
    },
  ];

  const chatLoadingLabel = loadingChats ? "Loading..." : "-";
  const engagementMetrics = [
    {
      title: "Average chats per listing",
      value: chatStats ? chatStats.chatsPerListing.toFixed(1) : chatLoadingLabel,
      icon: MessageCircle,
    },
    {
      title: "Listings with zero chats",
      value: chatStats ? formatPercent(chatStats.listingsWithZeroChatsRate) : chatLoadingLabel,
      icon: TrendingDown,
    },
    {
      title: "Time to first buyer message",
      value: loadingChats ? "Loading..." : formatMinutes(chatStats?.averageFirstMessageMinutes ?? null),
      icon: Clock,
    },
    {
      title: "Most active hours",
      value: loadingChats ? "Loading..." : chatStats?.mostActiveWindow || "-",
      icon: Zap,
    },
  ];

  const sellerRows = metrics.sellers.powerSellers.map((seller) => ({
    name: seller.name,
    role: seller.listings >= 4 ? "Power seller" : "Repeat seller",
    listings: seller.listings,
    category: seller.topCategory,
    sales: formatPercent(seller.sellThrough),
    avatar: "",
  }));

  const trustSignals = [
    { label: "Reported listings", value: formatNumber(metrics.trust.reportedListings), tone: "amber" },
    { label: "Blocked users", value: formatNumber(metrics.trust.blockedUsers), tone: "rose" },
    { label: "Suspicious activity alerts", value: formatNumber(metrics.trust.suspiciousAlerts), tone: "amber" },
  ];

  const revenueSignals = [
    {
      label: "Potential featured listing demand",
      value: `${formatNumber(metrics.revenue.featuredDemand)} listings`,
    },
    {
      label: "Service providers count",
      value: formatNumber(metrics.revenue.serviceProviders),
    },
    {
      label: "High-intent sellers",
      value: formatNumber(metrics.revenue.highIntentSellers),
    },
  ];

  const heatmapRows = chatStats?.heatmapRows || [
    { label: "Morning", values: [0.12, 0.18, 0.16, 0.14, 0.16, 0.12] },
    { label: "Afternoon", values: [0.2, 0.24, 0.22, 0.18, 0.22, 0.18] },
    { label: "Evening", values: [0.34, 0.3, 0.28, 0.26, 0.3, 0.26] },
    { label: "Night", values: [0.26, 0.22, 0.2, 0.18, 0.22, 0.2] },
    { label: "Late", values: [0.14, 0.12, 0.12, 0.1, 0.12, 0.1] },
  ];

  const heatmapColumns = ["Hostels", "Departments", "Library", "Cafes", "Sports", "Admin"];

  const listingsSeries = metrics.listings.listingsSeries.map((point) => point.count);
  const soldSeries = metrics.listings.soldSeries.map((point) => point.count);
  const userGrowthSeries = metrics.users.growthSeries.map((point) => point.count);
  const chatSeries = chatStats?.dailySeries?.map((point) => point.count) || [];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="px-4 md:px-8 pb-16">
        <section className="max-w-7xl mx-auto pt-10">
          <motion.div
            variants={containerMotion}
            initial="hidden"
            animate="show"
            className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-slate-50 p-8 md:p-12 shadow-sm"
          >
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <Badge className="bg-emerald-100 text-emerald-700">Founder Admin</Badge>
                <h1 className="mt-4 text-3xl md:text-4xl font-semibold text-slate-900">
                  SleekRoad Control Center
                </h1>
                <p className="mt-2 max-w-2xl text-sm md:text-base text-slate-600">
                  Platform health in one glance. Track liquidity, engagement, trust, and revenue readiness with clarity.
                </p>
              </div>
              <div className="flex flex-col items-start gap-3 md:items-end">
                <div className="text-sm text-slate-500">Last updated</div>
                <div className="text-lg font-semibold text-slate-900">{lastUpdated}</div>
                <Button variant="black">Export overview</Button>
              </div>
            </div>
          </motion.div>
        </section>

        <section className="max-w-7xl mx-auto mt-10">
          <motion.div variants={staggerMotion} initial="hidden" animate="show" className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {pulseStats.map((stat) => {
              const TrendIcon = stat.trend === "up" ? TrendingUp : TrendingDown;
              return (
                <motion.div key={stat.title} variants={containerMotion}>
                  <Card className="p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-xs uppercase tracking-wide text-slate-400">{stat.hint}</div>
                        <h3 className="mt-2 text-sm text-slate-600">{stat.title}</h3>
                        <div className="mt-3 text-2xl md:text-3xl font-semibold text-slate-900">
                          {stat.value}
                        </div>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
                        <stat.icon className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                      <motion.span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${trendVariants[stat.trend as "up" | "down"]}`}
                        animate={{ y: [0, -2, 0] }}
                        transition={{ duration: 1.6, repeat: Infinity }}
                      >
                        <TrendIcon className="h-3 w-3" />
                        {stat.change}
                      </motion.span>
                      <span className="text-xs text-slate-400">vs last period</span>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </section>

        <section className="max-w-7xl mx-auto mt-12 grid gap-6 lg:grid-cols-[2fr_1fr]">
          <Card className="p-6 md:p-8 border border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Marketplace Health</h2>
                <p className="text-sm text-slate-500">Liquidity trends that define velocity.</p>
              </div>
              <Badge className="bg-slate-100 text-slate-600">Last 30 days</Badge>
            </div>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-100 p-5">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-slate-700">Listings vs Sold</div>
                  <BarChart3 className="h-4 w-4 text-slate-400" />
                </div>
                <LineChart
                  data={listingsSeries.length ? listingsSeries : Array(7).fill(0)}
                  comparison={soldSeries.length ? soldSeries : Array(7).fill(0)}
                />
                <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-600" /> Listings
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-600" /> Sold
                  </span>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-100 p-5">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-slate-700">User growth</div>
                  <TrendingUp className="h-4 w-4 text-slate-400" />
                </div>
                <LineChart data={userGrowthSeries.length ? userGrowthSeries : Array(7).fill(0)} />
                <div className="mt-3 text-xs text-slate-500">Net new users per week</div>
              </div>
            </div>
          </Card>

          <Card className="p-6 md:p-8 border border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Daily chat initiation</h2>
                <p className="text-sm text-slate-500">Signal for buyer intent.</p>
              </div>
              <MessageCircle className="h-5 w-5 text-slate-400" />
            </div>
            <div className="mt-6 rounded-2xl border border-slate-100 p-5">
              <LineChart data={chatSeries.length ? chatSeries : Array(7).fill(0)} />
              <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                <span>Avg chats per day</span>
                <span className="font-medium text-emerald-600">
                  {chatStats ? formatNumber(chatStats.totalChats) : "-"}
                </span>
              </div>
            </div>
          </Card>
        </section>

        <section className="max-w-7xl mx-auto mt-12">
          <div className="grid gap-6 md:grid-cols-4">
            {engagementMetrics.map((metric) => (
              <Card key={metric.title} className="p-6 border border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-500">Engagement</div>
                  <metric.icon className="h-4 w-4 text-slate-400" />
                </div>
                <div className="mt-3 text-xl font-semibold text-slate-900">{metric.value}</div>
                <div className="mt-1 text-sm text-slate-600">{metric.title}</div>
              </Card>
            ))}
          </div>
        </section>

        <section className="max-w-7xl mx-auto mt-12 grid gap-6 lg:grid-cols-[2fr_1fr]">
          <Card className="p-6 md:p-8 border border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Seller Intelligence Panel</h2>
                <p className="text-sm text-slate-500">Who is driving supply and repeat velocity.</p>
              </div>
              <Badge className="bg-emerald-100 text-emerald-700">Top sellers</Badge>
            </div>
            <div className="mt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Seller</TableHead>
                    <TableHead>Signal</TableHead>
                    <TableHead>Listings</TableHead>
                    <TableHead>Top category</TableHead>
                    <TableHead>Sell-through</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sellerRows.length > 0 ? (
                    sellerRows.map((row) => (
                    <TableRow key={row.name}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={row.avatar} alt={row.name} />
                            <AvatarFallback>{row.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-sm font-medium text-slate-900">{row.name}</div>
                            <div className="text-xs text-slate-500">Active this week</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-slate-100 text-slate-600">{row.role}</Badge>
                      </TableCell>
                      <TableCell>{row.listings}</TableCell>
                      <TableCell>{row.category}</TableCell>
                      <TableCell className="text-emerald-600 font-medium">{row.sales}</TableCell>
                    </TableRow>
                  ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-sm text-slate-500">
                        No seller activity yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-2">
              {metrics.sellers.topCategories.map((category) => (
                <Badge key={category.category} className="bg-emerald-50 text-emerald-700">
                  {category.category} · {formatNumber(category.count)}
                </Badge>
              ))}
            </div>
            <div className="mt-6 border-t border-slate-100 pt-4">
              <div className="text-xs uppercase tracking-wide text-slate-400">Recently sold</div>
              <div className="mt-3 space-y-2">
                {metrics.sellers.recentSold.length > 0 ? (
                  metrics.sellers.recentSold.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-sm">
                      <div className="text-slate-700">{item.name}</div>
                      <div className="text-xs text-slate-500">{item.userName}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-slate-500">No sales yet.</div>
                )}
              </div>
            </div>
          </Card>

          <div className="grid gap-6">
            <Card className="p-6 border border-slate-100">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Trust and Safety</h2>
                <AlertTriangle className="h-4 w-4 text-slate-400" />
              </div>
              <div className="mt-4 space-y-4">
                {trustSignals.map((signal) => (
                  <div
                    key={signal.label}
                    className={`flex items-center justify-between rounded-xl border px-4 py-3 ${
                      signal.tone === "rose"
                        ? "border-rose-100 bg-rose-50"
                        : "border-amber-100 bg-amber-50"
                    }`}
                  >
                    <div className="text-sm text-slate-700">{signal.label}</div>
                    <div className="text-lg font-semibold text-slate-900">{signal.value}</div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 border border-slate-100">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Revenue Readiness</h2>
                <Zap className="h-4 w-4 text-slate-400" />
              </div>
              <div className="mt-4 space-y-4">
                {revenueSignals.map((signal) => (
                  <div key={signal.label} className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3">
                    <div className="text-sm text-slate-600">{signal.label}</div>
                    <div className="text-base font-semibold text-slate-900">{signal.value}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </section>

        <section className="max-w-7xl mx-auto mt-12">
          <Card className="p-6 md:p-8 border border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Activity Heatmap</h2>
                <p className="text-sm text-slate-500">Where campus demand concentrates by time of day.</p>
              </div>
              <Badge className="bg-emerald-100 text-emerald-700">Live pulse</Badge>
            </div>
            <div className="mt-6 overflow-x-auto">
              <div className="min-w-[480px]">
                <div className="grid grid-cols-[100px_repeat(6,1fr)] gap-3 text-xs text-slate-500">
                  <div />
                  {heatmapColumns.map((label) => (
                    <div key={label} className="text-center">
                      {label}
                    </div>
                  ))}
                </div>
                <div className="mt-4 space-y-3">
                  {heatmapRows.map((row) => (
                    <div key={row.label} className="grid grid-cols-[100px_repeat(6,1fr)] items-center gap-3">
                      <div className="text-xs text-slate-500">{row.label}</div>
                      {row.values.map((value, index) => (
                        <HeatmapCell key={`${row.label}-${index}`} value={value} />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-5 flex items-center gap-3 text-xs text-slate-500">
              <span>Low</span>
              <div className="flex items-center gap-1">
                {[0.2, 0.4, 0.6, 0.8, 1].map((value) => (
                  <HeatmapCell key={value} value={value} />
                ))}
              </div>
              <span>High</span>
            </div>
          </Card>
        </section>
      </main>
      <Footer />
    </div>
  );
}
