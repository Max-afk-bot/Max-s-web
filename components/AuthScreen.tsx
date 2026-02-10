"use client";

import { useState } from "react";
import Link from "next/link";
import Card from "@/components/Card";
import Button from "@/components/Button";
import { supabase } from "@/lib/supabaseClient";

type Mode = "login" | "signup";

const copy: Record<
  Mode,
  {
    kicker: string;
    title: string;
    subtitle: string;
    cta: string;
    footText: string;
    footLink: { href: string; label: string };
  }
> = {
  login: {
    kicker: "Welcome back",
    title: "Sign in to your dashboard",
    subtitle: "Google sign‑in only. New users are created automatically.",
    cta: "Continue with Google",
    footText: "New here?",
    footLink: { href: "/signup", label: "Create account" },
  },
  signup: {
    kicker: "Create account",
    title: "Join your cinematic workspace",
    subtitle: "One click with Google. Your profile is ready instantly.",
    cta: "Sign up with Google",
    footText: "Already have an account?",
    footLink: { href: "/login", label: "Sign in" },
  },
};

export default function AuthScreen({ mode }: { mode: Mode }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const meta = copy[mode];

  const signInWithGoogle = async () => {
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/` },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-48px)] overflow-hidden auth-stage">
      {/* Cinematic layers */}
      <div className="auth-sheen" aria-hidden="true" />
      <div className="auth-beam" aria-hidden="true" />
      <div className="auth-orb auth-orb-a" aria-hidden="true" />
      <div className="auth-orb auth-orb-b" aria-hidden="true" />
      <div className="auth-grid" aria-hidden="true" />
      <div className="filmgrain" aria-hidden="true" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-10 items-center max-w-6xl mx-auto px-6 py-16">
        {/* Left copy */}
        <div className="space-y-5 animate-pageIn">
          <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-zinc-400 auth-chip">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400/80" />
            {meta.kicker}
          </div>

          <h1 className="text-3xl md:text-4xl font-semibold leading-tight">
            {meta.title}
          </h1>

          <p className="text-sm text-zinc-400 max-w-xl">
            {meta.subtitle}
          </p>

          <div className="flex items-center gap-4 text-xs text-zinc-500">
            <span className="auth-divider" />
            Secure OAuth • No passwords stored
          </div>
        </div>

        {/* Right panel */}
        <Card className="auth-card p-7 animate-pageIn">
          <div className="space-y-2">
            <p className="text-xs text-zinc-500 uppercase tracking-wider">
              {mode === "login" ? "Sign in" : "Sign up"}
            </p>
            <h2 className="text-xl font-semibold">
              {mode === "login" ? "Access your space" : "Start your space"}
            </h2>
          </div>

          <div className="mt-6 space-y-3">
            <Button
              onClick={signInWithGoogle}
              disabled={loading}
              className="w-full py-3 rounded-xl auth-cta"
            >
              {loading ? "Connecting..." : meta.cta}
            </Button>
            {error ? <p className="text-xs text-red-400">{error}</p> : null}
          </div>

          <div className="mt-6 text-xs text-zinc-500">
            {meta.footText}{" "}
            <Link
              href={meta.footLink.href}
              className="text-zinc-200 hover:text-white transition"
            >
              {meta.footLink.label}
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
