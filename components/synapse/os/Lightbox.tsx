"use client";

import { useEffect, useRef, useState } from "react";
import type { Lang, Project } from "@/content/portfolio";
import type { UI } from "@/content/ui";

type Props = { project: Project; start: number; lang: Lang; t: UI; onClose: () => void };

export function Lightbox({ project, start, lang, t, onClose }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState(start);
  const count = project.images.length;
  const image = project.images[index];
  const step = (d: number) => setIndex((i) => (i + d + count) % count);

  useEffect(() => {
    const el = dialog.current;
    if (el && !el.open) el.showModal();
  }, []);

  return (
    <dialog
      ref={dialog}
      className="lightbox"
      aria-label={`${project.title}: ${t.gallery}`}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={(e) => {
        if (count < 2) return;
        if (e.key === "ArrowLeft") step(-1);
        if (e.key === "ArrowRight") step(1);
      }}
    >
      <div className="lightbox-box">
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
        <img src={image.src} alt={image.alt[lang]} />
        {count > 1 ? (
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
