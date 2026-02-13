"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import RouteEffects from "@/components/RouteEffects";
import SfxProvider from "@/components/SfxProvider";
import AuthGate from "@/components/AuthGate";
import MobileNav from "@/components/MobileNav";
import SiteFooter from "@/components/SiteFooter";
import PageTransition from "@/components/PageTransition";
import {
  defaultSiteSettings,
  fetchSiteSettings,
  type SiteSettings,
} from "@/lib/siteSettings";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [siteSettings, setSiteSettings] =
    useState<SiteSettings>(defaultSiteSettings);
  const pathname = usePathname();
  const isAuthRoute =
    pathname === "/login" ||
    pathname.startsWith("/login/") ||
    pathname === "/signup" ||
    pathname.startsWith("/signup/") ||
    pathname === "/onboarding" ||
    pathname.startsWith("/onboarding/");

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

  return (
    <SfxProvider>
      <AuthGate>
        <div className="relative flex h-screen overflow-hidden">
          {/* Background + page effects */}
          <RouteEffects />

          {/* Sidebar */}
          {!isAuthRoute ? (
            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          ) : null}

          {/* Main */}
          <div className="flex-1 overflow-hidden relative z-10">
            {/* Scroll container */}
            <div className="h-full overflow-y-auto">
              {/* Sticky topbar inside the SAME scroll area */}
              {!isAuthRoute ? (
                <div className="sticky top-0 z-50">
                  <Topbar onMenu={() => setSidebarOpen(true)} />
                </div>
              ) : null}

              {!isAuthRoute && siteSettings.maintenance.enabled ? (
                <div className="mx-4 sm:mx-6 mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-200">
                  {siteSettings.maintenance.message}
                </div>
              ) : null}

              {/* Page content */}
              <div className="p-4 sm:p-6 pb-20 lg:pb-6">
                <div className="max-w-6xl mx-auto">
                  <PageTransition>{children}</PageTransition>
                  {!isAuthRoute ? <SiteFooter /> : null}
                </div>
              </div>
            </div>
          </div>
        </div>
        {!isAuthRoute ? <MobileNav /> : null}
      </AuthGate>
    </SfxProvider>
  );
}
