"use client";

import { useEffect, useState } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

export function ParticleBackground() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < 50; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 2,
        duration: Math.random() * 10 + 10,
        delay: Math.random() * 5,
      });
    }
    setParticles(newParticles);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full bg-white/20 animate-float"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animationDuration: `${particle.duration}s`,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}

      <div className="absolute top-10 left-10 text-6xl animate-bounce-slow">✨</div>
      <div className="absolute top-20 right-20 text-5xl animate-bounce-slow" style={{ animationDelay: '0.5s' }}>🎁</div>
      <div className="absolute bottom-20 left-20 text-5xl animate-bounce-slow" style={{ animationDelay: '1s' }}>🎊</div>
      <div className="absolute bottom-10 right-10 text-6xl animate-bounce-slow" style={{ animationDelay: '1.5s' }}>🎉</div>
    </div>
  );
}
