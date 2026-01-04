import * as THREE from 'three';
import { mergeBufferGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils';

export type DNA = {
  axiom: string;
  rules: Record<string, string>;
  iterations: number;
  angle: number; // degrees
  step: number; // length of each forward step
  scale: number;
  color?: string;
};

// Generate DNA tuned to a growth parameter G
export function generateFromGrowth(G: number, seed = 'default'): DNA {
  const base = generateDNA(seed);
  // Map G to iterations/angle/step/scale
  if (G <= 0) {
    return {
      axiom: 'F',
      rules: { F: 'F' },
      iterations: 0,
      angle: 15,
      step: 0.3,
      scale: 0.7,
      color: base.color
    };
  }

  if (G < 10) {
    // small stem with a couple leaves
    return {
      axiom: 'F',
      rules: { F: 'F[+L]F[-L]F' },
      iterations: 2,
      angle: 25,
      step: 0.4,
      scale: 0.9,
      color: base.color
    };
  }

  if (G < 100) {
    // medium branching
    return {
      axiom: 'F',
      rules: { F: 'F[+F]F[-F]F' },
      iterations: Math.min(4, 2 + Math.floor(G / 25)),
      angle: 22,
      step: 0.6,
      scale: 1.0,
      color: base.color
    };
  }

  // G >= 100: complex fractal with occasional flowers
  return {
    axiom: 'F',
    rules: { F: 'F[+F]F[-F]FB' }, // append B as a flower indicator
    iterations: Math.min(6, 4 + Math.floor((G - 100) / 50)),
    angle: 20,
    step: 0.6,
    scale: 1.0,
    color: base.color
  };
}

// Deterministic DNA generator (seed-based choices)
export function generateDNA(seed: string, opts: Partial<DNA> = {}): DNA {
  const hash = Array.from(seed).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const palette = ['#6b8e23', '#3b82f6', '#ef4444', '#f59e0b', '#8b5cf6'];

  return {
    axiom: 'F',
    rules: { F: 'F[+F]F[-F]F' },
    iterations: opts.iterations ?? 3 + (hash % 3),
    angle: opts.angle ?? 20 + (hash % 15),
    step: opts.step ?? 0.6,
    scale: opts.scale ?? 1,
    color: opts.color || palette[hash % palette.length]
  };
}

export function expandLSystem(dna: DNA): string {
  let s = dna.axiom;
  for (let i = 0; i < dna.iterations; i++) {
    let next = '';
    for (const ch of s) {
      next += dna.rules[ch] ?? ch;
    }
    s = next;
  }
  return s;
}

// Create a cylinder BufferGeometry between two points
function cylinderBetweenPoints(p1: THREE.Vector3, p2: THREE.Vector3, radiusTop = 0.03, radiusBottom = 0.04, radialSegments = 6) {
  const dir = new THREE.Vector3().subVectors(p2, p1);
  const len = dir.length();
  if (len <= 0) return new THREE.BufferGeometry();

  // Cylinder aligned with Y axis by default; we'll rotate it to match dir
  const geom = new THREE.CylinderGeometry(radiusTop, radiusBottom, len, radialSegments);
  // move origin to center
  geom.translate(0, len / 2, 0);

  const up = new THREE.Vector3(0, 1, 0);
  const q = new THREE.Quaternion().setFromUnitVectors(up, dir.clone().normalize());
  geom.applyQuaternion(q);
  // translate to start point
  geom.translate(p1.x, p1.y, p1.z);

  return geom;
}

// Convert DNA -> BufferGeometry by interpreting the expanded L-string as turtle graphics
export function geometryFromDNA(dna: DNA): THREE.BufferGeometry {
  const lstr = expandLSystem(dna);
  const stack: Array<{ pos: THREE.Vector3; dir: THREE.Vector3 }> = [];
  const pos = new THREE.Vector3(0, 0, 0);
  const dir = new THREE.Vector3(0, 1, 0); // initial pointing up

  const angleRad = (dna.angle * Math.PI) / 180;
  const geometries: THREE.BufferGeometry[] = [];

  for (const ch of lstr) {
    if (ch === 'F') {
      const next = pos.clone().add(dir.clone().multiplyScalar(dna.step * dna.scale));
      const thickness = Math.max(0.01, 0.06 * (1 - 0.04 * dna.iterations));
      const cyl = cylinderBetweenPoints(pos.clone(), next.clone(), thickness * dna.scale, thickness * dna.scale);
      geometries.push(cyl);
      pos.copy(next);
    } else if (ch === 'L') {
      // simple leaf: small flattened sphere offset slightly to the side
      const leaf = new THREE.SphereGeometry(0.08 * dna.scale, 8, 6);
      const leafGeom = new THREE.BufferGeometry().copy(leaf as any);
      // offset the leaf a bit perpendicular to dir
      const side = new THREE.Vector3().crossVectors(dir, new THREE.Vector3(0, 1, 0)).normalize().multiplyScalar(0.05 * dna.scale);
      leafGeom.translate(pos.x + side.x, pos.y + side.y, pos.z + side.z);
      geometries.push(leafGeom);
    } else if (ch === 'B') {
      // flower: small sphere at current position
      const flower = new THREE.SphereGeometry(0.06 * dna.scale, 8, 6);
      const fgeom = new THREE.BufferGeometry().copy(flower as any);
      fgeom.translate(pos.x, pos.y, pos.z);
      geometries.push(fgeom);
    } else if (ch === '+') {
      // rotate around Z by +angle
      const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), angleRad);
      dir.applyQuaternion(q).normalize();
    } else if (ch === '-') {
      const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), -angleRad);
      dir.applyQuaternion(q).normalize();
    } else if (ch === '[') {
      stack.push({ pos: pos.clone(), dir: dir.clone() });
    } else if (ch === ']') {
      const s = stack.pop();
      if (s) {
        pos.copy(s.pos);
        dir.copy(s.dir);
      }
    } else {
      // ignore other symbols for now
    }
  }

  if (geometries.length === 0) return new THREE.BufferGeometry();

  const merged = mergeBufferGeometries(geometries, false);
  merged.computeVertexNormals();
  return merged;
}

export default {
  generateDNA,
  expandLSystem,
  geometryFromDNA,
  generateFromGrowth
};
