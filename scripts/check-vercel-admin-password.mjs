/**
 * Runs before `vite build`. Production admin sign-in uses Vercel `/api` routes and
 * **runtime** env (`ADMIN_STAFF_PASSWORD` or `VITE_ADMIN_PASSWORD`), so a missing
 * value here does not mean production admin is broken.
 */
const staff = process.env.ADMIN_STAFF_PASSWORD?.trim();
const vite = process.env.VITE_ADMIN_PASSWORD?.trim();

if (staff || vite) {
  console.log(
    "[build] Admin API will accept passwords from env at runtime (ADMIN_STAFF_PASSWORD or VITE_ADMIN_PASSWORD is set in this build environment)."
  );
} else {
  console.log(
    "[build] Admin gate: set ADMIN_STAFF_PASSWORD (recommended) or VITE_ADMIN_PASSWORD on the Vercel **groundwork-hr** project for Production — checked at **runtime** by /api (no client bundle embedding required)."
  );
}
