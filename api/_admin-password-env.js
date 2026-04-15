/**
 * Shared by Vercel serverless handlers. Reads runtime env (not Vite-inlined).
 * Prefer ADMIN_STAFF_PASSWORD on Vercel so the value never ships in static JS.
 */
export function getAdminPasswordFromEnv() {
  return String(
    process.env.ADMIN_STAFF_PASSWORD || process.env.VITE_ADMIN_PASSWORD || ""
  ).trim();
}

export function normalizePassword(value) {
  return String(value ?? "")
    .replace(/^\uFEFF/, "")
    .replace(/\u00a0/g, " ")
    .trim();
}
