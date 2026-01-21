"use server";

import { prisma } from "@/lib/db";
import { startOfDay, startOfMonth, startOfYear, subDays, subMonths, subYears } from "date-fns";

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

export async function getAnalyticsSummary() {
  const now = new Date();
  const todayStart = startOfDay(now);
  const yesterdayStart = startOfDay(subDays(now, 1));
  const yesterdayEnd = todayStart;

  // 1. Total Stats
  const totalPV = await prisma.siteVisit.count();
  // For total UV, we need distinct count. Prisma count distinct is supported.
  const totalUVGroup = await prisma.siteVisit.groupBy({
    by: ['uv'],
    _count: { uv: true } // just to make typescript happy, we count groups length
  });
  const totalUV = totalUVGroup.length;

  // 2. Today Stats
  const todayPV = await prisma.siteVisit.count({
    where: {
      createdAt: { gte: todayStart }
    }
  });
  const todayUVGroup = await prisma.siteVisit.groupBy({
    by: ['uv'],
    where: {
      createdAt: { gte: todayStart }
    }
  });
  const todayUV = todayUVGroup.length;

  // 3. Yesterday Stats (for comparison)
  const yesterdayPV = await prisma.siteVisit.count({
    where: {
      createdAt: { gte: yesterdayStart, lt: yesterdayEnd }
    }
  });
  const yesterdayUVGroup = await prisma.siteVisit.groupBy({
    by: ['uv'],
    where: {
      createdAt: { gte: yesterdayStart, lt: yesterdayEnd }
    }
  });
  const yesterdayUV = yesterdayUVGroup.length;

  return {
    totalPV,
    totalUV,
    todayPV,
    todayUV,
    yesterdayPV,
    yesterdayUV,
  };
}

export async function getTrafficTrend(type: 'day' | 'month' | 'year' = 'day'): Promise<TrendData[]> {
  // Use raw query for efficient date truncation and grouping
  let sql;
  const now = new Date();

  if (type === 'day') {
    // Last 30 days
    const startDate = subDays(now, 30);
    // Postgres syntax
    sql = `
      SELECT 
        TO_CHAR(created_at, 'MM-DD') as name,
        COUNT(*) as pv,
        COUNT(DISTINCT uv) as uv
      FROM site_visits
      WHERE created_at >= '${startDate.toISOString()}'
      GROUP BY TO_CHAR(created_at, 'MM-DD')
      ORDER BY name ASC
    `;
  } else if (type === 'month') {
    // Last 12 months
    const startDate = subMonths(now, 12);
    sql = `
      SELECT 
        TO_CHAR(created_at, 'YYYY-MM') as name,
        COUNT(*) as pv,
        COUNT(DISTINCT uv) as uv
      FROM site_visits
      WHERE created_at >= '${startDate.toISOString()}'
      GROUP BY TO_CHAR(created_at, 'YYYY-MM')
      ORDER BY name ASC
    `;
  } else {
    // Last 5 years
    const startDate = subYears(now, 5);
    sql = `
      SELECT 
        TO_CHAR(created_at, 'YYYY') as name,
        COUNT(*) as pv,
        COUNT(DISTINCT uv) as uv
      FROM site_visits
      WHERE created_at >= '${startDate.toISOString()}'
      GROUP BY TO_CHAR(created_at, 'YYYY')
      ORDER BY name ASC
    `;
  }

  try {
    const result = await prisma.$queryRawUnsafe<any[]>(sql);
    // Convert BigInt to Number if necessary (Prisma returns BigInt for count)
    return result.map(row => ({
      name: row.name,
      pv: Number(row.pv),
      uv: Number(row.uv),
    }));
  } catch (error) {
    console.error("Error fetching traffic trend:", error);
    return [];
  }
}

export async function getTopPages(limit: number = 10): Promise<PageViewData[]> {
  const result = await prisma.siteVisit.groupBy({
    by: ['pageUrl'],
    _count: {
      _all: true, // PV
      uv: true // This is not distinct UV count in groupBy!
      // Prisma groupBy doesn't support distinct count on other fields directly effectively for this shape
    },
    orderBy: {
      _count: {
        pageUrl: 'desc'
      }
    },
    take: limit,
  });

  // To get accurate UV per page, we might need a different approach or raw query.
  // Raw query is safer for complex aggregation.
  const sql = `
    SELECT 
      page_url as url,
      COUNT(*) as pv,
      COUNT(DISTINCT uv) as uv
    FROM site_visits
    GROUP BY page_url
    ORDER BY pv DESC
    LIMIT ${limit}
  `;

  try {
    const rawResult = await prisma.$queryRawUnsafe<any[]>(sql);
    return rawResult.map(row => ({
      url: row.url,
      pv: Number(row.pv),
      uv: Number(row.uv),
    }));
  } catch (error) {
    console.error("Error fetching top pages:", error);
    return [];
  }
}
