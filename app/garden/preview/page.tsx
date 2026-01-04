'use client';

import React, { useState } from 'react';
import GardenScene from '../../../components/GardenScene';
import { generateDNA } from '../../../lib/plant-generator';

export default function PreviewPage() {
  const [seed, setSeed] = useState('demo');
  const [iterations, setIterations] = useState(4);
  const [angle, setAngle] = useState(25);

  const dna = generateDNA(seed, { iterations, angle });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Plant Preview</h2>
      <div className="space-y-3">
        <label className="block">
          Seed
          <input value={seed} onChange={(e) => setSeed(e.target.value)} className="ml-2 border p-1 rounded" />
        </label>
        <label className="block">
          Iterations: {iterations}
          <input type="range" min={1} max={6} value={iterations} onChange={(e) => setIterations(Number(e.target.value))} />
        </label>
        <label className="block">
          Angle: {angle}
          <input type="range" min={5} max={60} value={angle} onChange={(e) => setAngle(Number(e.target.value))} />
        </label>
      </div>

      <div>
        <GardenScene plants={[{ id: 'preview-1', dna }]} />
      </div>
    </div>
  );
}
