#!/usr/bin/env npx tsx
/**
 * Blog Audio Generator - Converts blog markdown to MP3 using ElevenLabs TTS
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

function markdownToText(markdown: string): string {
  let text = markdown;
  text = text.replace(/^---\n[\s\S]*?\n---\n/, "");
  text = text.replace(/<[^>]+>/g, "");
  text = text.replace(/!\[[^\]]*\]\([^)]+\)/g, "");
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
  text = text.replace(/^#{1,6}\s+/gm, "");
  text = text.replace(/\*\*([^*]+)\*\*/g, "$1");
  text = text.replace(/\*([^*]+)\*/g, "$1");
  text = text.replace(/__([^_]+)__/g, "$1");
  text = text.replace(/_([^_]+)_/g, "$1");
  text = text.replace(/`([^`]+)`/g, "$1");
  text = text.replace(/^>\s*/gm, "");
  text = text.replace(/^\|[-:\s|]+\|\s*$/gm, "");
  text = text.replace(/^\|\s*/gm, "");
  text = text.replace(/\s*\|$/gm, "");
  text = text.replace(/\s*\|\s*/g, ", ");
  text = text.replace(/^[-*_]{3,}\s*$/gm, "");
  text = text.replace(/^[\s]*[-*+]\s+/gm, "");
  text = text.replace(/^[\s]*\d+\.\s+/gm, "");
  text = text.replace(/\n{3,}/g, "\n\n");
  return text.trim();
}

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
    await finished(writeStream);
  } else {
    const reader = (response as ReadableStream<Uint8Array>).getReader();
    const chunks: Uint8Array[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) chunks.push(value);
    }
    const buffer = Buffer.concat(chunks);
    writeStream.write(buffer);
    writeStream.end();
    await finished(writeStream);
  }
}

async function processFile(
  client: ElevenLabsClient | null,
  filePath: string,
  dryRun: boolean
): Promise<{ chars: number; words: number }> {
  const fileName = basename(filePath);
  const slug = basename(filePath, ".md");
  const outputPath = join(AUDIO_DIR, `${slug}.mp3`);
  const ttsPath = filePath.replace(/\.md$/, ".tts.txt");

  console.log(`\nProcessing: ${fileName}`);

  let plainText: string;
  let source: string;

  if (existsSync(ttsPath)) {
    plainText = readFileSync(ttsPath, "utf-8").trim();
    source = ".tts.txt (optimized)";
  } else {
    const markdown = readFileSync(filePath, "utf-8");
    plainText = markdownToText(markdown);
    source = ".md (auto-converted)";
  }

  const chars = plainText.length;
  const words = plainText.split(/\s+/).length;

  console.log(`  Source: ${source}`);
  console.log(
    `  Text: ${chars.toLocaleString()} chars, ${words.toLocaleString()} words`
  );

  if (dryRun) {
    console.log("  [dry-run] Would generate audio");
    console.log("-".repeat(60));
    console.log(plainText);
    console.log("-".repeat(60));
    return { chars, words };
  }

  if (!client) {
    console.error("  Error: ElevenLabs client not initialized");
    return { chars, words };
  }

  console.log(`  Generating audio...`);
  await generateAudio(client, plainText, outputPath);
  console.log(`  Saved: ${outputPath}`);

  return { chars, words };
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const files = args.filter((a) => !a.startsWith("--"));

  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!apiKey && !dryRun) {
    console.error("Error: ELEVENLABS_API_KEY not set in .env");
    console.error("Get your API key at elevenlabs.io");
    process.exit(1);
  }

  const client = apiKey ? new ElevenLabsClient({ apiKey }) : null;

  if (!existsSync(AUDIO_DIR)) {
    mkdirSync(AUDIO_DIR, { recursive: true });
  }

  if (files.length === 0) {
    console.log(`
Blog Audio Generator

Usage:
  npm run audio -- <file.md>
  npm run audio:dry -- <file.md>

Example:
  npm run audio -- src/content/blog/my-article.md
`);
    return;
  }

  let totalChars = 0;
  let totalWords = 0;

  for (const file of files) {
    const filePath = resolve(file);
    if (!existsSync(filePath)) {
      console.error(`File not found: ${file}`);
      continue;
    }
    const { chars, words } = await processFile(client, filePath, dryRun);
    totalChars += chars;
    totalWords += words;
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log(
    `Summary: ${files.length} file(s), ${totalChars.toLocaleString()} chars, ${totalWords.toLocaleString()} words`
  );

  if (dryRun) {
    const cost = totalChars * 0.00003;
    console.log(`Estimated cost: $${cost.toFixed(2)}`);
    console.log(`Free tier: 10,000 chars/month`);
  }
}

main().catch((error) => {
  console.error("Error:", error.message);
  process.exit(1);
});
