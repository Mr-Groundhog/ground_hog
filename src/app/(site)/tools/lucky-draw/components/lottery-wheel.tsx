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
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (isSpinning) {
      // 旋转至少 5 圈（1800 度）+ 随机角度
      const finalRotation = rotation + 1800 + Math.random() * 360;
      setRotation(finalRotation);
    }
  }, [isSpinning]);

  const count = participants.length;
  const angleStep = 360 / count;
  const cardSize = 100;
  // 根据卡片数量动态计算半径，保证卡片不重叠
  const radius = Math.max(180, (count * (cardSize + 20)) / (2 * Math.PI));

  return (
    <div
      className="relative w-full h-[520px]"
      style={{ perspective: '1200px', pointerEvents: 'none' }}
    >
      {/* 背景光晕 - 从顶部中枢向下扩散 */}
      <div
        className="absolute left-1/2 -translate-x-1/2 top-0 w-[400px] h-[400px] rounded-full blur-3xl animate-pulse"
        style={{
          background: 'radial-gradient(circle, rgba(255, 215, 0, 0.15) 0%, rgba(255, 150, 50, 0.08) 40%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* 顶部黄色中枢 - 吊灯顶座 */}
      <div
        className="absolute top-[16px] left-1/2 -translate-x-1/2 w-24 h-24 rounded-full z-20 flex items-center justify-center"
        style={{
          background: 'radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.3) 70%)',
          boxShadow: '0 0 60px rgba(255, 193, 7, 0.6), 0 8px 40px rgba(255, 193, 7, 0.3), inset 0 0 20px rgba(255, 193, 7, 0.3)',
          border: '3px solid rgba(255, 193, 7, 0.5)',
          pointerEvents: 'none',
        }}
      >
        <div
          className="w-12 h-12 rounded-full animate-pulse"
          style={{
            background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
            boxShadow: '0 0 30px rgba(255, 215, 0, 0.8)',
          }}
        />
      </div>

      {/* 连接杆 - 吊灯臂 */}
      <div
        className="absolute left-1/2 -translate-x-1/2 z-10"
        style={{
          top: '100px',
          width: '3px',
          height: '120px',
          background: 'linear-gradient(to bottom, rgba(255, 215, 0, 0.7), rgba(255, 215, 0, 0.15))',
          boxShadow: '0 0 8px rgba(255, 215, 0, 0.3)',
          pointerEvents: 'none',
        }}
      />

      {/* 连接点装饰 - 杆底部小环 */}
      <div
        className="absolute left-1/2 -translate-x-1/2 z-10 w-5 h-5 rounded-full"
        style={{
          top: '212px',
          background: 'radial-gradient(circle, rgba(255, 215, 0, 0.6), rgba(255, 215, 0, 0.1))',
          boxShadow: '0 0 12px rgba(255, 215, 0, 0.4)',
          pointerEvents: 'none',
        }}
      />

      {/* 3D 旋转容器 - 吊灯下方旋转 */}
      <div
        className="absolute left-1/2 z-0"
        style={{
          top: '260px',
          transformStyle: 'preserve-3d',
          transform: `rotateY(${rotation}deg)`,
          transition: isSpinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
          pointerEvents: 'none',
          width: '0px',
          height: '0px',
        }}
      >
        {participants.map((participant, index) => {
          const angle = angleStep * index;

          return (
            <div
              key={participant.id}
              className="absolute rounded-xl shadow-2xl flex flex-col items-center justify-center text-white font-bold text-center px-2 border-4 border-white/40"
              style={{
                background: `linear-gradient(135deg, ${participant.color}, ${participant.color}dd)`,
                transform: `rotateY(${angle}deg) translateZ(${radius}px)`,
                width: `${cardSize}px`,
                height: `${cardSize}px`,
                marginLeft: `-${cardSize / 2}px`,
                marginTop: `-${cardSize / 2}px`,
              }}
            >
              <div className="text-base md:text-lg font-bold leading-tight break-words max-w-full">
                {participant.name}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
