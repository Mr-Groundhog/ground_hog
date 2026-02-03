"use client";

import { useEffect, useRef, useState } from "react";
import { useLotteryStore } from "./lottery-store";
import { motion } from "framer-motion";

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

interface SphereParticle {
  id: string;
  name: string;
  x: number;
  y: number;
  z: number;
  scale: number;
  opacity: number;
}

function ParticipantSphere() {
  const participants = useLotteryStore((state) => state.participants);
  const status = useLotteryStore((state) => state.status);
  const [particles, setParticles] = useState<SphereParticle[]>([]);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const rotationSpeed = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // 初始化球形粒子分布
  useEffect(() => {
    if (participants.length === 0) {
      // 如果没有参与者，显示默认提示
      setParticles([]);
      return;
    }

    const newParticles: SphereParticle[] = [];
    const names = participants.map(p => p.name);

    // 使用球面均匀分布算法
    const phi = Math.PI * (3 - Math.sqrt(5)); // 黄金角

    for (let i = 0; i < names.length; i++) {
      const y = 1 - (i / (names.length - 1)) * 2; // y goes from 1 to -1
      const radius = Math.sqrt(1 - y * y); // radius at y
      
      const theta = phi * i; // golden angle increment
      
      const x = Math.cos(theta) * radius;
      const z = Math.sin(theta) * radius;

      newParticles.push({
        id: `particle-${i}`,
        name: names[i],
        x: x * 100,
        y: y * 100,
        z: z * 100,
        scale: 1,
        opacity: 1,
      });
    }

    setParticles(newParticles);
  }, [participants]);

  // 旋转动画效果
  useEffect(() => {
    if (status !== 'running' || particles.length === 0) {
      rotationSpeed.current = { x: 0, y: 0 };
      return;
    }

    // 设置随机旋转速度
    rotationSpeed.current = {
      x: (Math.random() - 0.5) * 0.05,
      y: (Math.random() - 0.5) * 0.05 + 0.01
    };

    let animationFrameId: number;
    
    const animate = () => {
      setRotation(prev => ({
        x: prev.x + rotationSpeed.current.x,
        y: prev.y + rotationSpeed.current.y
      }));

      // 逐渐减慢旋转速度
      rotationSpeed.current.x *= 0.995;
      rotationSpeed.current.y *= 0.995;

      // 如果旋转速度足够慢，停止动画
      if (Math.abs(rotationSpeed.current.x) < 0.0001 && Math.abs(rotationSpeed.current.y) < 0.0001) {
        rotationSpeed.current = { x: 0, y: 0 };
        // 在停止时，可能需要触发停止逻辑
        setTimeout(() => {
          if (status === 'running') {
            useLotteryStore.getState().stopLottery();
          }
        }, 500);
      } else {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [status, particles.length]);

  // 计算每个粒子的3D变换
  const getTransform = (particle: SphereParticle) => {
    // 应用旋转矩阵
    const cosX = Math.cos(rotation.x);
    const sinX = Math.sin(rotation.x);
    const cosY = Math.cos(rotation.y);
    const sinY = Math.sin(rotation.y);

    // 旋转点
    let x = particle.x;
    let y = particle.y;
    let z = particle.z;

    // 围绕Y轴旋转
    const rotatedX = x * cosY - z * sinY;
    const rotatedZ = x * sinY + z * cosY;
    x = rotatedX;
    z = rotatedZ;

    // 围绕X轴旋转
    const rotatedY = y * cosX - z * sinX;
    const finalZ = y * sinX + z * cosX;
    y = rotatedY;
    z = finalZ;

    // 透视投影
    const perspective = 800;
    const scale = perspective / (perspective + z);
    const finalX = x * scale;
    const finalY = y * scale;

    // 计算透明度和大小，基于Z坐标（深度）
    const opacity = Math.max(0.2, Math.min(1, (z + 100) / 200));
    const particleScale = Math.max(0.5, Math.min(1.5, scale));

    return {
      transform: `translate3d(${finalX}px, ${finalY}px, ${z}px) scale(${particleScale})`,
      opacity: opacity,
      zIndex: Math.round(z + 100),
    };
  };

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 flex items-center justify-center overflow-hidden"
    >
      <div className="relative w-80 h-80 md:w-96 md:h-96 lg:w-[500px] lg:h-[500px] flex items-center justify-center">
        {/* 球形容器边框 */}
        {participants.length > 0 && (
          <div className="absolute w-full h-full rounded-full border border-white/10" style={{
            boxShadow: 'inset 0 0 30px rgba(255,255,255,0.1)',
          }} />
        )}
        
        {particles.length > 0 ? (
          particles.map((particle) => {
            const transformStyle = getTransform(particle);
            const isWinner = useLotteryStore.getState().currentWinners.some(w => w.name === particle.name);
            
            return (
              <div
                key={particle.id}
                className={`absolute px-3 py-1 rounded-full text-sm font-bold transition-all duration-300 ${
                  isWinner 
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black scale-125 z-[1000]' 
                    : 'bg-white/10 text-white backdrop-blur-sm border border-white/20'
                }`}
                style={{
                  transform: transformStyle.transform,
                  opacity: transformStyle.opacity,
                  zIndex: transformStyle.zIndex,
                  left: '50%',
                  top: '50%',
                  marginLeft: '-50%',
                  marginTop: '-50%',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.3s ease',
                }}
              >
                {particle.name}
              </div>
            );
          })
        ) : (
          // 显示占位符文本
          <div className="absolute text-white/30 text-center text-lg font-light">
            {participants.length === 0 ? '请添加参与者' : '正在准备抽奖...'}
          </div>
        )}
        
        {/* 旋转指示器 */}
        {status === 'running' && particles.length > 0 && (
          <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-spin pointer-events-none" style={{ 
            borderWidth: '1px',
            borderStyle: 'dashed',
            animationDuration: '3s'
          }} />
        )}
      </div>
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
      <ParticipantSphere />
      <WinnerDisplay />
    </div>
  );
}