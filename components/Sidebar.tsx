"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV_SECTIONS } from "@/data/nav";
import { supabase } from "@/lib/supabaseClient";
import { isAdminEmail } from "@/lib/admin";

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

export default function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  const [pinned, setPinned] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setIsAdmin(isAdminEmail(data.session?.user?.email));
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAdmin(isAdminEmail(session?.user?.email));
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const expanded = pinned || hovered;

  const items = NAV_SECTIONS.filter(
    (x) => x.href !== "/" && (!x.adminOnly || isAdmin)
  );

  const accentClass = (vibe: string) => {
    if (vibe === "fire") return "accent-fire";
    if (vibe === "neon") return "accent-neon";
    if (vibe === "cyber") return "accent-cyber";
    return "";
  };

  const glowClass = (vibe: string) => {
    if (vibe === "fire") return "glow vibe-fire";
    if (vibe === "neon") return "glow vibe-neon";
    if (vibe === "cyber") return "glow vibe-cyber";
    return "";
  };

  return (
    <>
      {/* Mobile backdrop */}
      <div
        onClick={onClose}
        className={[
          "fixed inset-0 z-40 bg-black/50 lg:hidden transition",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        ].join(" ")}
      />

      <aside
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={[
          "fixed top-0 left-0 z-50 h-full border-r border-zinc-800 bg-zinc-950/80 backdrop-blur",
          "w-[82vw] max-w-xs lg:w-auto",
          "transition-transform lg:translate-x-0 lg:static lg:z-auto",
          open ? "translate-x-0" : "-translate-x-full",
          expanded ? "lg:w-72" : "lg:w-[76px]",
        ].join(" ")}
      >
        {/* Header */}
        <div className="h-16 px-3 flex items-center justify-between border-b border-zinc-800">
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-9 w-9 rounded-xl border border-zinc-800 bg-zinc-900/20 grid place-items-center font-semibold">
              M
            </div>

            {expanded && (
              <div className="min-w-0">
                <div className="font-semibold leading-5 truncate">Max Dashboard</div>
                <div className="text-xs text-zinc-500">v1</div>
              </div>
            )}
          </div>

          <button
            onClick={() => setPinned((v) => !v)}
            className="hidden lg:inline-flex rounded-lg border border-zinc-800 px-2 py-1 text-xs hover:bg-zinc-900"
            title={pinned ? "Unpin sidebar" : "Pin sidebar"}
            aria-label={pinned ? "Unpin sidebar" : "Pin sidebar"}
          >
            {pinned ? "📌" : "📍"}
          </button>

          <button
            onClick={onClose}
            className="lg:hidden rounded-lg border border-zinc-800 px-3 py-2 text-sm hover:bg-zinc-900"
          >
            Close
          </button>
        </div>

        {/* Nav */}
        <nav className="p-2 space-y-1">
          {items.map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;
            const isGaming = item.href === "/gaming";

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={[
                  "group nav-accent rounded-2xl transition",
                  accentClass(item.vibe),
                ].join(" ")}
              >
                <div
                  className={[
                    "group relative flex items-center gap-3 rounded-2xl transition",
                    expanded ? "px-3 py-2.5" : "px-2 py-2.5 justify-center",
                    active
                      ? "bg-white/10 text-white ring-1 ring-white/10"
                      : "text-zinc-400 hover:bg-white/5 hover:text-white",
                    glowClass(item.vibe),
                    isGaming && active ? "gaming-active" : "",
                  ].join(" ")}
                >
                  {Icon ? (
                    <div
                      className={[
                        "h-10 w-10 rounded-2xl border grid place-items-center flex-shrink-0 transition",
                        "border-zinc-800 bg-zinc-900/10 group-hover:bg-zinc-900/30",
                        "icon-pop",
                        isGaming ? "gaming-ignite" : "",
                      ].join(" ")}
                    >
                      <Icon size={18} className={active ? "opacity-100" : "opacity-80"} />
                    </div>
                  ) : null}

                  {expanded && (
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium leading-5 truncate">
                        {item.title}
                      </div>
                      <div className="text-xs opacity-60 leading-4 truncate">
                        {item.desc}
                      </div>
                    </div>
                  )}

                  {!expanded && (
                    <div
                      className={[
                        "pointer-events-none absolute left-[88px] top-1/2 -translate-y-1/2",
                        "rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-200",
                        "opacity-0 group-hover:opacity-100 transition shadow-lg",
                      ].join(" ")}
                    >
                      <div className="font-medium">{item.title}</div>
                      <div className="text-zinc-400 mt-0.5">{item.desc}</div>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto p-3 border-t border-zinc-800">
          {expanded ? (
            <div className="text-xs text-zinc-500">
              Build mode: <span className="text-zinc-300">Focus</span>
              <span className="float-right">{pinned ? "Pinned" : "Hover"}</span>
            </div>
          ) : (
            <div className="text-[10px] text-zinc-500 text-center">Focus</div>
          )}
        </div>
      </aside>
    </>
  );
}
