"use server";

import { Prisma } from "@prisma/client";
import { startOfDay, subDays, subMonths, subYears } from "date-fns";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";

export type TrendType = "day" | "month" | "year";

export type AnalyticsSummary = {
  totalPV: number;
  totalUV: number;
  todayPV: number;
  todayUV: number;
  yesterdayPV: number;
  yesterdayUV: number;
};

export type TrendData = {
  name: string;
  pv: number;
  uv: number;
};

export type PageViewData = {
  url: string;
  pv: number;
  uv: number;
};

const OVERVIEW_TAG = "dashboard-overview";
const EMPTY_SUMMARY: AnalyticsSummary = {
  totalPV: 0,
  totalUV: 0,
  todayPV: 0,
  todayUV: 0,
  yesterdayPV: 0,
  yesterdayUV: 0,
};

function getTrendExpression(type: TrendType) {
  switch (type) {
    case "month":
      return Prisma.raw("TO_CHAR(created_at, 'YYYY-MM')");
    case "year":
      return Prisma.raw("TO_CHAR(created_at, 'YYYY')");
    case "day":
    default:
      return Prisma.raw("TO_CHAR(created_at, 'MM-DD')");
  }
}

function getTrendStartDate(type: TrendType) {
  const now = new Date();

  switch (type) {
    case "month":
      return subMonths(now, 12);
    case "year":
      return subYears(now, 5);
    case "day":
    default:
      return subDays(now, 30);
  }
}

const getCachedAnalyticsSummary = unstable_cache(
  async (): Promise<AnalyticsSummary> => {
    const now = new Date();
    const todayStart = startOfDay(now);
    const yesterdayStart = startOfDay(subDays(now, 1));

    const rows = await prisma.$queryRaw<AnalyticsSummary[]>(Prisma.sql`
      SELECT
        COUNT(*)::int AS "totalPV",
        COUNT(DISTINCT uv)::int AS "totalUV",
        COUNT(*) FILTER (WHERE created_at >= ${todayStart})::int AS "todayPV",
        COUNT(DISTINCT uv) FILTER (WHERE created_at >= ${todayStart})::int AS "todayUV",
        COUNT(*) FILTER (
          WHERE created_at >= ${yesterdayStart} AND created_at < ${todayStart}
        )::int AS "yesterdayPV",
        COUNT(DISTINCT uv) FILTER (
          WHERE created_at >= ${yesterdayStart} AND created_at < ${todayStart}
        )::int AS "yesterdayUV"
      FROM site_visits
    `);

    return rows[0] ?? EMPTY_SUMMARY;
  },
  ["dashboard-overview-summary"],
  {
    revalidate: 60,
    tags: [OVERVIEW_TAG],
  }
);

const getCachedTrafficTrend = unstable_cache(
  async (type: TrendType): Promise<TrendData[]> => {
    const startDate = getTrendStartDate(type);
    const trendExpression = getTrendExpression(type);

    const rows = await prisma.$queryRaw<TrendData[]>(Prisma.sql`
      SELECT
        ${trendExpression} AS name,
        COUNT(*)::int AS pv,
        COUNT(DISTINCT uv)::int AS uv
      FROM site_visits
      WHERE created_at >= ${startDate}
      GROUP BY 1
      ORDER BY MIN(created_at) ASC
    `);

    return rows.map((row) => ({
      name: row.name,
      pv: Number(row.pv),
      uv: Number(row.uv),
    }));
  },
  ["dashboard-overview-trend"],
  {
    revalidate: 300,
    tags: [OVERVIEW_TAG],
  }
);

const getCachedTopPages = unstable_cache(
  async (limit: number): Promise<PageViewData[]> => {
    const rows = await prisma.$queryRaw<PageViewData[]>(Prisma.sql`
      SELECT
        page_url AS url,
        COUNT(*)::int AS pv,
        COUNT(DISTINCT uv)::int AS uv
      FROM site_visits
      GROUP BY page_url
      ORDER BY pv DESC
      LIMIT ${limit}
    `);

    return rows.map((row) => ({
      url: row.url,
      pv: Number(row.pv),
      uv: Number(row.uv),
    }));
  },
  ["dashboard-overview-top-pages"],
  {
    revalidate: 300,
    tags: [OVERVIEW_TAG],
  }
);

export async function getAnalyticsSummary() {
  return getCachedAnalyticsSummary();
}

export async function getTrafficTrend(type: TrendType = "day") {
  return getCachedTrafficTrend(type);
}

export async function getTopPages(limit = 10) {
  return getCachedTopPages(limit);
}

export async function getDashboardOverviewData(initialTrendType: TrendType = "day") {
  const [summary, trendData, topPages] = await Promise.all([
    getAnalyticsSummary(),
    getTrafficTrend(initialTrendType),
    getTopPages(),
  ]);

  return {
    summary,
    trendData,
    topPages,
  };
}
