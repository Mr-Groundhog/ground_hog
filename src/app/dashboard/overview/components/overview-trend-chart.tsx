"use client";

import { useState, useTransition } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTrafficTrend, type TrendData, type TrendType } from "../actions";

type OverviewTrendChartProps = {
  initialTrendType: TrendType;
  initialTrendData: TrendData[];
};

export function OverviewTrendChart({
  initialTrendType,
  initialTrendData,
}: OverviewTrendChartProps) {
  const [isPending, startTransition] = useTransition();
  const [trendType, setTrendType] = useState<TrendType>(initialTrendType);
  const [pendingType, setPendingType] = useState<TrendType | null>(null);
  const [dataMap, setDataMap] = useState<Record<TrendType, TrendData[] | undefined>>({
    day: initialTrendType === "day" ? initialTrendData : undefined,
    month: initialTrendType === "month" ? initialTrendData : undefined,
    year: initialTrendType === "year" ? initialTrendData : undefined,
  });

  const activeType = pendingType ?? trendType;
  const trendData =
    (pendingType ? dataMap[pendingType] : undefined) ??
    dataMap[trendType] ??
    initialTrendData;

  function handleTrendChange(nextType: TrendType) {
    if (nextType === trendType || nextType === pendingType) {
      return;
    }

    if (dataMap[nextType]) {
      setTrendType(nextType);
      setPendingType(null);
      return;
    }

    setPendingType(nextType);
    startTransition(async () => {
      const nextData = await getTrafficTrend(nextType);
      setDataMap((current) => ({
        ...current,
        [nextType]: nextData,
      }));
      setTrendType(nextType);
      setPendingType(null);
    });
  }

  return (
    <Card className="col-span-4">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="text-base font-medium">Traffic Trend</CardTitle>
          <p className="text-xs text-muted-foreground">Traffic overview</p>
        </div>
        <div className="flex items-center gap-2">
          <TrendButton
            active={activeType === "day"}
            disabled={isPending}
            label="Day"
            onClick={() => handleTrendChange("day")}
          />
          <TrendButton
            active={activeType === "month"}
            disabled={isPending}
            label="Month"
            onClick={() => handleTrendChange("month")}
          />
          <TrendButton
            active={activeType === "year"}
            disabled={isPending}
            label="Year"
            onClick={() => handleTrendChange("year")}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="overview-uv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="overview-pv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" vertical={false} />
              <XAxis
                axisLine={false}
                dataKey="name"
                dy={10}
                tick={{ fontSize: 12, fill: "#6b7280" }}
                tickLine={false}
              />
              <YAxis
                axisLine={false}
                tick={{ fontSize: 12, fill: "#6b7280" }}
                tickLine={false}
              />
              <Tooltip />
              <Area
                dataKey="uv"
                fill="url(#overview-uv)"
                fillOpacity={1}
                name="UV"
                stroke="#3b82f6"
                strokeWidth={3}
                type="monotone"
              />
              <Area
                dataKey="pv"
                fill="url(#overview-pv)"
                fillOpacity={1}
                name="PV"
                stroke="#10b981"
                strokeWidth={3}
                type="monotone"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function TrendButton({
  active,
  disabled,
  label,
  onClick,
}: {
  active: boolean;
  disabled: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <Button
      className="h-7 text-xs"
      disabled={disabled}
      onClick={onClick}
      size="sm"
      variant={active ? "default" : "outline"}
    >
      {label}
    </Button>
  );
}
