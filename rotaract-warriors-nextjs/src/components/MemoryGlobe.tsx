"use client";

import { useRef, useState, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useTexture, Preload } from "@react-three/drei";
import * as THREE from "three";
import { GalleryItem } from "@/lib/firebase";

interface MemoryGlobeProps {
  items: GalleryItem[];
  onItemClick: (item: GalleryItem) => void;
}

// Single Curved Image Card representing a segment of the sphere
function CurvedImageCard({
  item,
  phiStart,
  phiLength,
  thetaStart,
  thetaLength,
  onClick,
}: {
  item: GalleryItem;
  phiStart: number;
  phiLength: number;
  thetaStart: number;
  thetaLength: number;
  onClick: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Load the texture using Drei's helper (automatically handles caching)
  const texture = useTexture(item.image);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    // Smoothly scale card outward and upward on hover
    const targetScale = hovered ? 1.08 : 1.0;
    const currentScale = THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale, 0.15);
    meshRef.current.scale.set(currentScale, currentScale, currentScale);
  });

  return (
    <mesh
      ref={meshRef}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={(e) => {
        setHovered(false);
        document.body.style.cursor = "default";
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      position={[0, 0, 0]} // Keep at origin to let sphere segments curve around the center
    >
      {/* 
        SphereGeometry parameters:
        radius: 4.2
        widthSegments: 16
        heightSegments: 16
        phiStart, phiLength (horizontal bounds)
        thetaStart, thetaLength (vertical bounds)
      */}
      <sphereGeometry args={[4.2, 16, 16, phiStart, phiLength, thetaStart, thetaLength]} />
      <meshBasicMaterial
        map={texture}
        side={THREE.DoubleSide}
        transparent
        opacity={hovered ? 1.0 : 0.85}
        toneMapped={false}
      />
    </mesh>
  );
}

// Inner globe group that handles auto-rotation, dragging, and inertia damping
function GlobeGroup({
  items,
  onItemClick,
  isDragging,
  dragTarget,
}: {
  items: GalleryItem[];
  onItemClick: (item: GalleryItem) => void;
  isDragging: boolean;
  dragTarget: React.MutableRefObject<{ x: number; y: number; lastTime: number }>;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const targetRotation = useRef({ x: 0, y: 0 });
  const autoRotationSpeed = 0.12; // slow, smooth rotation speed

  // Setup card dimensions in radians for sphere segments
  const phiLength = 0.45; // azimuthal width (~26 degrees)
  const thetaLength = 0.32; // polar height (~18 degrees)
  const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // ~137.5 degrees
  const count = items.length;

  const cardsData = items.map((item, i) => {
    // Fibonacci sphere mapping coordinates
    const y = 1 - (i / (count - 1)) * 2; // ranges from 1 down to -1
    const polarAngle = Math.acos(y); // theta angle from top Y-axis
    const azimuthalAngle = i * goldenAngle; // phi angle around Y-axis

    // Center each card segment around its Fibonacci center point
    const phiStart = (azimuthalAngle - phiLength / 2) % (Math.PI * 2);
    const thetaStart = polarAngle - thetaLength / 2;

    return {
      item,
      phiStart,
      phiLength,
      thetaStart,
      thetaLength,
    };
  });

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const now = state.clock.getElapsedTime();

    if (isDragging) {
      targetRotation.current.y = dragTarget.current.y;
      targetRotation.current.x = dragTarget.current.x;
    } else {
      // Resume auto-rotation if 3 seconds have elapsed since pointer release
      const timeSinceRelease = now - dragTarget.current.lastTime;
      if (timeSinceRelease > 3.0) {
        targetRotation.current.y += autoRotationSpeed * delta;
      }
    }

    // Apply smooth inertia damping via lerping
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotation.current.y, 0.1);
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotation.current.x, 0.1);
  });

  return (
    <group ref={groupRef}>
      <Suspense fallback={null}>
        {cardsData.map((data, idx) => (
          <CurvedImageCard
            key={data.item.id || idx}
            item={data.item}
            phiStart={data.phiStart}
            phiLength={data.phiLength}
            thetaStart={data.thetaStart}
            thetaLength={data.thetaLength}
            onClick={() => onItemClick(data.item)}
          />
        ))}
      </Suspense>
    </group>
  );
}

export default function MemoryGlobe({ items, onItemClick }: MemoryGlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Track dragging coordinates and timings
  const dragTarget = useRef({ x: 0, y: 0, lastTime: 0 });
  const pointerStart = useRef({ x: 0, y: 0 });
  const rotationStart = useRef({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    pointerStart.current = { x: e.clientX, y: e.clientY };
    rotationStart.current = { x: dragTarget.current.x, y: dragTarget.current.y };
    if (containerRef.current) {
      containerRef.current.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - pointerStart.current.x;
    const deltaY = e.clientY - pointerStart.current.y;

    const sensitivity = 0.005; // Drag sensitivity
    dragTarget.current.y = rotationStart.current.y + deltaX * sensitivity;
    // Bound the vertical rotation angle to prevent complete inversion
    dragTarget.current.x = Math.max(
      -Math.PI / 4,
      Math.min(Math.PI / 4, rotationStart.current.x + deltaY * sensitivity)
    );
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    dragTarget.current.lastTime = performance.now() / 1000;
    if (containerRef.current) {
      containerRef.current.releasePointerCapture(e.pointerId);
    }
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className="w-full h-[450px] md:h-[550px] lg:h-[650px] relative select-none touch-none cursor-grab active:cursor-grabbing flex items-center justify-center"
    >
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-radial-glow opacity-30 pointer-events-none z-0" />

      <Canvas
        camera={{ position: [0, 0, 7.8], fov: 60 }}
        dpr={[1, 1.5]}
        className="z-10 relative"
      >
        <ambientLight intensity={1.5} />
        <pointLight position={[10, 10, 10]} intensity={1.0} />
        <GlobeGroup
          items={items}
          onItemClick={onItemClick}
          isDragging={isDragging}
          dragTarget={dragTarget}
        />
        <Preload all />
      </Canvas>

      {/* Decorative elliptical guidance outline */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[360px] md:w-[480px] h-[360px] md:h-[480px] border border-burgundy-500/10 rounded-full pointer-events-none scale-y-[0.38] z-0" />
    </div>
  );
}
