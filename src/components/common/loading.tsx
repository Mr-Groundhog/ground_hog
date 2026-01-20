"use client";

import React from "react";
import { motion } from "framer-motion";

export const TechSpinner = () => {
  return (
    <div className="relative flex items-center justify-center w-24 h-24">
      {/* Outer Ring - Pulsing and Rotating */}
      <motion.div
        className="absolute w-full h-full border-4 border-transparent border-t-cyan-500/50 border-b-cyan-500/50 rounded-full"
        animate={{
          rotate: 360,
          scale: [1, 1.1, 1],
        }}
        transition={{
          rotate: { duration: 3, repeat: Infinity, ease: "linear" },
          scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
        }}
      />

      {/* Middle Ring - Faster Reverse Rotation */}
      <motion.div
        className="absolute w-16 h-16 border-4 border-transparent border-l-purple-500/50 border-r-purple-500/50 rounded-full"
        animate={{
          rotate: -360,
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Inner Ring - Fastest Rotation */}
      <motion.div
        className="absolute w-8 h-8 border-2 border-transparent border-t-blue-400 rounded-full"
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Center Dot - Glowing */}
      <motion.div
        className="w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_15px_rgba(34,211,238,0.8)]"
        animate={{
          opacity: [0.4, 1, 0.4],
          scale: [0.8, 1.2, 0.8],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Orbiting Particles */}
      {[0, 120, 240].map((angle, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-cyan-300 rounded-full"
          animate={{
            rotate: angle + 360,
          }}
          style={{
            originX: "center",
            originY: "center",
            width: "48px", // Distance from center
            height: "1px",
            background: "none",
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <div className="w-1 h-1 bg-cyan-300 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.8)] ml-auto" />
        </motion.div>
      ))}

      {/* Scanning Line Effect */}
      <motion.div
        className="absolute w-32 h-0.5 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent"
        animate={{
          top: ["0%", "100%", "0%"],
          opacity: [0, 1, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Text */}
      <div className="absolute -bottom-8 text-cyan-500/80 text-[10px] tracking-[0.2em] font-mono animate-pulse">
        INITIALIZING...
      </div>
    </div>
  );
};

export const TechLoaderMini = () => (
  <div className="relative flex h-6 w-6 items-center justify-center">
    <div className="absolute h-full w-full animate-spin rounded-full border-2 border-transparent border-t-cyan-500 border-b-cyan-500" />
    <div 
      className="absolute h-4 w-4 animate-spin rounded-full border-2 border-transparent border-l-purple-500 border-r-purple-500" 
      style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}
    />
    <div className="absolute h-1 w-1 rounded-full bg-cyan-400 shadow-[0_0_5px_rgba(34,211,238,0.8)]" />
  </div>
);

import { useLoadingStore } from "@/store/loading-store";

export const LoadingOverlay = () => {
  const isLoading = useLoadingStore((state) => state.isLoading);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all duration-300">
      <TechSpinner />
    </div>
  );
};
