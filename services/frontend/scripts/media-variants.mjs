/**
 * Derives the web variants the CMS does not provide, from the mirrored media:
 *
 *   • a poster frame for every video — the CMS has none, and without one the
 *     hero has nothing to show until the clip arrives;
 *   • a phone-sized H.264 encode, so a visitor on mobile data is not asked for
 *     18MB to watch a background loop.
 *
 *   pnpm media:variants          build anything missing
 *   pnpm media:variants --force  rebuild everything
 *
 * Originals are never modified. Outputs sit beside them as `<name>-poster.jpg`
 * and `<name>-720p.mp4`, so Git LFS covers them like the rest of public/media.
 */
import { execFile } from "node:child_process";
import { readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const run = promisify(execFile);
const ROOT = fileURLToPath(new URL("..", import.meta.url));
const MEDIA = path.join(ROOT, "public/media");
const FORCE = process.argv.includes("--force");

/** Every .mp4 under public/media that is not itself a derived variant. */
async function findVideos(dir) {
  const found = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) found.push(...(await findVideos(full)));
    else if (entry.name.endsWith(".mp4") && !entry.name.endsWith("-720p.mp4")) found.push(full);
  }
  return found;
}

const probe = async (file) => {
  const { stdout } = await run("ffprobe", [
    "-v",
    "error",
    "-show_entries",
    "format=duration",
    "-show_entries",
    "stream=codec_type,width,height",
    "-of",
    "json",
    file,
  ]);
  const data = JSON.parse(stdout);
  const video = data.streams.find((s) => s.codec_type === "video");
  return {
    duration: Number(data.format.duration),
    width: Number(video?.width ?? 0),
    height: Number(video?.height ?? 0),
    hasAudio: data.streams.some((s) => s.codec_type === "audio"),
  };
};

/**
 * Brightness and saturation of one frame. Used to choose a poster that shows
 * the subject, rather than the fade-from-black most clips open on.
 */
async function frameStats(file, at) {
  const { stderr } = await run("ffmpeg", [
    "-ss",
    String(at),
    "-i",
    file,
    "-frames:v",
    "1",
    "-vf",
    "signalstats,metadata=print",
    "-f",
    "null",
    "-",
  ]).catch((error) => ({ stderr: error.stderr ?? "" }));
  const read = (key) => {
    const match = new RegExp(`signalstats\\.${key}=([0-9.]+)`).exec(stderr);
    return match ? Number(match[1]) : 0;
  };
  return { luma: read("YAVG"), saturation: read("SATAVG") };
}

/** Scores candidates across the clip and keeps the best-looking one. */
async function pickPosterTime(file, duration) {
  // Skip the first and last tenth: openings fade in, endings fade out.
  const candidates = [];
  for (let pct = 12; pct <= 88; pct += 8) candidates.push((duration * pct) / 100);

  let best = { at: candidates[0], score: -1, luma: 0, saturation: 0 };
  for (const at of candidates) {
    const { luma, saturation } = await frameStats(file, at);
    // Prefer well-lit and colourful; penalise blown-out frames.
    const exposure = luma > 200 ? 200 - (luma - 200) * 2 : luma;
    const score = exposure + saturation * 1.5;
    if (score > best.score) best = { at, score, luma, saturation };
  }
  return best;
}

const exists = (file) =>
  stat(file).then(
    () => true,
    () => false,
  );
const sizeOf = async (file) => (await stat(file)).size;
const mb = (bytes) => (bytes / 1048576).toFixed(2);

const videos = await findVideos(MEDIA);
console.log(`${videos.length} source videos\n`);
const report = [];

for (const source of videos) {
  const rel = path.relative(MEDIA, source);
  const base = source.replace(/\.mp4$/, "");
  const poster = `${base}-poster.jpg`;
  const mobile = `${base}-720p.mp4`;
  const info = await probe(source);
  const originalSize = await sizeOf(source);

  // ── Poster ────────────────────────────────────────────────────────────
  if (FORCE || !(await exists(poster))) {
    const best = await pickPosterTime(source, info.duration);
    // `thumbnail` picks the most representative frame near that point, so the
    // poster is not whatever single frame the seek landed on.
    await run("ffmpeg", [
      "-y",
      "-ss",
      String(Math.max(0, best.at - 1)),
      "-i",
      source,
      "-vf",
      "thumbnail=60,scale='min(1280,iw)':-2",
      "-frames:v",
      "1",
      "-q:v",
      "4",
      poster,
    ]);
    console.log(
      `poster  ${path.basename(poster)}  from ${best.at.toFixed(1)}s ` +
        `(luma ${best.luma.toFixed(0)}, sat ${best.saturation.toFixed(0)})  ${mb(await sizeOf(poster))} MB`,
    );
  }

  // ── Phone encode ──────────────────────────────────────────────────────
  if (FORCE || !(await exists(mobile))) {
    // Target under 4MB. The bitrate budget is the file size over the duration,
    // less a little headroom for the container.
    const budgetKbps = Math.floor(((3.7 * 1024 * 1024 * 8) / info.duration / 1000) * 0.95);
    // Portrait clips keep their orientation; the long edge is capped at 1280
    // and the short edge at 720, whichever binds first.
    const scale =
      "scale='if(gt(iw,ih),min(1280,iw),min(720,iw))':'if(gt(iw,ih),min(720,ih),min(1280,ih))':force_original_aspect_ratio=decrease:force_divisible_by=2";
    await run("ffmpeg", [
      "-y",
      "-i",
      source,
      "-vf",
      scale,
      "-c:v",
      "libx264",
      "-profile:v",
      "main",
      "-preset",
      "slow",
      "-crf",
      "28",
      "-maxrate",
      `${budgetKbps}k`,
      "-bufsize",
      `${budgetKbps * 2}k`,
      // The clip only ever plays muted, so the audio track is pure waste.
      "-an",
      // Metadata at the front, so playback can start before the file is whole.
      "-movflags",
      "+faststart",
      mobile,
    ]);
  }

  const posterSize = (await exists(poster)) ? await sizeOf(poster) : 0;
  const mobileSize = (await exists(mobile)) ? await sizeOf(mobile) : 0;
  report.push({
    source: `/media/${rel}`,
    poster: `/media/${rel.replace(/\.mp4$/, "-poster.jpg")}`,
    mobile: `/media/${rel.replace(/\.mp4$/, "-720p.mp4")}`,
    originalBytes: originalSize,
    posterBytes: posterSize,
    mobileBytes: mobileSize,
    droppedAudio: info.hasAudio,
  });

  console.log(
    `video   ${path.basename(mobile)}  ${mb(originalSize)} MB → ${mb(mobileSize)} MB` +
      `  (${Math.round((1 - mobileSize / originalSize) * 100)}% smaller${info.hasAudio ? ", audio dropped" : ""})\n`,
  );
}

await writeFile(
  path.join(MEDIA, "VARIANTS.json"),
  JSON.stringify({ generatedAt: new Date().toISOString(), videos: report }, null, 2) + "\n",
);
console.log("wrote public/media/VARIANTS.json");
