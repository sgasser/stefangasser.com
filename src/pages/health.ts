import type { APIRoute } from "astro";

export const GET: APIRoute = () => {
  return new Response("ok", {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  });
};
