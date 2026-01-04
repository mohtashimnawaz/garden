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
    console.log('Realtime interactions subscribed');
  }, [connected]);

  // small status indicator component
  function Status() {
    return (
      <div className="absolute top-2 right-2 text-xs text-slate-400 bg-white/60 px-2 py-1 rounded flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${connected ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
        <span>{connected ? 'Live' : 'Offline'}</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[60vh] rounded-md overflow-hidden border bg-gradient-to-b from-slate-50 to-white">
      <Status />
      <Canvas camera={{ position: [0, 2, 6], fov: 50 }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 10, 5]} intensity={0.8} />
        {/* simple ground */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color="#f7fff7" />
        </mesh>
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
