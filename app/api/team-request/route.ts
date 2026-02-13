import { createClient } from "@supabase/supabase-js";
import {
  noStoreJson,
  rateLimit,
  rejectInvalidOrigin,
  rejectNonJson,
} from "@/lib/apiSecurity";
import { isValidGmail } from "@/lib/validators";

const MAX_NAME = 120;
const MAX_EMAIL = 200;
const MAX_ROLE = 120;
const MAX_EXPERIENCE = 200;
const MAX_MESSAGE = 3000;
const MAX_DISCORD = 120;

export async function POST(req: Request) {
  const originError = rejectInvalidOrigin(req);
  if (originError) return originError;

  const contentTypeError = rejectNonJson(req);
  if (contentTypeError) return contentTypeError;

  const rateError = rateLimit(req, "team-request-post", 10, 10 * 60 * 1000);
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

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return noStoreJson({ error: "Invalid JSON." }, 400);
  }

  const name = String(body?.name ?? "").trim();
  const email = String(body?.email ?? "").trim();
  const discord = String(body?.discord ?? "").trim();
  const role = String(body?.role ?? "").trim();
  const experience = String(body?.experience ?? "").trim();
  const message = String(body?.message ?? "").trim();
  const company = String(body?.company ?? "").trim();

  if (company) {
    return noStoreJson({ ok: true });
  }

  if (!name || !email) {
    return noStoreJson({ error: "Name and email are required." }, 400);
  }

  if (name.length > MAX_NAME) {
    return noStoreJson({ error: "Name is too long." }, 400);
  }
  if (email.length > MAX_EMAIL) {
    return noStoreJson({ error: "Email is too long." }, 400);
  }
  if (!isValidGmail(email)) {
    return noStoreJson({ error: "Please use a Gmail address." }, 400);
  }
  if (role.length > MAX_ROLE || experience.length > MAX_EXPERIENCE) {
    return noStoreJson({ error: "Role or experience is too long." }, 400);
  }
  if (message.length > MAX_MESSAGE) {
    return noStoreJson({ error: "Message is too long." }, 400);
  }
  if (discord.length > MAX_DISCORD) {
    return noStoreJson({ error: "Discord username is too long." }, 400);
  }

  const token = auth.slice(7);
  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  const { data: userData, error: userError } = await admin.auth.getUser(token);
  if (userError || !userData?.user) {
    return noStoreJson({ error: "Invalid session." }, 401);
  }

  const { data: link } = await admin
    .from("discord_links")
    .select("discord_user_id, discord_username")
    .eq("user_id", userData.user.id)
    .maybeSingle();

  const { error } = await admin.from("team_requests").insert({
    user_id: userData.user.id,
    name,
    email,
    discord_username: link?.discord_username || discord || null,
    discord_user_id: link?.discord_user_id || null,
    role: role || null,
    experience: experience || null,
    message: message || null,
    status: "pending",
  });

  if (error) {
    return noStoreJson(
      { error: error.message || "Failed to submit request." },
      500
    );
  }

  return noStoreJson({ ok: true });
}
