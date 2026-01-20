"use client";

import { useIsFetching, useIsMutating } from "@tanstack/react-query";
import { useLoadingStore } from "@/store/loading-store";
import { LoadingOverlay } from "@/components/common/loading";
import { useEffect } from "react";

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();
  const { isLoading: manualLoading } = useLoadingStore();

  const isLoading = isFetching > 0 || isMutating > 0 || manualLoading;

  // Prevent scrolling when loading
  useEffect(() => {
    if (isLoading) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isLoading]);

  return (
    <>
      {isLoading && <LoadingOverlay />}
      {children}
    </>
  );
}
