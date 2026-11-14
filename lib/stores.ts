"use client";

/**
 * Tiny external stores read with useSyncExternalStore. Keeping this state
 * outside React means the server render (Focus Mode, Portuguese, home) never
 * disagrees with hydration, and the pre-paint boot script in layout.tsx can
 * pick the mode before React loads without a flash.
 */
import { useSyncExternalStore } from "react";
import { isNodeId, type Selection } from "@/content/graph";
import type { Lang } from "@/content/portfolio";

export type Mode = "neural" | "focus";

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

function remember(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Storage can be unavailable (private mode); the choice then lasts for this visit only.
  }
}

// Mode ------------------------------------------------------------------
const readMode = (): Mode => (document.documentElement.dataset.mode === "neural" ? "neural" : "focus");
export function setMode(mode: Mode) {
  document.documentElement.dataset.mode = mode;
  remember("synapse-mode", mode);
  emit();
}
export const useMode = () => useSyncExternalStore(subscribe, readMode, (): Mode => "focus");
export const useWebGL = () =>
  useSyncExternalStore(
    subscribe,
    () => document.documentElement.dataset.webgl === "1",
    () => false,
  );

// Language --------------------------------------------------------------
const readLang = (): Lang => (document.documentElement.lang.startsWith("en") ? "en" : "pt");
export function setLang(lang: Lang) {
  document.documentElement.lang = lang === "en" ? "en" : "pt-BR";
  remember("synapse-lang", lang);
  emit();
}
export const useLang = () => useSyncExternalStore(subscribe, readLang, (): Lang => "pt");

// Selection (kept in the URL hash so back/forward and deep links work) ----
function readSelection(): Selection {
  const raw = decodeURIComponent(window.location.hash.replace(/^#\/?/, ""));
  if (raw === "about") return "about";
  return window.location.hash.startsWith("#/") && isNodeId(raw) ? raw : "core";
}
function subscribeHash(l: () => void) {
  window.addEventListener("hashchange", l);
  return () => window.removeEventListener("hashchange", l);
}
export function select(selection: Selection) {
  if (selection !== "core") {
    window.location.hash = `/${selection}`;
    return;
  }
  window.history.pushState(null, "", window.location.pathname + window.location.search);
  window.dispatchEvent(new HashChangeEvent("hashchange"));
}
export const useSelection = () => useSyncExternalStore(subscribeHash, readSelection, (): Selection => "core");

// Media queries -----------------------------------------------------------
export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (l) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", l);
      return () => mq.removeEventListener("change", l);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}
export const useReducedMotion = () => useMediaQuery("(prefers-reduced-motion: reduce)");
export const useCompact = () => useMediaQuery("(max-width: 900px)");
