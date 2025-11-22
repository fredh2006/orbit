"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { Stars, Environment } from "@react-three/drei";
import * as THREE from "three";

// Orbital ring component
const OrbitalRing = ({ radius, speed, thickness, opacity }: { radius: number; speed: number; thickness: number; opacity: number }) => {
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.z += speed * 0.1;
    }
  });

  return (
    <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[radius, thickness, 2, 100]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={opacity} />
    </mesh>
  );
};

// Planet orbiting around center
const OrbitingPlanet = ({ radius, speed, size, imageUrl, rotationSpeed, startAngle }: { radius: number; speed: number; size: number; imageUrl: string; rotationSpeed: number; startAngle: number }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useLoader(THREE.TextureLoader, imageUrl);

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime;
      // Orbit around center with starting angle offset
      meshRef.current.position.x = Math.cos(time * speed + startAngle) * radius;
      meshRef.current.position.y = Math.sin(time * speed + startAngle) * radius;

      // Rotate the planet itself
      meshRef.current.rotation.y += rotationSpeed;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[size, 64, 64]} />
      <meshStandardMaterial
        map={texture}
        roughness={0.8}
        metalness={0.1}
        envMapIntensity={0.5}
      />
    </mesh>
  );
};

const Scene = () => {
  const orbitalSystem = useMemo(() => {
    return [
      { radius: 5, speed: 0.25, thickness: 0.015, opacity: 0.12 },
      { radius: 7, speed: 0.2, thickness: 0.02, opacity: 0.15 },
      { radius: 9, speed: 0.15, thickness: 0.025, opacity: 0.12 },
      { radius: 11, speed: 0.12, thickness: 0.02, opacity: 0.1 },
      { radius: 13, speed: 0.08, thickness: 0.03, opacity: 0.08 },
    ];
  }, []);

  const planets = useMemo(() => {
    return [
      {
        radius: 5,
        speed: 0.25,
        size: 0.35,
        rotationSpeed: 0.008,
        startAngle: 0,
        imageUrl: `https://image.pollinations.ai/prompt/detailed%20planet%20surface%20texture%20space%20abstract%20cosmic?width=512&height=512&nologo=true&seed=500`
      },
      {
        radius: 7,
        speed: 0.2,
        size: 0.45,
        rotationSpeed: 0.005,
        startAngle: Math.PI * 0.6,
        imageUrl: `https://image.pollinations.ai/prompt/detailed%20planet%20surface%20texture%20space%20abstract%20cosmic?width=512&height=512&nologo=true&seed=501`
      },
      {
        radius: 9,
        speed: 0.15,
        size: 0.55,
        rotationSpeed: 0.003,
        startAngle: Math.PI * 1.2,
        imageUrl: `https://image.pollinations.ai/prompt/detailed%20planet%20surface%20texture%20space%20abstract%20cosmic?width=512&height=512&nologo=true&seed=502`
      },
      {
        radius: 11,
        speed: 0.12,
        size: 0.4,
        rotationSpeed: 0.006,
        startAngle: Math.PI * 0.3,
        imageUrl: `https://image.pollinations.ai/prompt/detailed%20planet%20surface%20texture%20space%20abstract%20cosmic?width=512&height=512&nologo=true&seed=503`
      },
      {
        radius: 13,
        speed: 0.08,
        size: 0.5,
        rotationSpeed: 0.004,
        startAngle: Math.PI * 1.7,
        imageUrl: `https://image.pollinations.ai/prompt/detailed%20planet%20surface%20texture%20space%20abstract%20cosmic?width=512&height=512&nologo=true&seed=504`
      },
    ];
  }, []);

  return (
    <>
      <ambientLight intensity={0.8} />
      <pointLight position={[10, 10, 10]} intensity={1.5} />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Environment preset="city" />

      {/* Central glow */}
      <mesh>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
        <pointLight color="#ffffff" intensity={2} distance={10} />
      </mesh>

      {/* Orbital rings */}
      {orbitalSystem.map((ring, i) => (
        <OrbitalRing key={i} {...ring} />
      ))}

      {/* Orbiting planets */}
      {planets.map((planet, i) => (
        <OrbitingPlanet key={i} {...planet} />
      ))}
    </>
  );
};

const SpaceBackground = () => {
  return (
    <div
      className="fixed inset-0 z-0 bg-black"
      style={{
        background: "radial-gradient(circle at center, #0B1026 0%, #000000 100%)"
      }}
    >
      <Canvas camera={{ position: [0, 0, 15], fov: 50 }}>
        <Scene />
      </Canvas>
    </div>
  );
};

export default SpaceBackground;
