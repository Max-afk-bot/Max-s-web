import { createClient } from "@supabase/supabase-js";
import { ADMIN_EMAIL } from "@/lib/admin";
import { noStoreJson, rateLimit } from "@/lib/apiSecurity";

export async function GET(req: Request) {
  const rateError = rateLimit(req, "admin-contact-get", 120, 10 * 60 * 1000);
  if (rateError) return rateError;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return noStoreJson(
      { error: "Missing SUPABASE_SERVICE_ROLE_KEY or SUPABASE URL." },
      500
    );
  }

  const auth = req.headers.get("authorization");
  if (!auth || !auth.startsWith("Bearer ")) {
    return noStoreJson({ error: "Missing auth token." }, 401);
  }

  const token = auth.slice(7);
  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  const { data: userData, error: userError } = await admin.auth.getUser(token);
  if (userError || !userData?.user) {
    return noStoreJson({ error: "Invalid session." }, 401);
  }

  const email = userData.user.email?.toLowerCase() || "";
  if (email !== ADMIN_EMAIL.toLowerCase()) {
    return noStoreJson({ error: "Forbidden." }, 403);
  }

  const { data, error } = await admin
    .from("contact_messages")
    .select("id, name, email, subject, topic, message, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    return noStoreJson(
      { error: error.message || "Failed to load messages." },
      500
    );
  }

  return noStoreJson({ messages: data ?? [] });
}
