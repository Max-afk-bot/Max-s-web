"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";

type SfxType = "click" | "nav";

type SfxContextValue = {
  play: (type: SfxType) => void;
  enabled: boolean;
};

const SfxContext = createContext<SfxContextValue | null>(null);

function createBeep(
  ctx: AudioContext,
  {
    freq,
    duration,
    type = "triangle",
    gain = 0.08,
  }: { freq: number; duration: number; type?: OscillatorType; gain?: number }
) {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();

  osc.type = type;
  osc.frequency.value = freq;

  const now = ctx.currentTime;
  g.gain.setValueAtTime(0.0001, now);
  g.gain.exponentialRampToValueAtTime(gain, now + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  osc.connect(g);
  g.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + duration + 0.02);
}

export function useSfx() {
  const ctx = useContext(SfxContext);
  if (!ctx) throw new Error("useSfx must be used within SfxProvider");
  return ctx;
}

export default function SfxProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState(false);
  const audioRef = useRef<AudioContext | null>(null);
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);

  const ensureAudio = useCallback(() => {
    if (audioRef.current) return audioRef.current;
    const ctx = new AudioContext();
    audioRef.current = ctx;
    return ctx;
  }, []);

  const play = useCallback((type: SfxType) => {
    if (!enabled) return;
    const ctx = ensureAudio();
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => undefined);
    }

    if (type === "click") {
      createBeep(ctx, { freq: 820, duration: 0.06, type: "triangle", gain: 0.06 });
      return;
    }

    // "nav"
    createBeep(ctx, { freq: 640, duration: 0.07, type: "sine", gain: 0.07 });
    createBeep(ctx, { freq: 520, duration: 0.07, type: "sine", gain: 0.06 });
  }, [enabled, ensureAudio]);

  useEffect(() => {
    const unlock = () => {
      setEnabled(true);
      ensureAudio();
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };

    window.addEventListener("pointerdown", unlock);
    window.addEventListener("keydown", unlock);
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, [ensureAudio]);

  useEffect(() => {
    if (!enabled) {
      lastPath.current = pathname;
      return;
    }

    if (lastPath.current && lastPath.current !== pathname) {
      play("nav");
    }
    lastPath.current = pathname;
  }, [pathname, enabled, play]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (!enabled) return;
      const target = event.target as HTMLElement | null;
      if (!target) return;
      if (target.closest("[data-sfx='mute']")) return;
      if (target.closest("button, a, [role='button']")) {
        play("click");
      }
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [enabled, play]);

  const value = useMemo(() => ({ play, enabled }), [play, enabled]);

  return <SfxContext.Provider value={value}>{children}</SfxContext.Provider>;
}
