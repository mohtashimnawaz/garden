'use client';

import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { geometryFromDNA } from '../lib/plant-generator';

export default function PlantRenderer({ dna, position = [0, 0, 0], waterTimestamp }: { dna: any; position?: [number, number, number]; waterTimestamp?: number }) {
  const group = useRef<THREE.Group>(null);
  const geom = useMemo(() => geometryFromDNA(dna), [dna]);
  const pulseRef = useRef(0);
  const lastWaterRef = useRef<number | undefined>(undefined);

  // gentle bob for demo + pulse on water
  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y += 0.002;
      const bob = Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
      // pulse decay
      if (pulseRef.current > 0) pulseRef.current *= 0.92;
      const scale = 1 + pulseRef.current * 0.25;
      group.current.position.y = bob;
      group.current.scale.set(scale, scale, scale);
    }
  });

  // trigger pulse when waterTimestamp changes
  useEffect(() => {
    if (!waterTimestamp) return;
    if (lastWaterRef.current === waterTimestamp) return;
    lastWaterRef.current = waterTimestamp;

    pulseRef.current = 1.0; // start pulse
  }, [waterTimestamp]);

  return (
    <group ref={group} position={position}>
      <mesh geometry={geom} castShadow receiveShadow>
        <meshStandardMaterial color={dna?.color || '#6b8e23'} metalness={0.2} roughness={0.7} />
      </mesh>
    </group>
  );
}
