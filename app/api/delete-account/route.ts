import { createClient } from "@supabase/supabase-js";
import { noStoreJson, rateLimit, rejectInvalidOrigin } from "@/lib/apiSecurity";

export async function POST(req: Request) {
  const originError = rejectInvalidOrigin(req);
  if (originError) return originError;

  const rateError = rateLimit(req, "delete-account-post", 3, 60 * 60 * 1000);
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

  const userId = userData.user.id;
  const { error: deleteError } = await admin.auth.admin.deleteUser(userId);
  if (deleteError) {
    return noStoreJson(
      { error: deleteError.message || "Delete failed." },
      500
    );
  }

  return noStoreJson({ ok: true });
}
