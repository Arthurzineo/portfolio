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
| `components/synapse/focus/FocusMode.tsx` | Conventional page with all content. Server-rendered. An optional ambient copy of the neural scene sits behind it and orbits with scroll; content never depends on it. |
| `components/synapse/content/blocks.tsx` | Blocks shared by the panel and Focus Mode. |

## Behaviour

- Server renders Focus Mode, so all content is in the HTML. A boot script picks the mode before first paint:
  neural when WebGL exists, Focus when there is no WebGL, when the visitor chose it, or on first visit with
  `prefers-reduced-motion`. Without JavaScript, Focus Mode shows.
- Selection lives in the hash (`#/ksc-receiver`), so back/forward and deep links work. `Esc` returns to the core.
- `Ctrl/Cmd + K` opens the command palette (projects, areas, technologies, certifications, roles, actions).
- Completed certifications are nodes around Certifications; the ones in progress stay in the panel list.
- Education and Courses are areas with their own item nodes (the degree; the one course evidenced in the old site).
- Entrance sequence: `data-boot` on `<html>` holds the top bar, portrait, name, text and buttons in their
  starting state until the scene draws its first frame, then they enter in order alongside the burst
  (timeline in `globals.css`). A 4.5 s timer releases it if the scene never starts.
- Opening: all neurons start packed at the centre, burst outward with a flash and shockwave, then connections trace out.
- A full-screen backdrop pass makes each neuron light the background, following node state.
- Focus Mode builds on scroll: elements marked `data-build` play one entrance when they enter the view
  (IntersectionObserver in `FocusMode.tsx`, states in `globals.css`). No hiding without JS or with reduced motion.
- `focus/SideRain.tsx`: original 2D-canvas code rain in the side gutters of Focus Mode (no dependency, not
  derived from any paid component). Off on small screens and with reduced motion.
- Gestures in the neural scene: pinch or wheel to zoom, drag to orbit (sideways only on touch, so the page
  still scrolls). A new selection resets the view. Phones show area names always and the rest when zoomed in.
- Connections come from `panelConnections()` in `content/graph.ts`: every edge is listed on both ends.
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

- React Bits (MIT + Commons Clause, commit `cf28010`): six components vendored in `components/reactbits/`
  with the licence file. They have no dependencies of their own. Only local change: `DecryptedText` renders a
  plain `span` instead of `motion.span`, so the `motion` package is not needed.
  - `GradientASCII`: animated field behind the neural scene (masked, 50% opacity).
  - `ASCIIText`: the name in the neural hero. The real `h1` stays in the DOM for assistive tech and SSR.
  - `Radar`: decorative sweep at the top of the Security Engineering panel. Shows no data.
  - `LetterGlitch`: 620 ms curtain when switching between Neural and Focus.
  - `FuzzyText`: the "in progress" certification status.
  - `DecryptedText`: project summaries, once, when they enter the view.
  - `ReflectiveCard`: one card per certification (Focus Mode grid and the certification panel). `webcam` is
    always false; the camera is never requested.
  - `ProfileCard`: the portrait in the Focus Mode hero. `TiltedCard`: project images (click opens the lightbox).
  - `CircularGallery`: the lightbox for projects with several images (single images and reduced motion keep
    the plain viewer).
  - Local change in `ReflectiveCard` and `ProfileCard`: three Hugeicons glyphs replaced by inline SVG, so the
    icon packages are not needed.
  These layers are off on small screens, with reduced motion, and after the scene reports a low frame rate.
- transitions.dev: duration and easing tokens (`--dur-*`, `--ease`) and the panel/modal patterns in `globals.css`.
- Taste Skill (MIT) and Anthropic frontend-design: read as art-direction checklists. No installer was run.

## Third-party marks

`public/badges/comptia.svg` is the CompTIA mark from the `simple-icons` package (v16.37.0, CC0 for the
collection; the mark itself remains a CompTIA trademark), recoloured white. It appears only on completed
CompTIA certifications. `public/badges/sophos.png` is the Sophos wordmark supplied by the owner, recoloured white for contrast on
the blue card. Both are registered in `ISSUER_LOGO` in `content/portfolio.ts`.

## Images

`public/portrait/*.webp` were supplied by the owner and converted from PNG to WebP (960 px wide, quality 82).
Project screenshots are unchanged.

## Owner review before publishing

- Certification status of SecurityX ("in progress"). SecAI+ was confirmed completed on 2026-11-14.
- Certification cards are tinted per issuer (red for CompTIA, blue for Sophos) and show text. To add the
  official badge, put the file in `public/badges/` and set `badge` on the entry in `content/portfolio.ts`.
  Logos are not redrawn in code.
- Research section and the Web Attack Detection project, rewritten on 2026-11-14 around generalization of
  SQL Injection detection (five datasets, leave-one-dataset-out). The metrics line is carried over from the old site.
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
