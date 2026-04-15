import {
  getAdminPasswordFromEnv,
  normalizePassword,
} from "./_admin-password-env.js";

export default {
  /** @param {Request} request */
  async fetch(request) {
    if (request.method !== "POST") {
      return new Response("Method Not Allowed", {
        status: 405,
        headers: { Allow: "POST" },
      });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return Response.json({ ok: false }, { status: 400 });
    }

    const expected = getAdminPasswordFromEnv();
    if (!expected) {
      return Response.json(
        { ok: false, error: "not_configured" },
        { status: 503 }
      );
    }

    const typed = normalizePassword(body?.password);
    if (typed && typed === normalizePassword(expected)) {
      return Response.json({ ok: true });
    }
    return Response.json({ ok: false }, { status: 401 });
  },
};
