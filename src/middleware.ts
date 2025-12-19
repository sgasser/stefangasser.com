import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware(async (context, next) => {
  const start = Date.now();
  const response = await next();

  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  const path = context.url.pathname;
  if (path !== "/health") {
    console.log(
      JSON.stringify({
        ts: new Date().toISOString(),
        method: context.request.method,
        path,
        status: response.status,
        duration_ms: Date.now() - start,
      })
    );
  }

  return response;
});
