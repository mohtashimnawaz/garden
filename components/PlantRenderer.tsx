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

  const splashRef = useRef<THREE.Mesh>(null);

  // trigger pulse when waterTimestamp changes
  useEffect(() => {
    if (!waterTimestamp) return;
    if (lastWaterRef.current === waterTimestamp) return;
    lastWaterRef.current = waterTimestamp;

    pulseRef.current = 1.0; // start pulse
  }, [waterTimestamp]);

  useFrame((state) => {
    // existing bob/pulse code above runs here
    if (splashRef.current) {
      const t = pulseRef.current; // 1.0 -> decays
      if (t > 0) {
        const s = 0.3 + (1 - t) * 1.6; // grows outwards as pulse decays
        splashRef.current.scale.set(s, s, s);
        const mat = splashRef.current.material as THREE.MeshStandardMaterial;
        if (mat) {
          mat.opacity = Math.max(0, t * 0.6);
          mat.emissiveIntensity = 0.6 * t;
        }
      } else {
        // reset small
        splashRef.current.scale.set(0.01, 0.01, 0.01);
      }
    }
  });

  return (
    <group ref={group} position={position}>
      <mesh geometry={geom} castShadow receiveShadow>
        <meshStandardMaterial color={dna?.color || '#6b8e23'} metalness={0.2} roughness={0.6} />
      </mesh>

      {/* expanding translucent splash on water (simple sphere) */}
      <mesh ref={splashRef} position={[0, 0.3, 0]} scale={[0.01, 0.01, 0.01]}>
        <sphereGeometry args={[0.01, 12, 8]} />
        <meshStandardMaterial
          transparent
          opacity={0.0}
          emissive={'#8ee7ff'}
          emissiveIntensity={0.0}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}
