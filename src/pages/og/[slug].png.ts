import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { ImageResponse } from "@vercel/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

async function loadImage(): Promise<string> {
  const imagePath = join(
    process.cwd(),
    "dist",
    "client",
    "images",
    "stefan.jpg"
  );
  try {
    const imageBuffer = await readFile(imagePath);
    return `data:image/jpeg;base64,${imageBuffer.toString("base64")}`;
  } catch {
    const altPath = join(process.cwd(), "public", "images", "stefan.jpg");
    const imageBuffer = await readFile(altPath);
    return `data:image/jpeg;base64,${imageBuffer.toString("base64")}`;
  }
}

export const GET: APIRoute = async ({ params }) => {
  const { slug } = params;

  if (!slug) {
    return new Response("Not found", { status: 404 });
  }

  const posts = await getCollection("blog");
  const post = posts.find((p) => p.slug === slug);

  if (!post) {
    return new Response("Post not found", { status: 404 });
  }

  const title = post.data.title;
  const pubDate = new Date(post.data.pubDate).toLocaleDateString("de-DE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const imageData = await loadImage();

  const html = {
    type: "div",
    props: {
      tw: "w-full h-full flex bg-white relative",
      style: { display: "flex" },
      children: [
        // Content
        {
          type: "div",
          props: {
            tw: "flex-1 pl-16 pr-4",
            style: {
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            },
            children: [
              // Blog label
              {
                type: "div",
                props: {
                  tw: "text-3xl font-bold text-orange-700",
                  children: "Blog",
                },
              },
              // Title
              {
                type: "div",
                props: {
                  tw: "mt-6 text-6xl font-bold text-gray-800 leading-tight tracking-tight max-w-2xl",
                  children: title,
                },
              },
              // Date
              {
                type: "div",
                props: {
                  tw: "mt-8 text-3xl text-gray-600",
                  children: pubDate,
                },
              },
            ],
          },
        },
        // Photo
        {
          type: "div",
          props: {
            tw: "flex items-center pr-12",
            style: { display: "flex" },
            children: {
              type: "div",
              props: {
                style: { display: "flex", transform: "rotate(3deg)" },
                children: {
                  type: "img",
                  props: {
                    src: imageData,
                    width: 320,
                    height: 320,
                    tw: "rounded-2xl",
                    style: {
                      objectFit: "cover",
                      boxShadow:
                        "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)",
                    },
                  },
                },
              },
            },
          },
        },
        // Domain
        {
          type: "div",
          props: {
            tw: "absolute bottom-8 right-16 text-2xl font-medium text-gray-500",
            children: "stefangasser.com",
          },
        },
      ],
    },
  };

  return new ImageResponse(html, {
    width: 1200,
    height: 630,
  });
};
