import type { APIRoute } from "astro";
import { ImageResponse } from "@vercel/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

async function loadImage(): Promise<string> {
  const paths = [
    join(process.cwd(), "dist", "client", "images", "stefan.jpg"),
    join(process.cwd(), "public", "images", "stefan.jpg"),
  ];
  for (const p of paths) {
    try {
      const buf = await readFile(p);
      return `data:image/jpeg;base64,${buf.toString("base64")}`;
    } catch {}
  }
  throw new Error("Image not found");
}

export const GET: APIRoute = async () => {
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
              // Label
              {
                type: "div",
                props: {
                  tw: "text-3xl font-bold text-orange-700",
                  children: "Stefan Gasser",
                },
              },
              // Tagline
              {
                type: "div",
                props: {
                  tw: "mt-6 text-5xl font-bold text-gray-800",
                  style: {
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                  },
                  children: [
                    { type: "span", props: { children: "Digitalisierung." } },
                    {
                      type: "span",
                      props: {
                        tw: "px-3 py-1 rounded mx-2",
                        style: {
                          backgroundColor: "rgba(254, 215, 170, 0.6)",
                          fontStyle: "italic",
                        },
                        children: "KI",
                      },
                    },
                    { type: "span", props: { children: "." } },
                    {
                      type: "span",
                      props: { tw: "w-full", children: "Automatisierung." },
                    },
                  ],
                },
              },
              // Description
              {
                type: "div",
                props: {
                  tw: "mt-8 text-3xl text-gray-600 max-w-2xl",
                  style: { lineHeight: 1.4 },
                  children:
                    "Ich helfe Unternehmen, KI und Automatisierung sinnvoll einzusetzen – von der Analyse bis zur fertigen Lösung.",
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
