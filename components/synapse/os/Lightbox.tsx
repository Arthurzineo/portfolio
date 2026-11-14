"use client";

import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import type { Lang, Project } from "@/content/portfolio";
import type { UI } from "@/content/ui";
import { useReducedMotion } from "@/lib/stores";

const CircularGallery = lazy(() => import("@/components/reactbits/CircularGallery"));

type Props = { project: Project; start: number; lang: Lang; t: UI; onClose: () => void };

export function Lightbox({ project, start, lang, t, onClose }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState(start);
  const count = project.images.length;
  const image = project.images[index];
  const step = (d: number) => setIndex((i) => (i + d + count) % count);
  const reduced = useReducedMotion();
  // Several images open as a curved carousel that starts on the one that was clicked.
  const carousel = count > 1 && !reduced;
  const items = useMemo(
    () =>
      project.images.map((_, i) => {
        const img = project.images[(start + i) % count];
        return { image: img.src, text: project.title, description: img.alt[lang], alt: img.alt[lang] };
      }),
    [project, start, count, lang],
  );

  useEffect(() => {
    const el = dialog.current;
    if (el && !el.open) el.showModal();
  }, []);

  return (
    <dialog
      ref={dialog}
      className="lightbox"
      data-carousel={carousel}
      aria-label={`${project.title}: ${t.gallery}`}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={(e) => {
        if (count < 2 || carousel) return;
        if (e.key === "ArrowLeft") step(-1);
        if (e.key === "ArrowRight") step(1);
      }}
    >
      <div className="lightbox-box" data-carousel={carousel}>
        <header>
          <p>
            {project.title}
            {count > 1 ? <span className="quiet">{` ${index + 1} / ${count}`}</span> : null}
          </p>
          <button type="button" className="icon-button" onClick={onClose} aria-label={t.close} autoFocus>
            <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
              <path d="m4 4 8 8M12 4l-8 8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </header>
        {carousel ? (
          <>
            <div className="lightbox-carousel">
              <Suspense fallback={null}>
                <CircularGallery
                  items={items}
                  itemAspect={1.6}
                  itemSize={0.72}
                  bend={1.6}
                  gap={0.2}
                  wave={0.4}
                  fadeEdges={0}
                  shadow={0.35}
                  borderRadius={0.03}
                  textColor="#E8F0F5"
                  font="600 22px 'Archivo Variable', sans-serif"
                  showTitles={false}
                  onActiveChange={(i) => setIndex((start + i) % count)}
                />
              </Suspense>
            </div>
            <div className="lightbox-glass">
              <p className="lightbox-caption">{image.alt[lang]}</p>
              <p className="lightbox-hint">{t.carouselHint}</p>
            </div>
          </>
        ) : (
          <img src={image.src} alt={image.alt[lang]} />
        )}
        {count > 1 && !carousel ? (
          <footer>
            <button type="button" onClick={() => step(-1)}>
              {t.previous}
            </button>
            <button type="button" onClick={() => step(1)}>
              {t.next}
            </button>
          </footer>
        ) : null}
      </div>
    </dialog>
  );
}
