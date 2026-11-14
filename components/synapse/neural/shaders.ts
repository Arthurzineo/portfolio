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
  gl_PointSize = keep * aSize * uPx * (1.15 + 0.45 * uState) / -mv.z;
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

export const PALETTE = {
  obsidian: "#080C12",
  ice: "#E8F0F5",
  cyan: "#64E4DC",
  violet: "#7D6BF1",
} as const;
