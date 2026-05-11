"use client";

import { useIsFetching, useIsMutating } from "@tanstack/react-query";
import { useLoadingStore } from "@/store/loading-store";
import { useEffect, useState } from "react";

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();
  const { isLoading: manualLoading } = useLoadingStore();
  const isLoading = isFetching > 0 || isMutating > 0 || manualLoading;
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setVisible(true);
      setProgress(30);
      const t1 = setTimeout(() => setProgress(60), 200);
      const t2 = setTimeout(() => setProgress(80), 500);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    } else {
      setProgress(100);
      const timer = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  return (
    <>
      {visible && (
        <div className="fixed top-0 left-0 right-0 z-[200] h-0.5">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 shadow-[0_0_8px_rgba(34,211,238,0.6)] transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      {children}
    </>
  );
}
