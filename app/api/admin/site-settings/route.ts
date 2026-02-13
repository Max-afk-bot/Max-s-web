import { createClient } from "@supabase/supabase-js";
import { ADMIN_EMAIL } from "@/lib/admin";
import {
  noStoreJson,
  rateLimit,
  rejectInvalidOrigin,
  rejectNonJson,
} from "@/lib/apiSecurity";
import {
  defaultSiteSettings,
  normalizeSiteSettings,
  type SiteSettings,
} from "@/lib/siteSettings";

type SettingsBody = {
  settings?: unknown;
};

async function requireAdmin(req: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return {
      ok: false as const,
      error: noStoreJson(
        { error: "Missing SUPABASE_SERVICE_ROLE_KEY or SUPABASE URL." },
        500
      ),
    };
  }

  const auth = req.headers.get("authorization");
  if (!auth || !auth.startsWith("Bearer ")) {
    return {
      ok: false as const,
      error: noStoreJson({ error: "Missing auth token." }, 401),
    };
  }
  const token = auth.slice(7);
  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });
  const { data: userData, error: userError } = await admin.auth.getUser(token);
  if (userError || !userData?.user) {
    return {
      ok: false as const,
      error: noStoreJson({ error: "Invalid session." }, 401),
    };
  }

  const email = userData.user.email?.toLowerCase() || "";
  if (email !== ADMIN_EMAIL.toLowerCase()) {
    return { ok: false as const, error: noStoreJson({ error: "Forbidden." }, 403) };
  }

  return { ok: true as const, admin };
}

export async function GET(req: Request) {
  const rateError = rateLimit(req, "admin-site-settings-get", 120, 10 * 60 * 1000);
  if (rateError) return rateError;

  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.error;

  const { data, error } = await auth.admin
    .from("admin_system_settings")
    .select("value")
    .eq("key", "site")
    .maybeSingle();

  if (error || !data?.value) {
    return noStoreJson({ settings: defaultSiteSettings });
  }

  return noStoreJson({
    settings: normalizeSiteSettings(data.value as Partial<SiteSettings>),
  });
}

export async function POST(req: Request) {
  const originError = rejectInvalidOrigin(req);
  if (originError) return originError;

  const contentTypeError = rejectNonJson(req);
  if (contentTypeError) return contentTypeError;

  const rateError = rateLimit(req, "admin-site-settings-post", 30, 10 * 60 * 1000);
  if (rateError) return rateError;

  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.error;

  let body: SettingsBody;
  try {
    body = (await req.json()) as SettingsBody;
  } catch {
    return noStoreJson({ error: "Invalid JSON." }, 400);
  }

  const raw = (body.settings ?? {}) as Partial<SiteSettings>;
  const normalized = normalizeSiteSettings(raw);
  normalized.maintenance.message = normalized.maintenance.message.slice(0, 200);

  const { error } = await auth.admin.from("admin_system_settings").upsert(
    {
      key: "site",
      value: normalized,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key" }
  );

  if (error) {
    if (error.code === "42P01") {
      return noStoreJson(
        {
          error:
            "Table admin_system_settings is missing. Run SQL from data/admin_system_settings.sql.",
        },
        500
      );
    }
    return noStoreJson({ error: error.message || "Failed to save settings." }, 500);
  }

  return noStoreJson({ ok: true, settings: normalized });
}
