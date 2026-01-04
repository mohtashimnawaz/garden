'use client';

import React from 'react';
import GardenScene from '../../components/GardenScene';
import { generateDNA } from '../../lib/plant-generator';
import { useInteractions } from '../../lib/useInteractions';
import { useState } from 'react';
import SignIn from '../../components/Auth/SignIn';
import { useAuth } from '../../components/Auth/AuthProvider';

export default function GardenPage() {
  // placeholder demo seeds
  const plants = [
    { id: 'demo-1', dna: generateDNA('sunrise') },
    { id: 'demo-2', dna: generateDNA('river') }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Community Garden</h2>
      <GardenScene plants={plants} />
      <div className="flex gap-3">
        {plants.map((p) => (
          <PlantControls key={p.id} plantId={p.id} />
        ))}
      </div>
      <p className="text-sm text-slate-500">This is a minimal demo scene. Use the Water button to emit a realtime 'water' event and watch plants animate.</p>
    </div>
  );
}

function PlantControls({ plantId }: { plantId: string }) {
  const { sendInteraction } = useInteractions();
  const [loading, setLoading] = useState(false);

  async function onWater() {
    setLoading(true);
    const res = await sendInteraction(plantId, 'water');
    setLoading(false);
    if (!res.ok) alert('Failed: ' + res.error);
  }

  return (
    <div className="p-2 border rounded">
      <div className="text-sm">Plant {plantId}</div>
      <button onClick={onWater} className="mt-2 px-3 py-1 bg-emerald-600 text-white rounded" disabled={loading}>
        {loading ? 'Watering…' : 'Water'}
      </button>
    </div>
  );
}
