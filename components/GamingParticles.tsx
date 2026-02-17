"use client";

import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  a: number;
};

export default function GamingParticles() {
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

    const particles: Particle[] = [];
    const COUNT = isCoarse ? 28 : isLarge ? 110 : 80;
    const speedScale = isCoarse ? 0.4 : isLarge ? 1.15 : 1;
    const connectLines = !isCoarse;
    const maxDist = isLarge ? 130 : 110;

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

    const rand = (min: number, max: number) => min + Math.random() * (max - min);

    const seed = () => {
      particles.length = 0;
      for (let i = 0; i < COUNT; i++) {
        particles.push({
          x: rand(0, w),
          y: rand(0, h),
          vx: rand(-0.25, 0.25) * speedScale,
          vy: rand(-0.35, 0.35) * speedScale,
          r: rand(0.8, isLarge ? 2.6 : 2.2),
          a: rand(isCoarse ? 0.08 : 0.15, isLarge ? 0.6 : 0.55),
        });
      }
    };

    const step = () => {
      ctx.clearRect(0, 0, w, h);

      // soft gradient fog behind particles (gaming vibe)
      const g = ctx.createRadialGradient(w * 0.35, h * 0.25, 0, w * 0.35, h * 0.25, Math.max(w, h));
      g.addColorStop(0, "rgba(255,120,40,0.10)");
      g.addColorStop(0.5, "rgba(255,40,120,0.04)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      // update particles
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        // wrap around edges
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 180, 60, ${p.a})`;
        ctx.fill();
      }

      // connect nearby particles (subtle)
      if (connectLines) {
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const a = particles[i];
            const b = particles[j];
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < maxDist) {
              const alpha = (1 - dist / maxDist) * (isLarge ? 0.16 : 0.1);
              ctx.strokeStyle = `rgba(255, 140, 60, ${alpha})`;
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.stroke();
            }
          }
        }
      }

      raf = requestAnimationFrame(step);
    };

    resize();
    seed();
    const allowAnim = !prefersReduce && !isCoarse;
    if (allowAnim) {
      step();
    } else {
      step();
      cancelAnimationFrame(raf);
    }

    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className="absolute inset-0 -z-10 opacity-80"
      aria-hidden="true"
    />
  );
}
