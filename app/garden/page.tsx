'use client';

import React from 'react';
import GardenScene from '../../components/GardenScene';
import { generateDNA } from '../../lib/plant-generator';
import { useInteractions } from '../../lib/useInteractions';
import { useState } from 'react';
import SignIn from '../../components/Auth/SignIn';
import { useAuth } from '../../components/Auth/AuthProvider';
import { usePlantActivity } from '../../lib/usePlantActivity';

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
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { counts, addOptimistic } = usePlantActivity(plantId as string);

  async function onWater() {
    if (!user) return alert('Please sign in to interact (magic link).');
    setLoading(true);
    const undo = addOptimistic('water');
    const res = await sendInteraction(plantId, 'water');
    setLoading(false);
    if (!res.ok) {
      undo();
      setError(res.error || 'Failed to send interaction');
    } else {
      setError(null);
    }
  }

  async function onLike() {
    if (!user) return setError('Please sign in to interact (magic link).');
    const undo = addOptimistic('like');
    const res = await sendInteraction(plantId, 'like');
    if (!res.ok) {
      undo();
      setError(res.error || 'Failed to send interaction');
    } else {
      setError(null);
    }
  }

  async function onProgress() {
    if (!user) return setError('Please sign in to interact (magic link).');
    const undo = addOptimistic('progress');
    const res = await sendInteraction(plantId, 'progress');
    if (!res.ok) {
      undo();
      setError(res.error || 'Failed to log progress');
    } else {
      setError(null);
    }
  }

  return (
    <div className="p-3 border rounded shadow-sm bg-white">
      <div className="text-sm font-medium">Plant {plantId}</div>
      <div className="mt-2 flex gap-2 items-center">
        {user ? (
          <>
            <button onClick={onWater} className="px-3 py-1 bg-emerald-600 text-white rounded" disabled={loading}>
              {loading ? 'Watering…' : 'Water'}
            </button>
            <button onClick={onLike} className="px-3 py-1 border rounded">Like</button>
            <button onClick={onProgress} className="px-3 py-1 bg-amber-400 text-white rounded">Day of Progress</button>
          </>
        ) : (
          <div className="mt-2">
            <SignIn />
          </div>
        )}
        <div className="ml-auto text-xs text-slate-500">💧 {counts.water} • ❤️ {counts.like} • 🌱 {counts.growth}</div>
      </div>
      {error && <div className="mt-2 text-xs text-rose-600">{error}</div>}
    </div>
  );
}
