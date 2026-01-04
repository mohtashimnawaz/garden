'use client';

import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { useInteractions } from './useInteractions';

export type PlantCounts = { water: number; like: number };

export function usePlantActivity(plantId: string) {
  const [counts, setCounts] = useState<PlantCounts>({ water: 0, like: 0 });

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const { count: waterCount } = await supabase
          .from('interactions')
          .select('*', { count: 'exact', head: true })
          .eq('plant_id', plantId)
          .eq('kind', 'water');
        const { count: likeCount } = await supabase
          .from('interactions')
          .select('*', { count: 'exact', head: true })
          .eq('plant_id', plantId)
          .eq('kind', 'like');
        if (!mounted) return;
        setCounts({ water: waterCount || 0, like: likeCount || 0 });
      } catch (e) {
        console.warn('failed to load counts', e);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [plantId]);

  // subscribe to realtime inserts and update counts
  useInteractions((row) => {
    if (row.plant_id !== plantId) return;
    if (row.kind === 'water') setCounts((c) => ({ ...c, water: c.water + 1 }));
    if (row.kind === 'like') setCounts((c) => ({ ...c, like: c.like + 1 }));
  });

  function addOptimistic(kind: 'water' | 'like') {
    setCounts((c) => ({ ...c, [kind]: c[kind] + 1 }));
    return () => {
      setCounts((c) => ({ ...c, [kind]: Math.max(0, c[kind] - 1) }));
    };
  }

  return { counts, addOptimistic };
}
