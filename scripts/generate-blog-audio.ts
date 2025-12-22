#!/usr/bin/env npx tsx
/**
 * Blog Audio Generator - Converts TTS-optimized text to MP3 using ElevenLabs
 *
 * Usage:
 *   npm run audio -- src/content/blog/article.md
 *   npm run audio:dry -- src/content/blog/article.md
 *
 * Requires: .tts.txt file next to the .md file (create with /tts command)
 */

import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { config } from "dotenv";
import { createWriteStream, existsSync, mkdirSync, readFileSync } from "fs";
import { basename, join, resolve } from "path";
import { Readable } from "stream";
import { finished } from "stream/promises";

config({ path: resolve(import.meta.dirname, "../.env") });

const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM";
const MODEL_ID = "eleven_multilingual_v2";
const OUTPUT_FORMAT = "mp3_44100_128";

const PROJECT_ROOT = resolve(import.meta.dirname, "..");
const AUDIO_DIR = join(PROJECT_ROOT, "public", "audio");

async function generateAudio(
  client: ElevenLabsClient,
  text: string,
  outputPath: string
): Promise<void> {
  const response = await client.textToSpeech.convert(VOICE_ID, {
    text,
    modelId: MODEL_ID,
    outputFormat: OUTPUT_FORMAT,
    voiceSettings: {
      stability: 0.75,
      similarityBoost: 0.75,
      useSpeakerBoost: true,
    },
  });

  const writeStream = createWriteStream(outputPath);

  if (response instanceof Readable) {
    response.pipe(writeStream);
  } else {
    const reader = (response as ReadableStream<Uint8Array>).getReader();
    const chunks: Uint8Array[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) chunks.push(value);
    }
    writeStream.write(Buffer.concat(chunks));
    writeStream.end();
  }

  await finished(writeStream);
}

async function processFile(
  client: ElevenLabsClient | null,
  filePath: string,
  dryRun: boolean
): Promise<{ chars: number; words: number }> {
  const slug = basename(filePath).replace(/\.mdx?$/, "");
  const ttsPath = filePath.replace(/\.mdx?$/, ".tts.txt");

  if (!existsSync(ttsPath)) {
    throw new Error(
      `TTS file not found: ${ttsPath}\nRun "/tts ${filePath}" first to create it.`
    );
  }

  const text = readFileSync(ttsPath, "utf-8").trim();
  const chars = text.length;
  const words = text.split(/\s+/).length;

  console.log(`\n${slug}`);
  console.log(
    `  ${chars.toLocaleString()} chars, ${words.toLocaleString()} words`
  );

  if (dryRun) {
    console.log(`  [dry-run] Would generate audio\n`);
    console.log(text);
    return { chars, words };
  }

  if (!client) throw new Error("ElevenLabs client not initialized");

  console.log(`  Generating...`);
  const outputPath = join(AUDIO_DIR, `${slug}.mp3`);
  await generateAudio(client, text, outputPath);
  console.log(`  Saved: ${outputPath}`);

  return { chars, words };
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const files = args.filter((a) => !a.startsWith("--"));

  if (files.length === 0) {
    console.log(`
Blog Audio Generator

Usage:
  npm run audio -- <file.md>
  npm run audio:dry -- <file.md>

Requires .tts.txt file (create with /tts command first)
`);
    return;
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey && !dryRun) {
    throw new Error("ELEVENLABS_API_KEY not set in .env");
  }

  const client = apiKey ? new ElevenLabsClient({ apiKey }) : null;

  if (!existsSync(AUDIO_DIR)) {
    mkdirSync(AUDIO_DIR, { recursive: true });
  }

  let totalChars = 0;
  let totalWords = 0;

  for (const file of files) {
    const filePath = resolve(file);
    if (!existsSync(filePath)) throw new Error(`File not found: ${file}`);
    const { chars, words } = await processFile(client, filePath, dryRun);
    totalChars += chars;
    totalWords += words;
  }

  console.log(
    `\nTotal: ${totalChars.toLocaleString()} chars, ${totalWords.toLocaleString()} words`
  );

  if (dryRun) {
    console.log(`Estimated cost: $${(totalChars * 0.00003).toFixed(2)}`);
  }
}

main().catch((e) => {
  console.error(`Error: ${e.message}`);
  process.exit(1);
});
