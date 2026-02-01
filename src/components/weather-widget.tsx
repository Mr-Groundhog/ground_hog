"use client";

import * as React from "react";
import { Cloud, CloudRain, CloudSun, CloudLightning, Sun, Snowflake, Wind, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// API Response Type
interface WeatherData {
  adcode: string;
  city: string;
  temperature: string | number; // Updated to accept number based on your screenshot
  weather: string;
  wind_direction: string;
  wind_power: string;
  humidity: string | number; // Updated
  report_time: string;
  province?: string; // Added province
  weather_code?: number; // Added weather_code
}



export function WeatherWidget({ className }: { className?: string }) {
  const [data, setData] = React.useState<WeatherData | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchWeather = async () => {
      try {
        // Yiwu adcode: 330782
        const res = await fetch("https://uapis.cn/api/v1/misc/weather?adcode=330782");
        
        const json = await res.json() as WeatherData;
          setData(json);
        
      } catch (error) {
        console.error("Failed to fetch weather:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
    // Refresh every 30 minutes
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getWeatherIcon = (weather: string) => {
    if (!weather) return Sun;
    if (weather.includes("雨")) return CloudRain;
    if (weather.includes("云") || weather.includes("阴")) return CloudSun;
    if (weather.includes("雪")) return Snowflake;
    if (weather.includes("雷")) return CloudLightning;
    if (weather.includes("风")) return Wind;
    return Sun;
  };

  if (loading) {
    return (
      <div className={cn("flex items-center gap-2 px-3 py-1.5 text-xs text-zinc-400 bg-zinc-800/30 rounded-full", className)}>
        <Loader2 className="h-3 w-3 animate-spin" />
        <span>获取天气...</span>
      </div>
    );
  }

  if (!data) return null;

  const Icon = getWeatherIcon(data.weather);

  return (
    <div className={cn("flex items-center gap-3 px-3 py-1.5 text-xs font-medium text-white bg-zinc-800/30 rounded-full hover:bg-zinc-800/50 hover:text-cyan-400 transition-colors cursor-default group", className)} title={`${data.city}: ${data.weather} ${data.wind_direction}风${data.wind_power}级`}>
      <div className="flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 text-yellow-500 group-hover:text-cyan-400 transition-colors" />
        <span>{data.city}</span>
      </div>
      <div className="w-[1px] h-3 bg-zinc-700" />
      <div className="flex items-center gap-1">
        <span>{data.temperature}°C</span>
        <span className="text-white/80 group-hover:text-cyan-400">{data.weather}</span>
      </div>
    </div>
  );
}
