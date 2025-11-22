"use client";

import { useEffect, useState } from "react";

interface OrbitLoadingTransitionProps {
  onComplete?: () => void;
}

export default function OrbitLoadingTransition({ onComplete }: OrbitLoadingTransitionProps) {
  const [scale, setScale] = useState(100); // Start zoomed OUT (large scale)
  const [opacity, setOpacity] = useState(1);
  const [mounted, setMounted] = useState(false);
  const [particleOffsets] = useState(() =>
    Array.from({ length: 12 }, () => 20 + Math.random() * 10)
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    // Zoom IN animation (scale down to 1)
    const timer = setTimeout(() => {
      setScale(1);
    }, 50);

    // Start fade out near the end
    const fadeTimer = setTimeout(() => {
      setOpacity(0);
    }, 1600);

    // Call onComplete when animation finishes
    const completeTimer = setTimeout(() => {
      if (onComplete) {
        onComplete();
      }
    }, 2000); // 2 seconds total animation

    return () => {
      clearTimeout(timer);
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete, mounted]);

  if (!mounted) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0a1a]"
      style={{
        opacity,
        transition: 'opacity 0.4s ease-out',
      }}
    >
      {/* Expanding circle with gradient */}
      <div
        className="absolute rounded-full bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 backdrop-blur-sm"
        style={{
          width: '100px',
          height: '100px',
          transform: `scale(${scale})`,
          transition: 'transform 2s cubic-bezier(0.4, 0, 0.2, 1)',
          willChange: 'transform',
        }}
      />

      {/* Inner expanding circle */}
      <div
        className="absolute rounded-full bg-gradient-to-br from-blue-400/30 via-purple-400/30 to-pink-400/30"
        style={{
          width: '60px',
          height: '60px',
          transform: `scale(${scale * 0.8})`,
          transition: 'transform 2s cubic-bezier(0.4, 0, 0.2, 1) 0.1s',
          willChange: 'transform',
        }}
      />

      {/* Core circle with stars effect */}
      <div
        className="absolute rounded-full bg-white/10 backdrop-blur-md border border-white/20"
        style={{
          width: '30px',
          height: '30px',
          transform: `scale(${scale * 0.6})`,
          transition: 'transform 2s cubic-bezier(0.4, 0, 0.2, 1) 0.2s',
          willChange: 'transform',
          boxShadow: '0 0 60px rgba(255, 255, 255, 0.5), 0 0 100px rgba(139, 92, 246, 0.3)',
        }}
      />

      {/* Loading text */}
      <div
        className="absolute text-white font-space text-sm tracking-wider opacity-0 mt-32"
        style={{
          opacity: scale > 0.3 ? 1 : 0,
          transition: 'opacity 0.5s ease-in-out 0.5s',
        }}
      >
        Entering Orbit...
      </div>

      {/* Particle effects */}
      {particleOffsets.map((offset, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-white rounded-full"
          style={{
            transform: `rotate(${i * 30}deg) translateY(-${offset * scale}px) scale(${scale / 100})`,
            opacity: scale === 1 ? 0.6 : 0,
            transition: `all 2s cubic-bezier(0.4, 0, 0.2, 1) ${i * 0.05}s`,
            willChange: 'transform, opacity',
          }}
        />
      ))}
    </div>
  );
}
