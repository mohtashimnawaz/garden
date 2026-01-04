'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import PlantRenderer from './PlantRenderer';
import { useInteractions } from '../lib/useInteractions';

export default function GardenScene({ plants = [] }: { plants?: any[] }) {
  const [waterEvents, setWaterEvents] = useState<Record<string, number>>({});
  const { connected } = useInteractions((row) => {
    if (row.kind === 'water') {
      setWaterEvents((s) => ({ ...s, [row.plant_id]: Date.now() }));
    }
  });

  useEffect(() => {
    if (!connected) return;
    // Could show a tiny status in the corner; for now log
    console.log('Realtime interactions subscribed');
  }, [connected]);

  return (
    <div className="w-full h-[60vh] rounded-md overflow-hidden border">
      <Canvas camera={{ position: [0, 2, 6], fov: 50 }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 10, 5]} intensity={0.8} />
        <Suspense fallback={null}>
          {plants.map((p, i) => {
            const x = (i - (plants.length - 1) / 2) * 0.9;
            return (
              <PlantRenderer key={p.id} dna={p.dna} position={[x, 0, 0]} waterTimestamp={waterEvents[p.id]} />
            );
          })}
        </Suspense>
      </Canvas>
    </div>
  );
}
