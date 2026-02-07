"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";

type ToastType = "success" | "error" | "warning" | "info";

/**
 * 自定义Toast Hook
 * 封装sonner的toast功能，提供统一的调用接口
 */
export function useToast() {
  const showToast = useCallback((message: string, type: ToastType = "info") => {
    switch (type) {
      case "success":
        toast.success(message);
        break;
      case "error":
        toast.error(message);
        break;
      case "warning":
        toast.warning(message);
        break;
      case "info":
      default:
        toast(message);
        break;
    }
  }, []);

  return { showToast };
}