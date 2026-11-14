"use client";

/**
 * Synapse OS shell. Owns no content: it wires the stores (mode, language,
 * selection) to the two presentations of the same data, the neural stage and
 * Focus Mode, plus the command palette and the image lightbox.
 */
import { lazy, Suspense, useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { itemById, nodeById, nodeOf, nodes, visualStates, type ItemId, type NodeId, type Selection } from "@/content/graph";
import { profile, type Project } from "@/content/portfolio";
import { ui } from "@/content/ui";
import { select, setMode, type Mode, useCompact, useLang, useMode, useReducedMotion, useSelection, useWebGL } from "@/lib/stores";
import { FocusMode } from "./focus/FocusMode";
import { CommandPalette } from "./os/CommandPalette";
import { Lightbox } from "./os/Lightbox";
import { TopBar } from "./os/TopBar";
import { WorkspacePanel } from "./os/WorkspacePanel";

const NeuralScene = lazy(() => import("./neural/NeuralScene"));
// React Bits effects are client-only canvases; each loads on demand so Focus Mode stays light.
const GradientASCII = lazy(() => import("@/components/reactbits/GradientASCII"));
const ASCIIText = lazy(() => import("@/components/reactbits/ASCIIText"));
const LetterGlitch = lazy(() => import("@/components/reactbits/LetterGlitch"));

const PALETTE = { obsidian: "#080C12", cyan: "#64E4DC", violet: "#7D6BF1", ice: "#E8F0F5" };
/** Length of the glitch curtain shown while switching between Neural and Focus. */
const CURTAIN_MS = 620;

const sceneOnFor = (mode: Mode, webgl: boolean) => mode === "neural" && webgl;
const noop = () => () => {};
const useHydrated = () =>
  useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );

