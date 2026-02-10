"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Card from "@/components/Card";
import { supabase } from "@/lib/supabaseClient";
import { ADMIN_EMAIL, isAdminEmail } from "@/lib/admin";

export default function AdminOnly({
  children,
}: {
  children: React.ReactNode;
}) {
  const [authorized, setAuthorized] = useState<"loading" | "no" | "yes">(
    "loading"
  );

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setAuthorized(isAdminEmail(data.session?.user?.email) ? "yes" : "no");
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthorized(isAdminEmail(session?.user?.email) ? "yes" : "no");
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  if (authorized === "loading") {
    return (
      <div className="h-[60vh] grid place-items-center text-sm text-zinc-500">
        Checking admin access...
      </div>
    );
  }

  if (authorized === "no") {
    return (
      <div className="space-y-6">
        <div>
          <div className="text-xs text-zinc-500 uppercase tracking-wide">Admin</div>
          <h1 className="text-2xl sm:text-3xl font-semibold mt-2">
            Access denied
          </h1>
          <p className="text-sm text-zinc-400 mt-2">
            This page is restricted to {ADMIN_EMAIL}.
          </p>
        </div>
        <Card className="p-6">
          <p className="text-sm text-zinc-400">
            Use your admin account to sign in. Then return to this page.
          </p>
          <div className="mt-4">
            <Link
              href="/"
              className="text-sm text-zinc-200 hover:text-white underline"
            >
              Back to dashboard
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
