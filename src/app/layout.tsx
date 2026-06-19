
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/providers/query-provider";
import { LoadingProvider } from "@/components/providers/loading-provider";
import { Toaster } from "@/components/ui/sonner";
import { AnalyticsTracker } from "@/components/analytics-tracker";
import { Suspense } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "一梦五千年",
  description: "一梦五千年-一个记录心情的地方",
};

export default function RootLayout({
  children,
  authModal,
}: Readonly<{
  children: React.ReactNode;
  authModal?: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen bg-[#020817] text-zinc-50`}
      >
        <QueryProvider>
          <LoadingProvider>
            {children}
            {authModal}
            <Suspense fallback={null}>
              <AnalyticsTracker />
            </Suspense>
          </LoadingProvider>
        </QueryProvider>
        <Toaster position="top-center" duration={1000} />
      </body>
    </html>
  );
}
