"use client";

import type { Lang } from "@/content/portfolio";
import type { UI } from "@/content/ui";
import { setLang, setMode, type Mode } from "@/lib/stores";

type Props = { lang: Lang; t: UI; mode: Mode; canNeural: boolean; onHome: () => void; onSearch: () => void };

export function TopBar({ lang, t, mode, canNeural, onHome, onSearch }: Props) {
  return (
    <header className="topbar">
      <button type="button" className="brand" onClick={onHome} aria-label={`${t.brand}: ${t.home}`}>
        <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true">
          <circle cx="10" cy="10" r="2.4" fill="currentColor" />
          <path d="M10 7.6V2M12.1 11.2l5 2.9M7.9 11.2l-5 2.9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="10" cy="2" r="1.2" fill="currentColor" />
          <circle cx="17.1" cy="14.1" r="1.2" fill="currentColor" />
          <circle cx="2.9" cy="14.1" r="1.2" fill="currentColor" />
        </svg>
        <span>{t.brand}</span>
      </button>

      <button type="button" className="search" onClick={onSearch} aria-keyshortcuts="Control+K Meta+K">
        <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
          <circle cx="7" cy="7" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
          <path d="m10.5 10.5 3.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
        <span className="search-long">{t.search}</span>
        <span className="search-short">{t.searchShort}</span>
        <kbd>Ctrl K</kbd>
      </button>

      <div className="topbar-controls">
        <div className="segmented" role="group" aria-label={t.modeLabel}>
          <button
            type="button"
            aria-pressed={mode === "neural"}
            disabled={!canNeural}
            title={canNeural ? undefined : t.noWebgl}
            onClick={() => setMode("neural")}
          >
            {t.neural}
          </button>
          <button type="button" aria-pressed={mode === "focus"} onClick={() => setMode("focus")}>
            {t.focus}
          </button>
        </div>
        <div className="segmented" role="group" aria-label={t.langLabel}>
          <button type="button" aria-pressed={lang === "pt"} onClick={() => setLang("pt")} lang="pt-BR" aria-label="Português">
            PT
          </button>
          <button type="button" aria-pressed={lang === "en"} onClick={() => setLang("en")} lang="en" aria-label="English">
            EN
          </button>
        </div>
      </div>
    </header>
  );
}
