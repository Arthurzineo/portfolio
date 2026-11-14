"use client";

/**
 * Columns of falling characters in the empty side gutters of Focus Mode.
 * Original implementation of the generic "code rain" effect on a 2D canvas (no WebGL, no dependency):
 * each column owns one drop with a bright head and a fading trail, and the glyphs under the trail
 * mutate now and then. It only draws where there is no content, and it is purely decorative.
 */
import { useEffect, useRef } from "react";

const GLYPHS = "0123456789ABCDEF<>/{}[]()$#:;=+-_|&%";
const CELL = 18;
const FONT = '13px ui-monospace, "SF Mono", Menlo, Consolas, monospace';
const FRAME_MS = 1000 / 30;
/** Content column width in Focus Mode; must match `.focus` in globals.css. */
const CONTENT = 1120;
const MIN_GUTTER = 72;

type Column = { x: number; head: number; speed: number; length: number; glyphs: string[] };

const pick = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];

export default function SideRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let columns: Column[] = [];
    let rows = 0;
    let width = 0;
    let height = 0;
    let frame = 0;
    let last = 0;

    const layout = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      rows = Math.ceil(height / CELL) + 1;
      const gutter = (width - CONTENT) / 2 - 28;
      columns = [];
      if (gutter < MIN_GUTTER) return;
      const perSide = Math.floor(gutter / CELL);
      for (let side = 0; side < 2; side += 1) {
        for (let i = 0; i < perSide; i += 1) {
          // Skip some columns so the rain reads as sparse streams, not a wall.
          if (Math.random() < 0.2) continue;
          const x = side === 0 ? 10 + i * CELL : width - 10 - (i + 1) * CELL;
          columns.push({
            x,
            head: Math.random() * rows * 1.5 - rows * 0.5,
            speed: 5 + Math.random() * 11,
            length: 7 + Math.floor(Math.random() * 16),
            glyphs: Array.from({ length: rows }, pick),
          });
        }
      }
    };

    const draw = (now: number) => {
      frame = requestAnimationFrame(draw);
      if (now - last < FRAME_MS) return;
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      ctx.clearRect(0, 0, width, height);
      ctx.font = FONT;
      ctx.textBaseline = "top";
      for (const col of columns) {
        col.head += col.speed * dt;
        if (col.head - col.length > rows) {
          col.head = -Math.random() * 12;
          col.speed = 5 + Math.random() * 11;
          col.length = 7 + Math.floor(Math.random() * 16);
        }
        if (Math.random() < 0.06) col.glyphs[Math.floor(Math.random() * rows)] = pick();
        const headRow = Math.floor(col.head);
        for (let k = 0; k < col.length; k += 1) {
          const row = headRow - k;
          if (row < 0 || row >= rows) continue;
          const t = k / col.length;
          if (k === 0) ctx.fillStyle = "rgba(232, 240, 245, 0.95)";
          else if (t < 0.45) ctx.fillStyle = `rgba(100, 228, 220, ${(0.75 * (1 - t)).toFixed(3)})`;
          else ctx.fillStyle = `rgba(125, 107, 241, ${(0.6 * (1 - t)).toFixed(3)})`;
          ctx.fillText(col.glyphs[row], col.x, row * CELL);
        }
      }
    };

    layout();
    window.addEventListener("resize", layout);
    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", layout);
    };
  }, []);

  return <canvas ref={canvasRef} className="side-rain" aria-hidden="true" />;
}
