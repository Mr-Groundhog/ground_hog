"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import Cookies from "js-cookie";

export function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialized = useRef(false);

  useEffect(() => {
    // Only track in production or if explicitly enabled
    // You can change this condition based on your needs
    if (process.env.NODE_ENV === "development") {
      console.log("[Analytics] Dev mode: Skipping tracking");
      return;
    }

    const trackPageView = async () => {
      try {
        // 1. Get or create UV ID
        let uv = Cookies.get("site_uv");
        if (!uv) {
          uv = uuidv4();
          Cookies.set("site_uv", uv, { expires: 365 });
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
