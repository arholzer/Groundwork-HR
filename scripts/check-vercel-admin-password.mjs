/**
 * Runs before `vite build` on Vercel. If VITE_ADMIN_PASSWORD is missing at build time,
 * /admin.html cannot unlock — Vite inlines this value when the bundle is produced.
 */
const raw = process.env.VITE_ADMIN_PASSWORD;
const ok = typeof raw === "string" && raw.trim().length > 0;

if (ok) {
  console.log(
    "[build] VITE_ADMIN_PASSWORD is set — admin sign-in will be available in this deployment."
  );
} else {
  console.warn(
    "\n[build] VITE_ADMIN_PASSWORD is missing — /admin.html will stay disabled in production.\n" +
      "Fix on Vercel:\n" +
      "  • Open project **groundwork-hr** → Settings → Environment Variables → add **VITE_ADMIN_PASSWORD** for **Production**.\n" +
      "  • If you added it under **Team** settings instead, edit that variable and **Link to Projects** → select **groundwork-hr** (shared vars do nothing until linked).\n" +
      "  • Then run a **new** Production deployment (Redeploy / push).\n"
  );
}
