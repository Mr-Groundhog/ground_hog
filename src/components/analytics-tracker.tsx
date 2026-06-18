"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

function getCookie(name: string): string | undefined {
  return document.cookie.split('; ').find(row => row.startsWith(`${name}=`))?.split('=')[1];
}

function setCookie(name: string, value: string, days: number) {
  const d = new Date();
  d.setTime(d.getTime() + days * 864e5);
  document.cookie = `${name}=${value};expires=${d.toUTCString()};path=/`;
}

export function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialized = useRef(false);

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("[Analytics] Dev mode: Skipping tracking");
      return;
    }

    const trackPageView = async () => {
      try {
        let uv = getCookie("site_uv");
        if (!uv) {
          uv = uuidv4();
          setCookie("site_uv", uv, 365);
        }

        // 2. Detect Device
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );
        const device = isMobile ? "mobile" : "pc";

        // 3. Prepare data
        // Construct full URL including search params
        const fullUrl = `${pathname}${
          searchParams.toString() ? `?${searchParams.toString()}` : ""
        }`;

        const data = {
          uv,
          pageUrl: fullUrl,
          device,
          referrer: document.referrer || "",
        };

        // 4. Send to API
        // Use sendBeacon if available for better reliability on page unload, 
        // but fetch is fine for SPA transitions
        await fetch("/api/analytics/track", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
          // keepalive ensures request completes even if page unloads
          keepalive: true, 
        });
      } catch (error) {
        console.error("[Analytics] Tracking failed:", error);
      }
    };

    // Track on mount and when path changes
    trackPageView();

  }, [pathname, searchParams]);

  return null;
}
