"use client";

import { useEffect, useState } from "react";

interface Participant {
  id: number;
  name: string;
  color: string;
}

interface LotteryWheelProps {
  participants: Participant[];
  isSpinning: boolean;
}

export function LotteryWheel({ participants, isSpinning }: LotteryWheelProps) {
  const [rotationX, setRotationX] = useState(0);
  const [rotationY, setRotationY] = useState(0);

  useEffect(() => {
    if (isSpinning) {
      const finalRotationX = rotationX + 1440 + Math.random() * 360;
      const finalRotationY = rotationY + 2160 + Math.random() * 360;
      setRotationX(finalRotationX);
      setRotationY(finalRotationY);
    }
  }, [isSpinning]);

  const itemsPerRow = Math.max(4, Math.ceil(Math.sqrt(participants.length)));
  const radius = 200; // 减小半径，防止超出边界

  const positions = participants.map((_, index) => {
    const phi = Math.acos(-1 + (2 * index) / participants.length);
    const theta = Math.sqrt(participants.length * Math.PI) * phi;

    return {
      x: radius * Math.cos(theta) * Math.sin(phi),
      y: radius * Math.sin(theta) * Math.sin(phi),
      z: radius * Math.cos(phi),
    };
  });

  return (
    <div className="relative w-full h-96 flex items-center justify-center overflow-hidden" style={{ perspective: '1200px', pointerEvents: 'none' }}>
      <div className="absolute -inset-32 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 rounded-full blur-3xl opacity-20 animate-pulse" style={{ pointerEvents: 'none' }} />

      <div
        className="relative w-96 h-96"
        style={{
          transformStyle: 'preserve-3d',
          transform: `rotateX(${rotationX}deg) rotateY(${rotationY}deg)`,
          transition: isSpinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
          pointerEvents: 'none',
        }}
      >
        {participants.map((participant, index) => {
          const pos = positions[index];
          const angle = Math.atan2(pos.y, pos.x);
          const size = 140;

          return (
            <div
              key={participant.id}
              className="absolute rounded-2xl shadow-2xl flex flex-col items-center justify-center text-white font-bold text-center p-2 border-4 border-white/40 overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${participant.color}, ${participant.color}dd)`,
                backfaceVisibility: 'hidden',
                transformStyle: 'preserve-3d',
                transform: `translateX(${pos.x}px) translateY(${pos.y}px) translateZ(${pos.z}px) rotateY(${angle}rad)`,
                width: `${size}px`,
                height: `${size}px`,
              }}
            >
              <div className="text-sm md:text-base font-bold truncate max-w-full">{participant.name}</div>
            </div>
          );
        })}
      </div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full shadow-2xl z-20 flex items-center justify-center border-4 border-yellow-400" style={{ boxShadow: '0 0 40px rgba(255, 193, 7, 0.8)' }}>
        <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full animate-pulse" />
      </div>
    </div>
  );
}
