# Synapse OS

Redesign of the portfolio as a neural interface (direction A, "Cortex Orbital").
Base commit: `3bae8d3`. Branch: `redesign/synapse-os`.

## Structure

| Path | Responsibility |
| --- | --- |
| `content/portfolio.ts` | All professional content, PT and EN. The only place to edit text. |
| `content/graph.ts` | Nodes, edges and visual states derived from the content. Positions are authored, not simulated. |
| `content/ui.ts` | Interface strings. |
| `lib/stores.ts`, `lib/boot.ts` | Mode, language, selection (URL hash) and media queries as external stores; pre-paint boot script. |
| `components/synapse/SynapseApp.tsx` | Shell that wires stores to both presentations. |
| `components/synapse/neural/` | WebGL scene (React Three Fiber). Lazy-loaded, client only. |
| `components/synapse/os/` | Top bar, workspace panel, command palette, lightbox. |
| `components/synapse/focus/FocusMode.tsx` | Conventional page with all content. Server-rendered. |
| `components/synapse/content/blocks.tsx` | Blocks shared by the panel and Focus Mode. |

## Behaviour

- Server renders Focus Mode, so all content is in the HTML. A boot script picks the mode before first paint:
  neural when WebGL exists, Focus when there is no WebGL, when the visitor chose it, or on first visit with
  `prefers-reduced-motion`. Without JavaScript, Focus Mode shows.
- Selection lives in the hash (`#/ksc-receiver`), so back/forward and deep links work. `Esc` returns to the core.
- `Ctrl/Cmd + K` opens the command palette (projects, areas, technologies, certifications, roles, actions).
- Every connection in the graph has a written reason in `portfolio.ts` (`links[].why`, `areaLinks`).
- Quality adapts: pixel ratio is capped at 1.75; if average frame time after the intro is worse than about
  42 fps, the scene drops to pixel ratio 1 and half the particles. Small screens use 75% of the particles.
- With reduced motion and the neural mode chosen explicitly, the scene renders on demand: no continuous
  motion, no pulses, camera cuts instead of flying.

## Dependencies added

| Package | Version | Licence | Why |
| --- | --- | --- | --- |
| `three` | 0.187.0 | MIT | WebGL renderer, geometry, shaders. |
| `@react-three/fiber` | 9.8.2 | MIT | Declarative three.js inside React 19, with cleanup tied to component lifecycle. |
| `@fontsource-variable/archivo` | see package.json | OFL-1.1 (font) | Self-hosted Archivo with the width axis; replaces the Google Fonts fetch at build time. |
| `@types/three` (dev) | see package.json | MIT | Types. |

Not added on purpose: Drei (labels and camera are ~80 lines here), Motion/GSAP (CSS transitions cover the UI),
post-processing (glow comes from additive point density).

## References consulted

- React Bits (MIT + Commons Clause): read `WebThreads`, `Particles`, `Orb` for shader technique. No code copied.
- transitions.dev: duration and easing tokens (`--dur-*`, `--ease`) and the panel/modal patterns in `globals.css`.
- Taste Skill (MIT) and Anthropic frontend-design: read as art-direction checklists. No installer was run.

## Images

`public/portrait/*.webp` were supplied by the owner and converted from PNG to WebP (960 px wide, quality 82).
Project screenshots are unchanged.

## Owner review before publishing

- Certification statuses (SecAI+ and SecurityX "in progress").
- Expected graduation "2026" and the OpenRMF release window.
- Connection reasons written for this redesign (`links[].why`, `areaLinks`) – confirm each is accurate.

## Validation (2026-11-14, Linux container, Node 22.23, Chrome headless with SwiftShader)

- `npm run lint`: 0 errors, 6 `no-img-element` warnings (the previous page had 3 errors).
- `npm run build`, `npm run test` (1/1), `npm run validate:artifact`: pass.
- Checked in a browser at 1440, 768 and 390 px: home, area, project, about, palette, Focus Mode, EN, no-JS.
- Not measured: LCP, INP, CLS and FPS on real hardware. SwiftShader is software rendering, so numbers from
  this environment would not mean anything.

## Known issues

- The lazy neural chunk is about 930 kB (about 240 kB gzipped) because three.js is imported whole.
- `scripts/*.sh` are committed without the executable bit; `npm run build` needs `chmod +x scripts/*.sh` locally.
- `tsc --noEmit` reports missing Cloudflare types in `db/` and `worker/`; this predates the redesign.

## Rollback

The redesign is isolated to this branch. Reverting the merge commit restores the previous site; no data,
bindings or Cloudflare configuration were changed.
