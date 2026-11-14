import * as THREE from "three";
import { edges, nodeById, nodes, type GraphEdge } from "@/content/graph";

/** Deterministic PRNG so the universe looks identical on every visit. */
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const POINTS = { core: 900, area: 320, project: 150, cert: 110 } as const;

/** A neuron-like point cloud: a gaussian nucleus with curved dendrite spikes. */
export function somaGeometry(kind: keyof typeof POINTS, radius: number, seed: number) {
  const count = POINTS[kind];
  const rnd = mulberry32(seed * 7919 + 13);
  const position = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  const sizes = new Float32Array(count);

  const spikeCount = 5 + Math.floor(rnd() * 3);
  const spikes = Array.from({ length: spikeCount }, () => {
    const dir = new THREE.Vector3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).normalize();
    const side = new THREE.Vector3().crossVectors(dir, new THREE.Vector3(0.3, 1, 0.2)).normalize();
    return { dir, side, length: radius * (1.3 + rnd() * 1.3), phase: rnd() * Math.PI };
  });
  const gauss = () => (rnd() + rnd() + rnd() - 1.5) / 1.5;
  const p = new THREE.Vector3();

  for (let i = 0; i < count; i += 1) {
    if (rnd() < 0.62) {
      p.set(gauss(), gauss(), gauss()).multiplyScalar(radius * 0.55);
      sizes[i] = 22 + rnd() * 40;
    } else {
      const s = spikes[Math.floor(rnd() * spikeCount)];
      const t = Math.pow(rnd(), 0.7);
      p.copy(s.dir).multiplyScalar(t * s.length);
      p.addScaledVector(s.side, Math.sin(t * Math.PI * 0.9 + s.phase) * 0.14 * s.length);
      p.x += gauss() * radius * 0.05;
      p.y += gauss() * radius * 0.05;
      p.z += gauss() * radius * 0.05;
      sizes[i] = 14 + (1 - t) * 26;
    }
    position.set([p.x, p.y, p.z], i * 3);
    seeds[i] = rnd();
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(position, 3));
  geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
  geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
  geometry.computeBoundingSphere();
  return geometry;
}

const SEGMENTS = 40;
const STRANDS: Record<GraphEdge["kind"], number> = { trunk: 4, link: 3, branch: 2 };

export type EdgeRange = { id: string; from: string; to: string; start: number; count: number };

/** All edges as one LineSegments geometry: each edge is a bundle of curved strands. */
export function filamentGeometry() {
  const total = edges.reduce((n, e) => n + STRANDS[e.kind] * SEGMENTS * 2, 0);
  const position = new Float32Array(total * 3);
  const aT = new Float32Array(total);
  const aPhase = new Float32Array(total);
  const aState = new Float32Array(total).fill(1);
  const aDir = new Float32Array(total).fill(1);
  const ranges: EdgeRange[] = [];

  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const dir = new THREE.Vector3();
  const side = new THREE.Vector3();
  const up = new THREE.Vector3();
  const control = new THREE.Vector3();
  const start = new THREE.Vector3();
  const end = new THREE.Vector3();
  const point = new THREE.Vector3();
  let v = 0;

  edges.forEach((edge, index) => {
    const rnd = mulberry32(index * 104729 + 7);
    const from = nodeById[edge.from];
    const to = nodeById[edge.to];
    a.set(...from.position);
    b.set(...to.position);
    dir.subVectors(b, a);
    const length = dir.length();
    dir.normalize();
    side.crossVectors(dir, new THREE.Vector3(0.3, 1, 0.2)).normalize();
    up.crossVectors(dir, side).normalize();
    const bowSide = (rnd() - 0.5) * 0.3;
    const bowUp = (rnd() - 0.5) * 0.3;
    const first = v;

    for (let s = 0; s < STRANDS[edge.kind]; s += 1) {
      const phase = rnd();
      start.copy(a).addScaledVector(side, (rnd() - 0.5) * from.radius * 0.5).addScaledVector(up, (rnd() - 0.5) * from.radius * 0.5);
      end.copy(b).addScaledVector(side, (rnd() - 0.5) * to.radius * 0.5).addScaledVector(up, (rnd() - 0.5) * to.radius * 0.5);
      control
        .addVectors(a, b)
        .multiplyScalar(0.5)
        .addScaledVector(side, length * (bowSide + (rnd() - 0.5) * 0.16))
        .addScaledVector(up, length * (bowUp + (rnd() - 0.5) * 0.16));

      for (let i = 0; i < SEGMENTS; i += 1) {
        for (const t of [i / SEGMENTS, (i + 1) / SEGMENTS]) {
          const u = 1 - t;
          point.set(0, 0, 0).addScaledVector(start, u * u).addScaledVector(control, 2 * u * t).addScaledVector(end, t * t);
          position.set([point.x, point.y, point.z], v * 3);
          aT[v] = t;
          aPhase[v] = phase;
          v += 1;
        }
      }
    }
    ranges.push({ id: edge.id, from: edge.from, to: edge.to, start: first, count: v - first });
  });

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(position, 3));
  geometry.setAttribute("aT", new THREE.BufferAttribute(aT, 1));
  geometry.setAttribute("aPhase", new THREE.BufferAttribute(aPhase, 1));
  geometry.setAttribute("aState", new THREE.BufferAttribute(aState, 1).setUsage(THREE.DynamicDrawUsage));
  geometry.setAttribute("aDir", new THREE.BufferAttribute(aDir, 1).setUsage(THREE.DynamicDrawUsage));
  geometry.computeBoundingSphere();
  return { geometry, ranges };
}

/** Sparse far-field particles that give the scene depth and parallax. */
export function dustGeometry(count = 700) {
  const rnd = mulberry32(4242);
  const position = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  const sizes = new Float32Array(count);
  for (let i = 0; i < count; i += 1) {
    const r = 8 + rnd() * 16;
    const theta = rnd() * Math.PI * 2;
    const phi = Math.acos(2 * rnd() - 1);
    position.set([r * Math.sin(phi) * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta) * 0.7, r * Math.cos(phi) - 4], i * 3);
    seeds[i] = rnd();
    sizes[i] = 14 + rnd() * 26;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(position, 3));
  geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
  geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
  return geometry;
}

export const nodeSeed = (id: string) => nodes.findIndex((n) => n.id === id) + 1;
