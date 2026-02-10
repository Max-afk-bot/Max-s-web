import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import {
  buildDiscordState,
  discordAuthUrl,
  hasDiscordOAuthEnv,
} from "@/lib/discordServer";
import { noStoreJson, rateLimit, rejectInvalidOrigin } from "@/lib/apiSecurity";

export async function POST(req: Request) {
  const originError = rejectInvalidOrigin(req);
  if (originError) return originError;

  const rateError = rateLimit(req, "discord-connect-post", 20, 10 * 60 * 1000);
  if (rateError) return rateError;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return noStoreJson(
      { error: "Missing SUPABASE_SERVICE_ROLE_KEY or SUPABASE URL." },
      500
    );
  }
  if (!hasDiscordOAuthEnv()) {
    return noStoreJson(
      { error: "Discord OAuth env is incomplete on server." },
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

  const nonce = crypto.randomBytes(12).toString("hex");
  const state = buildDiscordState({ userId: userData.user.id, nonce });

  return noStoreJson({ url: discordAuthUrl(state) });
}
