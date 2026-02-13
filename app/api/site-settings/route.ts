import { createClient } from "@supabase/supabase-js";
import { noStoreJson } from "@/lib/apiSecurity";
import { defaultSiteSettings, normalizeSiteSettings } from "@/lib/siteSettings";

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return noStoreJson({ settings: defaultSiteSettings });
  }

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  const { data, error } = await admin
    .from("admin_system_settings")
    .select("value")
    .eq("key", "site")
    .maybeSingle();

  if (error || !data?.value) {
    return noStoreJson({ settings: defaultSiteSettings });
  }

  const settings = normalizeSiteSettings(
    data.value as Partial<typeof defaultSiteSettings>
  );
  return noStoreJson({ settings });
}
