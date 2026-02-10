export const ADMIN_EMAIL = "manishacc2009@gmail.com";

export function isAdminEmail(email?: string | null) {
  if (!email) return false;
  return email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
}
