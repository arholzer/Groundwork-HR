import { getAdminPasswordFromEnv } from "./_admin-password-env.js";

export default {
  /** @param {Request} request */
  async fetch(request) {
    if (request.method !== "GET") {
      return new Response("Method Not Allowed", {
        status: 405,
        headers: { Allow: "GET" },
      });
    }
    const configured = getAdminPasswordFromEnv().length > 0;
    return Response.json({ configured });
  },
};
