"use client";

/**
 * Synapse OS shell. Owns no content: it wires the stores (mode, language,
 * selection) to the two presentations of the same data, the neural stage and
 * Focus Mode, plus the command palette and the image lightbox.
 */
import { lazy, Suspense, useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { nodeById, nodeOf, nodes, visualStates, type NodeId, type Selection } from "@/content/graph";
import { profile, type Project } from "@/content/portfolio";
import { ui } from "@/content/ui";
import { select, setMode, useCompact, useLang, useMode, useReducedMotion, useSelection, useWebGL } from "@/lib/stores";
import { FocusMode } from "./focus/FocusMode";
import { CommandPalette } from "./os/CommandPalette";
import { Lightbox } from "./os/Lightbox";
import { TopBar } from "./os/TopBar";
import { WorkspacePanel } from "./os/WorkspacePanel";

const NeuralScene = lazy(() => import("./neural/NeuralScene"));

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
      };
      const node = target === "about" ? null : nodeById[target];
      const id = anchors[target] ?? (node?.kind === "cert" ? "certificacoes" : document.getElementById(target) ? target : "projetos");
      document.getElementById(id)?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
    },
    [mode, reduced],
  );

  const openImage = useCallback((project: Project, index: number) => setLightbox({ project, index }), []);
  const pickNode = useCallback((id: NodeId) => select(id === "core" ? "about" : id), []);
  const { nodeState } = visualStates(selection, hovered);
  const panelOpen = selection !== "core";
  const sceneOn = mode === "neural" && webgl;

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
        onSearch={() => setPaletteOpen(true)}
        onHome={() => {
          if (mode === "neural") select("core");
          else window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
        }}
      />

      <div className="neural-root">
        <section className="stage" id="stage" tabIndex={-1} data-panel={panelOpen} data-hover={hovered !== null} aria-label={t.sceneLabel}>
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
                  {node.kind === "core" ? t.about : node.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="hero" data-hidden={panelOpen} inert={panelOpen}>
            <img src={profile.portraits.headshot} alt={profile.portraitAlt[lang]} width={960} height={1200} fetchPriority="high" />
            <div>
              <h1>{profile.name}</h1>
              <p className="hero-role">{profile.role[lang]}</p>
              <p className="hero-intro">{profile.intro[lang]}</p>
              <div className="hero-actions">
                <button type="button" className="action" onClick={() => select("projects")}>
                  {t.exploreProjects}
                </button>
                <button type="button" className="action action-quiet" onClick={() => select("about")}>
                  {t.about}
                </button>
                <button type="button" className="action action-quiet" onClick={() => setMode("focus")}>
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

      {paletteOpen ? (
        <CommandPalette lang={lang} t={t} mode={mode} canNeural={webgl} onGo={go} onClose={() => setPaletteOpen(false)} />
      ) : null}
      {lightbox ? (
        <Lightbox key={`${lightbox.project.id}-${lightbox.index}`} project={lightbox.project} start={lightbox.index} lang={lang} t={t} onClose={() => setLightbox(null)} />
      ) : null}
    </>
  );
}
