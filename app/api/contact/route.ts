import { createClient } from "@supabase/supabase-js";
import {
  noStoreJson,
  rateLimit,
  rejectInvalidOrigin,
  rejectNonJson,
} from "@/lib/apiSecurity";

const MAX_NAME = 120;
const MAX_EMAIL = 200;
const MAX_SUBJECT = 200;
const MAX_TOPIC = 60;
const MAX_MESSAGE = 3000;

export async function POST(req: Request) {
  const originError = rejectInvalidOrigin(req);
  if (originError) return originError;

  const contentTypeError = rejectNonJson(req);
  if (contentTypeError) return contentTypeError;

  const rateError = rateLimit(req, "contact-post", 15, 10 * 60 * 1000);
  if (rateError) return rateError;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return noStoreJson(
      { error: "Missing SUPABASE_SERVICE_ROLE_KEY or SUPABASE URL." },
      500
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return noStoreJson({ error: "Invalid JSON." }, 400);
  }

  const name = String(body?.name ?? "").trim();
  const email = String(body?.email ?? "").trim();
  const subject = String(body?.subject ?? "").trim();
  const topic = String(body?.topic ?? "").trim();
  const message = String(body?.message ?? "").trim();
  const company = String(body?.company ?? "").trim();

  if (company) {
    return noStoreJson({ ok: true });
  }

  if (!name || !email || !message) {
    return noStoreJson(
      { error: "Name, email, and message are required." },
      400
    );
  }

  if (name.length > MAX_NAME) {
    return noStoreJson({ error: "Name is too long." }, 400);
  }
  if (email.length > MAX_EMAIL) {
    return noStoreJson({ error: "Email is too long." }, 400);
  }
  if (subject.length > MAX_SUBJECT) {
    return noStoreJson({ error: "Subject is too long." }, 400);
  }
  if (topic.length > MAX_TOPIC) {
    return noStoreJson({ error: "Topic is too long." }, 400);
  }
  if (message.length > MAX_MESSAGE) {
    return noStoreJson({ error: "Message is too long." }, 400);
  }

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!emailOk) {
    return noStoreJson({ error: "Email looks invalid." }, 400);
  }

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  const { error } = await admin.from("contact_messages").insert({
    name,
    email,
    subject: subject || null,
    topic: topic || null,
    message,
  });

  if (error) {
    return noStoreJson(
      { error: error.message || "Failed to send message." },
      500
    );
  }

  return noStoreJson({ ok: true });
}
