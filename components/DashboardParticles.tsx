"use client";

import { useEffect, useRef } from "react";

type Dot = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  a: number;
};

type Variant = "default" | "dashboard" | "youtube";

export default function DashboardParticles({
  className = "",
  variant = "default",
}: {
  className?: string;
  variant?: Variant;
}) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReduce =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isCoarse =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(pointer: coarse)").matches;
    const isLarge =
      typeof window !== "undefined" &&
      window.innerWidth >= 1024;

    let raf = 0;
    let w = 0;
    let h = 0;
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

    const dots: Dot[] = [];
    const baseCount = variant === "dashboard" ? 120 : variant === "youtube" ? 80 : 60;
    const COUNT = isCoarse
      ? Math.max(18, Math.round(baseCount * 0.35))
      : isLarge
      ? Math.round(baseCount * 1.5)
      : baseCount;
    const speedScale = isCoarse ? 0.4 : isLarge ? 1.2 : 1;

    const rand = (min: number, max: number) => min + Math.random() * (max - min);

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      w = parent.clientWidth;
      h = parent.clientHeight;

      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const seed = () => {
      dots.length = 0;
      for (let i = 0; i < COUNT; i++) {
        const baseR = variant === "dashboard" ? 3.1 : 2.6;
        const maxR = isLarge ? baseR + 0.6 : baseR;
        const maxA = variant === "dashboard"
          ? isLarge
            ? 0.35
            : 0.28
          : isLarge
          ? 0.26
          : 0.22;
        dots.push({
          x: rand(0, w),
          y: rand(0, h),
          vx: rand(-0.16, 0.18) * speedScale,
          vy: rand(-0.12, 0.16) * speedScale,
          r: rand(1.0, maxR),
          a: rand(isCoarse ? 0.05 : 0.08, maxA),
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      // soft color haze (not the gaming style)
      const g = ctx.createRadialGradient(
        w * 0.5,
        h * 0.2,
        0,
        w * 0.5,
        h * 0.2,
        Math.max(w, h)
      );
      if (variant === "dashboard") {
        g.addColorStop(0, "rgba(120,255,220,0.10)");
        g.addColorStop(0.45, "rgba(90,120,255,0.08)");
      } else if (variant === "youtube") {
        g.addColorStop(0, "rgba(94,234,212,0.12)");
        g.addColorStop(0.45, "rgba(14,165,233,0.08)");
      } else {
        g.addColorStop(0, "rgba(80,180,255,0.08)");
        g.addColorStop(0.45, "rgba(120,90,255,0.05)");
      }
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      for (const d of dots) {
        d.x += d.vx;
        d.y += d.vy;

        if (d.x < -10) d.x = w + 10;
        if (d.x > w + 10) d.x = -10;
        if (d.y < -10) d.y = h + 10;
        if (d.y > h + 10) d.y = -10;

        const base =
          variant === "dashboard"
            ? "180, 255, 240"
            : variant === "youtube"
            ? "160, 240, 235"
            : "180, 220, 255";

        // soft motion streak for dashboard only
        if (variant === "dashboard") {
          ctx.strokeStyle = `rgba(${base}, ${d.a * 0.4})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(d.x, d.y);
          ctx.lineTo(d.x - d.vx * 14, d.y - d.vy * 14);
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${base}, ${d.a})`;
        ctx.fill();
      }
    };

    const step = () => {
      draw();
      raf = requestAnimationFrame(step);
    };

    const allowAnim = !prefersReduce && !isCoarse;

    resize();
    seed();
    draw();

    if (allowAnim) {
      step();
    }

    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
    };
  }, [variant]);

  return (
    <canvas
      ref={ref}
      className={["absolute inset-0 -z-10 opacity-70", className].join(" ")}
      aria-hidden="true"
    />
  );
}
