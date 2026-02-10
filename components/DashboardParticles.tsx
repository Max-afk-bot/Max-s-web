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

type Variant = "default" | "dashboard";

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

    let raf = 0;
    let w = 0;
    let h = 0;
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

    const dots: Dot[] = [];
    const COUNT = variant === "dashboard" ? 120 : 60;

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
        dots.push({
          x: rand(0, w),
          y: rand(0, h),
          vx: rand(-0.16, 0.18),
          vy: rand(-0.12, 0.16),
          r: rand(1.2, variant === "dashboard" ? 3.1 : 2.6),
          a: rand(0.08, variant === "dashboard" ? 0.28 : 0.22),
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

        const base = variant === "dashboard" ? "180, 255, 240" : "180, 220, 255";

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

    resize();
    seed();
    draw();

    if (!prefersReduce) {
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