export default function SynapseApp() {
  const mode = useMode();
  const lang = useLang();
  const selection = useSelection();
  const webgl = useWebGL();
  const reduced = useReducedMotion();
  const compact = useCompact();
  const hydrated = useHydrated();
  const t = ui[lang];

  const [hovered, setHovered] = useState<NodeId | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [lightbox, setLightbox] = useState<{ project: Project; index: number } | null>(null);
  const labels = useRef(new Map<NodeId, HTMLElement>());
  const [curtain, setCurtain] = useState(false);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach((id) => window.clearTimeout(id)), []);

  /** Mode switches pass behind a short glitch curtain; with reduced motion they cut instantly. */
  const switchMode = useCallback(
    (next: Mode) => {
      if (next === mode) return;
      if (reduced) return setMode(next);
      setCurtain(true);
      timers.current.push(window.setTimeout(() => setMode(next), CURTAIN_MS * 0.45), window.setTimeout(() => setCurtain(false), CURTAIN_MS));
    },
    [mode, reduced],
  );
  // The decorative layers need a pointer-capable, motion-tolerant, roomy screen.
  const [lite, setLite] = useState(false);
  const effects = sceneOnFor(mode, webgl) && !reduced && !compact && !lite;
  // Fetch the curtain ahead of time so the first mode switch is not an empty frame.
  useEffect(() => {
    void import("@/components/reactbits/LetterGlitch");
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((open) => !open);
      } else if (e.key === "Escape" && !document.querySelector("dialog[open]") && window.location.hash.startsWith("#/")) {
        select("core");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /** From the palette: in Focus Mode jump to the matching section, otherwise move through the graph. */
  const go = useCallback(
    (target: Selection) => {
      if (mode === "neural") return select(target);
      const anchors: Partial<Record<Selection, string>> = {
        about: "inicio",
        core: "inicio",
        projects: "projetos",
        experience: "experiencia",
        certifications: "certificacoes",
        research: "pesquisa",
        education: "experiencia",
        courses: "certificacoes",
      };
      const node = target === "about" ? null : nodeById[target];
      const id = anchors[target] ?? (node?.kind === "item" ? (anchors[itemById[node.id as ItemId].parent] ?? "certificacoes") : document.getElementById(target) ? target : "projetos");
      document.getElementById(id)?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
    },
    [mode, reduced],
  );

  const openImage = useCallback((project: Project, index: number) => setLightbox({ project, index }), []);
  const pickNode = useCallback((id: NodeId) => select(id === "core" ? "about" : id), []);
  const { nodeState } = visualStates(selection, hovered);
  const panelOpen = selection !== "core";
  const sceneOn = sceneOnFor(mode, webgl);

  return (
    <>
      <a className="skip" href={mode === "neural" ? "#stage" : "#content"}>
        {t.skip}
      </a>
      <TopBar
        lang={lang}
        t={t}
        mode={mode}
        canNeural={webgl}
        onMode={switchMode}
        onSearch={() => setPaletteOpen(true)}
        onHome={() => {
          if (mode === "neural") select("core");
          else window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
        }}
      />

      <div className="neural-root">
        <section className="stage" id="stage" tabIndex={-1} data-panel={panelOpen} data-hover={hovered !== null} aria-label={t.sceneLabel}>
          {effects ? (
            <div className="stage-ascii" aria-hidden="true">
              <Suspense fallback={null}>
                <GradientASCII
                  colors={[PALETTE.violet, PALETTE.cyan, "#1B2A44"]}
                  shape="horizon"
                  cellSize={16}
                  glyphOpacity={0.55}
                  gradientOpacity={0.35}
                  glow={0.1}
                  flicker={0.12}
                  speed={0.6}
                  grain={0}
                  mouseInteraction={false}
                  clickEffect="none"
                />
              </Suspense>
            </div>
          ) : null}
          <div className="stage-canvas">
            {sceneOn ? (
              <Suspense fallback={null}>
                <NeuralScene
                  selection={selection}
                  hovered={hovered}
                  onHover={setHovered}
                  onSelect={pickNode}
                  reduced={reduced}
                  compact={compact}
                  shift={compact ? 0 : panelOpen ? 0.15 : -0.16}
                  lift={compact || panelOpen ? 0 : 0.05}
                  labels={labels}
                  onSlow={() => setLite(true)}
                />
              </Suspense>
            ) : null}
            <nav className="labels" aria-label={t.areasNav}>
              {nodes.map((node) => (
                <button
                  key={node.id}
                  type="button"
                  ref={(el) => {
                    if (el) labels.current.set(node.id, el);
                    else labels.current.delete(node.id);
                  }}
                  data-kind={node.kind}
                  data-state={nodeState[node.id]}
                  aria-current={nodeOf(selection) === node.id && selection !== "core" ? "true" : undefined}
                  onClick={() => pickNode(node.id)}
                  onPointerEnter={() => setHovered(node.id)}
                  onPointerLeave={() => setHovered(null)}
                  onFocus={() => setHovered(node.id)}
                  onBlur={() => setHovered(null)}
                >
                  {node.kind === "core" ? t.about : node.kind === "item" ? itemById[node.id as ItemId].title[lang] : node.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="hero" data-hidden={panelOpen} inert={panelOpen}>
            <img src={profile.portraits.headshot} alt={profile.portraitAlt[lang]} width={960} height={1200} fetchPriority="high" />
            <div>
              <h1 data-ascii={effects}>{profile.name}</h1>
              {effects ? (
                <div className="hero-ascii" aria-hidden="true">
                  <Suspense fallback={null}>
                    <ASCIIText
                      text={profile.name}
                      fontFamily="'Archivo Variable', sans-serif"
                      fontWeight={700}
                      asciiFontSize={5}
                      textColor={PALETTE.ice}
                      colors={[PALETTE.ice, PALETTE.cyan, PALETTE.ice]}
                      waves={0.4}
                      tilt={0.3}
                      chroma={0.15}
                      hueShift={0}
                      scramble={0.3}
                      clickRipple={false}
                    />
                  </Suspense>
                </div>
              ) : null}
              <p className="hero-role">{profile.role[lang]}</p>
              <p className="hero-intro">{profile.intro[lang]}</p>
              <div className="hero-actions">
                <button type="button" className="action" onClick={() => select("projects")}>
                  {t.exploreProjects}
                </button>
                <button type="button" className="action action-quiet" onClick={() => select("about")}>
                  {t.about}
                </button>
                <button type="button" className="action action-quiet" onClick={() => switchMode("focus")}>
                  {t.switchToFocus}
                </button>
              </div>
            </div>
          </div>

          {/* Compact screens get a plain list of areas instead of crowded floating labels. */}
          <nav className="area-list" aria-label={t.areasNav} hidden={panelOpen}>
            {nodes
              .filter((node) => node.kind === "area")
              .map((node) => (
                <button key={node.id} type="button" onClick={() => select(node.id)}>
                  {node.label}
                </button>
              ))}
          </nav>

          <WorkspacePanel selection={selection} lang={lang} t={t} onSelect={select} onOpenImage={openImage} />
        </section>
      </div>

      <div className="focus-root">
        <FocusMode lang={lang} t={t} webgl={webgl} hydrated={hydrated} onOpenImage={openImage} />
      </div>

      {curtain ? (
        <div className="curtain" aria-hidden="true" style={{ animationDuration: `${CURTAIN_MS}ms` }}>
          <Suspense fallback={null}>
            <LetterGlitch
              glitchColors={[PALETTE.cyan, PALETTE.violet, PALETTE.ice]}
              backgroundColor={PALETTE.obsidian}
              fontSize={15}
              speed={2.4}
              glitchAmount={0.9}
              baseOpacity={0.5}
              interactive={false}
              clickEffect="none"
              intro={false}
            />
          </Suspense>
        </div>
      ) : null}
      {paletteOpen ? (
        <CommandPalette lang={lang} t={t} mode={mode} canNeural={webgl} onMode={switchMode} onGo={go} onClose={() => setPaletteOpen(false)} />
      ) : null}
      {lightbox ? (
        <Lightbox key={`${lightbox.project.id}-${lightbox.index}`} project={lightbox.project} start={lightbox.index} lang={lang} t={t} onClose={() => setLightbox(null)} />
      ) : null}
    </>
  );
}
