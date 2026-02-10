"use client";

import "./globals.css";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import RouteEffects from "@/components/RouteEffects";
import SfxProvider from "@/components/SfxProvider";
import AuthGate from "@/components/AuthGate";
import MobileNav from "@/components/MobileNav";
import SiteFooter from "@/components/SiteFooter";
import PageTransition from "@/components/PageTransition";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const isAuthRoute =
    pathname === "/login" ||
    pathname.startsWith("/login/") ||
    pathname === "/signup" ||
    pathname.startsWith("/signup/") ||
    pathname === "/onboarding" ||
    pathname.startsWith("/onboarding/");

  return (
    <html lang="en">
      <body className="text-zinc-100 bg-zinc-950">
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
      </body>
    </html>
  );
}
