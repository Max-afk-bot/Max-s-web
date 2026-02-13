"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import { fetchProfile } from "@/lib/profile";

const PUBLIC_PATHS = ["/login", "/signup"];
const ONBOARDING_PATH = "/onboarding";

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [forceOnboarding, setForceOnboarding] = useState(false);
  const [suppressOnboardingRedirect, setSuppressOnboardingRedirect] =
    useState(false);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session ?? null);
      setReady(true);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const publicPath = useMemo(() => isPublicPath(pathname), [pathname]);

  useEffect(() => {
    if (!ready) return;

    const checkOnboarding = async () => {
      if (!session) {
        setNeedsOnboarding(false);
        setOnboardingChecked(true);
        return;
      }

      try {
        const profile = await fetchProfile(session.user.id);
        const done = profile?.onboarding_done ?? false;
        setNeedsOnboarding(!done);
        if (done) {
          if (typeof window !== "undefined") {
            window.sessionStorage.removeItem("suppress_onboarding");
          }
          setSuppressOnboardingRedirect(false);
        }
        setOnboardingChecked(true);
      } catch {
        setNeedsOnboarding(true);
        setOnboardingChecked(true);
      }
    };

    checkOnboarding();

    const onProfileUpdated = () => {
      checkOnboarding();
    };
    window.addEventListener("profile-updated", onProfileUpdated);

    const syncFlags = () => {
      if (typeof window === "undefined") return;
      setForceOnboarding(
        window.sessionStorage.getItem("force_onboarding") === "1"
      );
      setSuppressOnboardingRedirect(
        window.sessionStorage.getItem("suppress_onboarding") === "1"
      );
    };
    syncFlags();
    window.addEventListener("storage", syncFlags);

    const onFlagsUpdated = () => syncFlags();
    window.addEventListener("onboarding-flags", onFlagsUpdated);

    return () => window.removeEventListener("profile-updated", onProfileUpdated);
  }, [ready, session]);

  useEffect(() => {
    if (!ready || !onboardingChecked) return;

    if (!session && !publicPath) {
      router.replace("/login");
      return;
    }

    if (session && publicPath) {
      router.replace("/");
    }

    if (session && forceOnboarding && pathname !== ONBOARDING_PATH) {
      router.replace(ONBOARDING_PATH);
    }

    if (
      session &&
      needsOnboarding &&
      !suppressOnboardingRedirect &&
      pathname !== ONBOARDING_PATH
    ) {
      router.replace(ONBOARDING_PATH);
    }

    if (
      session &&
      !needsOnboarding &&
      !forceOnboarding &&
      pathname === ONBOARDING_PATH
    ) {
      router.replace("/");
    }
  }, [
    ready,
    onboardingChecked,
    session,
    publicPath,
    router,
    pathname,
    needsOnboarding,
    forceOnboarding,
    suppressOnboardingRedirect,
  ]);

  if (!ready) {
    return (
      <div className="h-screen w-full grid place-items-center text-sm text-zinc-500">
        Checking session...
      </div>
    );
  }

  if (!session && !publicPath) {
    return null;
  }

  if (
    session &&
    (needsOnboarding || forceOnboarding) &&
    pathname !== ONBOARDING_PATH &&
    !suppressOnboardingRedirect
  ) {
    return null;
  }

  return <>{children}</>;
}
