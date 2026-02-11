"use client";

import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { useEffect, useMemo, useState } from "react";
import type { Container } from "@tsparticles/engine";

export function ParticlesBackground() {
  const [init, setInit] = useState(false);

  // this should be run only once per application lifetime
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      // you can initiate the tsParticles instance (engine) here, adding custom shapes or presets
      // this loads the tsparticles package bundle, it's the easiest method for getting everything ready
      // starting from v2 you can add only the features you need reducing the bundle size
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const particlesLoaded = async (container?: Container) => {
    console.log("Particles loaded:", container);
  };

  const options = useMemo(
    () => ({
      background: {
        color: {
          value: "transparent",
        },
      },
      fpsLimit: 120,
      interactivity: {
        events: {
          onClick: {
            enable: true,
            mode: "push" as const,
          },
          onHover: {
            enable: true,
            mode: "slow" as const,
          },
        },
        modes: {
          push: {
            quantity: 4,
          },
          slow: {
            factor: 4,
            radius: 200,
          },
        },
      },
      particles: {
        color: {
          value: "#00C8D2", // Cyan color matching the theme
        },
        links: {
          color: "#00C8D2",
          distance: 150,
          enable: true,
          opacity: 0.3, // Reduced opacity for subtler effect
          width: 1,
        },
        move: {
          direction: "none" as const,
          enable: true,
          outModes: {
            default: "bounce" as const,
          },
          random: false,
          speed: 1.5, // Slower speed for calmer effect
          straight: false,
        },
        number: {
          density: {
            enable: true,
            area: 800,
          },
          value: 60, // Fewer particles for login page
        },
        opacity: {
          value: 0.4, // Lower opacity
        },
        shape: {
          type: "circle",
        },
        size: {
          value: { min: 1, max: 2.5 },
        },
      },
      detectRetina: true,
    }),
    [],
  );

  if (init) {
    return (
      <div className="fixed inset-0 -z-10 w-screen bg-[#09090b]">
        <Particles
          id="auth-particles"
          particlesLoaded={particlesLoaded}
          options={options}
          className="h-full w-full"
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 -z-10 w-screen bg-[#09090b]">
      {/* Minimal fallback gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/10 via-transparent to-purple-900/10" />
    </div>
  );
}