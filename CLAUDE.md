# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Dev server at localhost:4321
npm run build
npm run check        # TypeScript (astro check)
npm run lint
npm run format

# Blog audio (requires ELEVENLABS_API_KEY in .env)
npm run audio -- src/content/blog/article.md
npm run audio:dry -- src/content/blog/article.md  # Preview + cost estimate
```

## Architecture

Astro 5 + Tailwind CSS v4 (configured via Vite plugin in `astro.config.mjs`).

**Rendering**: Hybrid - static pages with SSR for dynamic OG images.

**Content**: Blog posts in `src/content/blog/`, schema in `src/content.config.ts`.

**OG Images**: `@vercel/og` at `src/pages/og/[slug].png.ts` uses JSX-like object syntax (not React JSX).

**Blog Audio**: Two-step workflow:

1. `/tts src/content/blog/article.md` creates optimized `.tts.txt`
2. `npm run audio` generates MP3 via ElevenLabs
   AudioPlayer auto-displays when `public/audio/[slug].mp3` exists.
