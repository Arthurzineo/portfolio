/**
 * GLSL for the neural universe. Two programs only:
 *  - soma: point clouds shaped like neurons (dense nucleus + dendrite spikes)
 *  - filament: bundles of curved strands carrying signal pulses
 * Both use additive blending, so glow comes from density rather than from a
 * post-processing pass. That keeps the scene cheap on integrated GPUs.
 *
 * uState follows STATE_LEVEL in content/graph.ts:
 * 0.25 dim, 1 normal, 1.5 linked, 2 hot.
 */

export const somaVertex = /* glsl */ `
attribute float aSeed;
attribute float aSize;
uniform float uTime;
uniform float uState;
uniform float uIntro;
uniform float uPx;
uniform float uDensity;
varying float vSeed;

void main() {
  vec3 p = position;
  float t = uTime * 0.35 + aSeed * 6.2831;
  p += 0.05 * vec3(sin(t + p.y * 3.0), cos(t * 1.3 + p.z * 3.0), sin(t * 0.7 + p.x * 3.0));
  float breathe = 1.0 + 0.035 * sin(uTime * 0.8 + aSeed * 3.0) + 0.1 * smoothstep(1.0, 2.0, uState);
  p *= breathe * uIntro;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  float keep = step(aSeed, uDensity);
  gl_PointSize = keep * aSize * uPx * (1.15 + 0.45 * uState) * mix(0.4, 1.0, uIntro) / -mv.z;
  vSeed = aSeed;
}`;

export const somaFragment = /* glsl */ `
uniform vec3 uIce;
uniform vec3 uCyan;
uniform vec3 uViolet;
uniform float uState;
varying float vSeed;

void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.0, d);
  a *= a;
  vec3 signal = mix(uCyan, uViolet, step(0.74, vSeed));
  vec3 color = mix(uIce, signal, smoothstep(1.0, 1.6, uState));
  float alpha = a * mix(0.16, 0.95, smoothstep(0.2, 1.0, uState));
  gl_FragColor = vec4(color * alpha, alpha);
}`;

export const filamentVertex = /* glsl */ `
attribute float aT;
attribute float aPhase;
attribute float aState;
attribute float aDir;
varying float vT;
varying float vPhase;
varying float vState;

void main() {
  vT = aDir > 0.0 ? aT : 1.0 - aT;
  vPhase = aPhase;
  vState = aState;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

export const filamentFragment = /* glsl */ `
uniform vec3 uIce;
uniform vec3 uCyan;
uniform vec3 uViolet;
uniform float uTime;
uniform float uIntro;
uniform float uMotion;
varying float vT;
varying float vPhase;
varying float vState;

void main() {
  if (vT > uIntro * 1.15) discard;
  float lit = smoothstep(1.0, 1.9, vState);
  float f = fract(vT - uTime * 0.16 + vPhase);
  float pulse = smoothstep(0.0, 0.05, f) * smoothstep(0.16, 0.05, f) * uMotion;
  vec3 color = mix(uIce, mix(uCyan, uViolet, vT), lit);
  float alpha = mix(0.05, 0.3, smoothstep(0.2, 1.0, vState)) + 0.5 * lit;
  alpha += pulse * (0.35 + 0.6 * smoothstep(0.9, 2.0, vState));
  alpha *= smoothstep(0.0, 0.04, vT) * smoothstep(1.0, 0.96, vT);
  gl_FragColor = vec4(color * alpha, alpha);
}`;

/**
 * Backdrop: a full-screen pass drawn behind everything. Each neuron lights the
 * "fog" around it, and the light reveals a fine dot lattice that is otherwise
 * invisible, so the background visibly responds to which nodes are active.
 * uNodes[i] = (x, y, radius) in device pixels and the node's state level.
 */
export const MAX_GLOW = 28;

export const backdropVertex = /* glsl */ `
void main() {
  gl_Position = vec4(position.xy, 0.9999, 1.0);
}`;

export const backdropFragment = /* glsl */ `
uniform vec4 uNodes[${MAX_GLOW}];
uniform int uCount;
uniform vec3 uCyan;
uniform vec3 uViolet;
uniform vec3 uIce;
uniform float uTime;
uniform float uHeight;
uniform vec2 uCore;
uniform float uShock;
uniform float uFlash;
uniform float uGlow;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  vec3 light = vec3(0.0);
  for (int i = 0; i < ${MAX_GLOW}; i++) {
    if (i >= uCount) break;
    vec4 n = uNodes[i];
    vec2 d = (frag - n.xy) / n.z;
    float falloff = exp(-dot(d, d) * 2.4);
    float lit = smoothstep(1.0, 1.7, n.w);
    vec3 hue = mix(uCyan, uViolet, fract(float(i) * 0.618 + 0.2));
    vec3 color = mix(mix(hue, uIce, 0.35) * 0.6, hue, lit);
    light += color * falloff * 0.15 * n.w * n.w;
  }
  light *= uGlow;
  // Opening burst: a flash at the core, then a shockwave that sweeps outward and lights the lattice as it passes.
  float fromCore = length(frag - uCore) / uHeight;
  float ring = exp(-pow((fromCore - uShock * 1.25) / 0.04, 2.0)) * pow(1.0 - uShock, 1.5) * step(0.001, uShock);
  light += mix(uCyan, uIce, 0.4) * ring * 0.55;
  light += uIce * exp(-fromCore * fromCore / 0.03) * uFlash * 0.9;

  vec2 uv = frag / uHeight;
  float fog = 0.6 + 0.8 * noise(uv * 2.6 + vec2(uTime * 0.02, -uTime * 0.013));
  vec3 color = light * fog;

  vec2 cell = fract(uv * 52.0) - 0.5;
  float dotMask = smoothstep(0.11, 0.04, length(cell));
  color += light * dotMask * 2.6;

  color = color + (hash(frag) - 0.5) / 255.0;
  gl_FragColor = vec4(max(color, 0.0), max(color.r, max(color.g, color.b)));
}`;

export const PALETTE = {
  obsidian: "#080C12",
  ice: "#E8F0F5",
  cyan: "#64E4DC",
  violet: "#7D6BF1",
} as const;
