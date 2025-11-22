"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { Stars, Environment } from "@react-three/drei";
import * as THREE from "three";

const Orb = ({ position, size, imageUrl, speed }: { position: [number, number, number]; size: number; imageUrl: string; speed: number }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useLoader(THREE.TextureLoader, imageUrl);

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime;
      // Circular motion around the initial position
      // Removed offset so they all start at the same relative phase (0)
      meshRef.current.position.x = position[0] + Math.cos(time * speed) * 0.5;
      meshRef.current.position.y = position[1] + Math.sin(time * speed) * 0.5;
      
      // Rotation of the planet itself - Much slower
      meshRef.current.rotation.y += speed * 0.02;
    }
  });
  
  return (
    <mesh ref={meshRef} position={position}>
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
  // Fixed positions to ensure no overlap but less uniform
  const orbs = useMemo(() => {
    const fixedPositions: { pos: [number, number, number]; size: number }[] = [
      { pos: [-5.5, 2.4, 0], size: 1.3 },   // Top Left Corner
      { pos: [5.6, 2.1, 0], size: 1.1 },    // Top Right Corner
      { pos: [-4.3, -2.4, 0], size: 1.0 },  // Bottom Left Corner
      { pos: [4.8, -2.4, 0], size: 1.4 },   // Bottom Right Corner
      { pos: [0.8, 2.1, 0], size: 0.9 },      // Top Edge
    ];

    return fixedPositions.map((config, i) => ({
      position: config.pos,
      size: config.size,
      speed: 0.1 + Math.random() * 0.1, // Slower speed (0.1 - 0.2)
      // Use generative space textures for a more "space-like" vibe
      imageUrl: `https://image.pollinations.ai/prompt/detailed%20planet%20surface%20texture%20space%20abstract%20cosmic?width=512&height=512&nologo=true&seed=${i + 500}`,
    }));
  }, []);

  return (
    <>
      <ambientLight intensity={0.8} />
      <pointLight position={[10, 10, 10]} intensity={1.5} />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Environment preset="city" />

      {orbs.map((orb, i) => (
        <Orb key={i} {...orb} />
      ))}
    </>
  );
};

const SpaceBackground = () => {
  return (
    <div className="fixed inset-0 z-0 bg-black">
      <Canvas camera={{ position: [0, 0, 22], fov: 20 }}> {/* Very low FOV for orthographic-like lack of distortion */}
        <Scene />
      </Canvas>
    </div>
  );
};

export default SpaceBackground;
