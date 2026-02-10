import { NextResponse } from "next/server";

const rateStore = new Map<string, { count: number; resetAt: number }>();

function clientIp(req: Request) {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]?.trim() || "unknown";
  return req.headers.get("x-real-ip") || "unknown";
}

export function rejectInvalidOrigin(req: Request): NextResponse | null {
  const origin = req.headers.get("origin");
  if (!origin) return null;

  const url = new URL(req.url);
  const expected = `${url.protocol}//${url.host}`;
  if (origin !== expected) {
    return NextResponse.json({ error: "Invalid origin." }, { status: 403 });
  }
  return null;
}

export function rejectNonJson(req: Request): NextResponse | null {
  const contentType = req.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return NextResponse.json(
      { error: "Content-Type must be application/json." },
      { status: 415 }
    );
  }
  return null;
}

export function rateLimit(
  req: Request,
  keyPrefix: string,
  maxRequests: number,
  windowMs: number
): NextResponse | null {
  const now = Date.now();
  const key = `${keyPrefix}:${clientIp(req)}`;
  const hit = rateStore.get(key);

  if (!hit || now > hit.resetAt) {
    rateStore.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }

  if (hit.count >= maxRequests) {
    return NextResponse.json(
      { error: "Too many requests. Try again later." },
      { status: 429 }
    );
  }

  hit.count += 1;
  rateStore.set(key, hit);
  return null;
}

export function noStoreJson(
  body: Record<string, unknown>,
  status = 200
): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}
