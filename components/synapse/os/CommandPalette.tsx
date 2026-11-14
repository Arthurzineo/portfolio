"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Selection } from "@/content/graph";
import { areas, certifications, experience, projects, type Lang } from "@/content/portfolio";
import type { UI } from "@/content/ui";
import { setLang, setMode, type Mode } from "@/lib/stores";

type Entry = { key: string; label: string; hint: string; kind: string; run: () => void };

const fold = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

function buildIndex(lang: Lang, t: UI, mode: Mode, canNeural: boolean, go: (s: Selection) => void): Entry[] {
  const technologies = new Map<string, typeof projects>();
  for (const p of projects) for (const tag of p.tags) technologies.set(tag, [...(technologies.get(tag) ?? []), p]);
  return [
    ...projects.map((p) => ({ key: `p:${p.id}`, label: p.title, hint: p.description[lang], kind: t.kindProject, run: () => go(p.id) })),
    ...areas.map((a) => ({ key: `a:${a.id}`, label: a.name, hint: a.summary[lang], kind: t.kindArea, run: () => go(a.id) })),
    { key: "about", label: t.about, hint: "Arthur Gonçalves", kind: t.kindArea, run: () => go("about") },
    ...[...technologies].flatMap(([tag, list]) =>
      list.map((p) => ({ key: `t:${tag}:${p.id}`, label: tag, hint: p.title, kind: t.kindTech, run: () => go(p.id) })),
    ),
    ...certifications.map((c) => ({ key: `c:${c.name}`, label: c.name, hint: c.detail, kind: t.kindCert, run: () => go(c.status === "done" ? c.id : "certifications") })),
    ...experience.map((r) => ({
      key: `r:${r.id}`,
      label: r.role[lang],
      hint: `${r.org[lang]}, ${r.period[lang]}`,
      kind: t.kindRole,
      run: () => go("experience"),
    })),
    ...(mode === "neural"
      ? [{ key: "mode", label: t.switchToFocus, hint: "", kind: t.kindAction, run: () => setMode("focus") }]
      : canNeural
        ? [{ key: "mode", label: t.switchToNeural, hint: "", kind: t.kindAction, run: () => setMode("neural") }]
        : []),
    { key: "lang", label: t.switchLang, hint: "", kind: t.kindAction, run: () => setLang(lang === "pt" ? "en" : "pt") },
  ];
}

type Props = { lang: Lang; t: UI; mode: Mode; canNeural: boolean; onGo: (s: Selection) => void; onClose: () => void };

export function CommandPalette({ lang, t, mode, canNeural, onGo, onClose }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const index = useMemo(() => buildIndex(lang, t, mode, canNeural, onGo), [lang, t, mode, canNeural, onGo]);
  const results = useMemo(() => {
    const q = fold(query.trim());
    if (!q) return index.filter((e) => !e.key.startsWith("t:") && !e.key.startsWith("r:") && !e.key.startsWith("c:"));
    return index.filter((e) => fold(`${e.label} ${e.hint}`).includes(q));
  }, [index, query]);
  const current = Math.min(active, Math.max(0, results.length - 1));

  // A native modal dialog gives focus trapping, Esc to close, and focus return for free.
  useEffect(() => {
    const el = dialog.current;
    if (el && !el.open) el.showModal();
  }, []);

  useEffect(() => {
    dialog.current?.querySelector(`[data-index="${current}"]`)?.scrollIntoView({ block: "nearest" });
  }, [current]);

  const run = (entry: Entry | undefined) => {
    if (!entry) return;
    onClose();
    entry.run();
  };

  return (
    <dialog
      ref={dialog}
      className="palette"
      aria-label={t.search}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="palette-box">
        <input
          type="text"
          role="combobox"
          aria-expanded="true"
          aria-controls="palette-list"
          aria-activedescendant={results[current] ? `palette-${current}` : undefined}
          aria-label={t.search}
          placeholder={t.search}
          autoComplete="off"
          spellCheck={false}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((current + 1) % Math.max(1, results.length));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((current - 1 + results.length) % Math.max(1, results.length));
            } else if (e.key === "Enter") {
              e.preventDefault();
              run(results[current]);
            }
          }}
        />
        <ul id="palette-list" role="listbox" aria-label={t.search}>
          {results.map((entry, i) => (
            <li
              key={entry.key}
              id={`palette-${i}`}
              role="option"
              aria-selected={i === current}
              data-index={i}
              onMouseMove={() => setActive(i)}
              onClick={() => run(entry)}
            >
              <span className="palette-label">{entry.label}</span>
              <span className="palette-hint">{entry.hint}</span>
              <span className="palette-kind">{entry.kind}</span>
            </li>
          ))}
        </ul>
        {results.length === 0 ? <p className="palette-empty">{t.paletteEmpty}</p> : null}
        <p className="palette-foot">{t.paletteHint}</p>
      </div>
    </dialog>
  );
}
