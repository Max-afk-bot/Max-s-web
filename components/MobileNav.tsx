"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Home } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { NAV_SECTIONS } from "@/data/nav";
import { supabase } from "@/lib/supabaseClient";
import { isAdminEmail } from "@/lib/admin";
import {
  defaultSiteSettings,
  fetchSiteSettings,
  type SiteSettings,
} from "@/lib/siteSettings";

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

type MobileItem = {
  title: string;
  href: string;
  icon: LucideIcon;
};

export default function MobileNav() {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const [siteSettings, setSiteSettings] =
    useState<SiteSettings>(defaultSiteSettings);

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

  useEffect(() => {
    let mounted = true;
    fetchSiteSettings().then((settings) => {
      if (!mounted) return;
      setSiteSettings(settings);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const items: MobileItem[] = [
    { title: "Home", href: "/", icon: Home },
    ...NAV_SECTIONS.filter(
      (x) =>
        x.href !== "/" &&
        x.icon !== null &&
        (!x.adminOnly || isAdmin) &&
        (x.href !== "/about" || siteSettings.nav.show_about) &&
        (x.href !== "/gaming" || siteSettings.nav.show_gaming) &&
        (x.href !== "/projects" || siteSettings.nav.show_projects) &&
        (x.href !== "/contact" || siteSettings.nav.show_contact)
    ).map((x) => ({
      title: x.title,
      href: x.href,
      icon: x.icon as LucideIcon,
    })),
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 lg:hidden">
      <div
        className="border-t border-zinc-800 bg-zinc-950/85 backdrop-blur"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="px-3 py-2 flex gap-2 overflow-x-auto">
          {items.map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "flex flex-col items-center justify-center gap-1",
                  "min-w-[70px] px-2 py-2 rounded-xl",
                  "border border-zinc-800/70",
                  active
                    ? "bg-white/10 text-white"
                    : "text-zinc-400 hover:bg-white/5 hover:text-white",
                ].join(" ")}
              >
                <Icon size={18} className={active ? "opacity-100" : "opacity-80"} />
                <span className="text-[10px] uppercase tracking-wide">
                  {item.title}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
