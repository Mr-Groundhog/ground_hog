"use client";

import { useMemo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLotteryStore } from "./lottery-store";

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  duration: number;
}

function StarBackground() {
  const [stars, setStars] = useState<Star[]>([]);

  useEffect(() => {
    const newStars = Array.from({ length: 100 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      opacity: Math.random(),
      duration: Math.random() * 3 + 2,
    }));
    setStars(newStars);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute bg-white rounded-full"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
          }}
          animate={{
            opacity: [star.opacity, 1, star.opacity],
          }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

interface DanmakuItem {
  id: string;
  name: string;
  top: number;
  delay: number;
  durationScale: number;
  size: number;
  color: string;
}

function ParticipantDanmaku() {
  const participants = useLotteryStore((state) => state.participants);
  const status = useLotteryStore((state) => state.status);
  const speed = useLotteryStore((state) => state.config.speed || 5);
  const [items, setItems] = useState<DanmakuItem[]>([]);
  
  useEffect(() => {
    let namesToShow: string[] = [];
    if (participants.length === 0) {
      namesToShow = ["虚位以待...", "年会盛典", "2026", "好运连连", "特等奖", "锦鲤附体", "大奖等你拿", "万事如意"];
    } else {
      namesToShow = participants.map(p => p.name);
      // Ensure enough density
      if (namesToShow.length < 50) {
        const repeat = Math.ceil(50 / namesToShow.length);
        namesToShow = Array(repeat).fill(namesToShow).flat();
      }
    }

    const newItems = namesToShow.map((name, i) => {
      const row = i % 15;
      const top = (row * 6) + Math.random() * 4 + 5; 
      const colors = ["#2dd4bf", "#f472b6", "#fbbf24", "#60a5fa", "#a78bfa", "#34d399"];

      return {
        id: `dm-${i}-${Math.random()}`,
        name,
        top,
        delay: Math.random() * -20,
        durationScale: 0.8 + Math.random() * 0.4,
        size: 16 + Math.random() * 12,
        color: colors[Math.floor(Math.random() * colors.length)],
      };
    });
    setItems(newItems);
  }, [participants]);

  // Normal speed calculation
  const normalDuration = Math.max(2, 33 - (speed * 3));
  
  // When running, make it super fast (0.5s - 1s) to create a blur effect
  // We use a key to force re-render if needed, but CSS transition might handle it
  const isRunning = status === 'running';

  return (
    <div className={`absolute inset-0 overflow-hidden perspective-[1000px] transition-all duration-500 ${isRunning ? 'scale-110 blur-[2px]' : ''}`}>
      <style jsx global>{`
        @keyframes scrollLeft {
          from { transform: translateX(100vw); }
          to { transform: translateX(-100%); }
        }
      `}</style>
      
      {items.map((item) => (
        <div
          key={item.id}
          className="absolute whitespace-nowrap font-bold"
          style={{
            top: `${item.top}%`,
            fontSize: `${item.size}px`,
            color: item.color,
            textShadow: `0 0 5px ${item.color}80`,
            animationName: 'scrollLeft',
            // If running, override duration to be extremely fast
            animationDuration: isRunning ? `${(Math.random() * 0.5 + 0.2)}s` : `${normalDuration * item.durationScale}s`,
            animationTimingFunction: 'linear',
            animationIterationCount: 'infinite',
            animationDelay: isRunning ? '0s' : `${item.delay}s`,
            opacity: status === 'show-winner' ? 0.1 : (isRunning ? 0.8 : 0.9),
            transition: 'opacity 0.5s, filter 0.3s',
            willChange: 'transform, animation-duration'
          }}
        >
          {item.name}
        </div>
      ))}
      
      {/* Speed Lines Overlay when Running */}
      {isRunning && (
        <div className="absolute inset-0 z-10 opacity-50 bg-[repeating-linear-gradient(90deg,transparent,transparent_50px,rgba(255,255,255,0.1)_50px,rgba(255,255,255,0.1)_52px)] animate-pulse pointer-events-none" />
      )}

      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/80 pointer-events-none" />
    </div>
  );
}

function WinnerDisplay() {
  const currentWinners = useLotteryStore((state) => state.currentWinners);
  const status = useLotteryStore((state) => state.status);

  if (status !== 'show-winner' || currentWinners.length === 0) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/80 backdrop-blur-md">
      <div className="flex flex-col items-center gap-8 animate-in fade-in zoom-in duration-300">
        <h2 className="text-5xl font-black text-yellow-500 uppercase tracking-widest drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]">
          🎉 恭喜中奖 🎉
        </h2>
        <div className="flex flex-wrap justify-center gap-8 max-w-5xl">
          {currentWinners.map((winner, index) => (
            <motion.div
              key={winner.id}
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                type: "spring", 
                damping: 12, 
                stiffness: 200, 
                delay: index * 0.1 
              }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative px-16 py-10 bg-black border-2 border-yellow-500/50 rounded-xl text-center min-w-[280px] shadow-2xl">
                <p className="text-6xl font-black text-white mb-4 tracking-tight">{winner.name}</p>
                <div className="inline-block px-4 py-1 bg-yellow-500/20 rounded-full border border-yellow-500/30">
                  <p className="text-yellow-500 text-sm font-bold tracking-widest uppercase">WINNER</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function LotteryScene() {
  return (
    <div className="w-full h-full absolute inset-0 -z-10 bg-black overflow-hidden bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-black to-black">
      <StarBackground />
      <ParticipantDanmaku />
      <WinnerDisplay />
    </div>
  );
}
