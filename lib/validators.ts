export function normalizeAge(value: string) {
  const digits = value.replace(/[^\d]/g, "");
  if (!digits) return "";
  const n = Math.round(Number(digits));
  if (Number.isNaN(n)) return "";
  const clamped = Math.min(120, Math.max(1, n));
  return String(clamped);
}

export function isValidGmail(email: string) {
  const trimmed = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return false;
  return trimmed.endsWith("@gmail.com");
}

export function normalizeUsername(value: string) {
  return value.replace(/[^a-zA-Z0-9_]/g, "");
}

export function isValidUsername(value: string) {
  return /^[a-zA-Z0-9_]{3,20}$/.test(value);
}
