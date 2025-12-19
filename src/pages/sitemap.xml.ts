import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

export const prerender = false;

const staticPages = [
  { path: "", priority: "1.0", changefreq: "weekly" },
  { path: "blog", priority: "0.8", changefreq: "weekly" },
  { path: "leistungen", priority: "0.8", changefreq: "monthly" },
  { path: "ueber-mich", priority: "0.8", changefreq: "monthly" },
  { path: "impressum", priority: "0.3", changefreq: "yearly" },
  { path: "datenschutz", priority: "0.3", changefreq: "yearly" },
];

export const GET: APIRoute = async ({ site }) => {
  const baseUrl = (site?.toString() ?? "https://stefangasser.com").replace(
    /\/$/,
    ""
  );
  const now = new Date();

  const blogPosts = (await getCollection("blog"))
    .filter((post) => post.data.pubDate <= now)
    .map((post) => ({
      path: `blog/${post.slug}`,
      priority: "0.7",
      changefreq: "monthly",
      lastmod: post.data.pubDate.toISOString().split("T")[0],
    }));

  const pages = [...staticPages, ...blogPosts];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map(
    (page) => `  <url>
    <loc>${baseUrl}${page.path ? `/${page.path}` : ""}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>${"lastmod" in page ? `\n    <lastmod>${page.lastmod}</lastmod>` : ""}
  </url>`
  )
  .join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
