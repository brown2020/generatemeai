import type { NextRequest } from "next/server";
import { z } from "zod";
import ffmpeg from "fluent-ffmpeg";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { PassThrough } from "node:stream";
import { Timestamp } from "firebase-admin/firestore";
import { adminDb } from "@/firebase/firebaseAdmin";
import { FirestorePaths } from "@/firebase/paths";
import {
  jsonError,
  jsonOk,
  parseJsonBody,
  withAuth,
} from "@/lib/api/server";
import { saveGif } from "@/utils/storage";
import { fetchChecked, isAllowedStorageUrl, isUserMediaUrl, MAX_VIDEO_BYTES } from "@/utils/storageUrl";
import { assertGenerationAccess } from "@/utils/generationGuard";

export const runtime = "nodejs";
export const maxDuration = 120;

const bodySchema = z.object({
  firebaseVideoUrl: z.string().url("Invalid video URL"),
  id: z.string().min(1, "Original image ID is required"),
});

/**
 * Resolves the ffmpeg binary path, preferring the bundled ffmpeg-static
 * package, falling back to the system PATH if it's unavailable.
 */
function getFfmpegPath(): string {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const ffmpegStatic = require("ffmpeg-static");
    return ffmpegStatic;
  } catch {
    return process.platform === "win32" ? "ffmpeg.exe" : "ffmpeg";
  }
}

ffmpeg.setFfmpegPath(getFfmpegPath());

/**
 * Writes the video to a temp file before ffmpeg so the converter cannot follow
 * a redirect. The temp directory is removed when the conversion settles.
 */
function convertToGif(video: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const dirPromise = mkdtemp(path.join(tmpdir(), "gif-"));
    dirPromise.then(async (dir) => {
      const inputPath = path.join(dir, `${randomUUID()}.bin`);
      try {
        await writeFile(inputPath, video);
        const stream = new PassThrough();
        const chunks: Buffer[] = [];
        ffmpeg(inputPath)
          .outputFormat("gif")
          .addOption("-loglevel", "quiet")
          .on("error", (err: Error) => {
            void rm(dir, { recursive: true, force: true });
            reject(new Error(err.message));
          })
          .pipe(stream, { end: true });
        stream.on("data", (chunk: Buffer) => chunks.push(chunk));
        stream.on("finish", () => {
          void rm(dir, { recursive: true, force: true });
          resolve(Buffer.concat(chunks));
        });
        stream.on("error", (err: Error) => {
          void rm(dir, { recursive: true, force: true });
          reject(new Error(err.message));
        });
      } catch (error) {
        await rm(dir, { recursive: true, force: true });
        reject(error);
      }
    }, reject);
  });
}

/**
 * POST /api/generate/gif
 * Converts a stored video into a GIF and writes a new cover doc pointing at
 * the uploaded GIF.
 */
export const POST = withAuth(async (uid, request: NextRequest) => {
  const { firebaseVideoUrl, id } = await parseJsonBody(request, bodySchema);
  await assertGenerationAccess(uid, false);

  const docRef = adminDb.doc(FirestorePaths.profileCover(uid, id));
  const docSnap = await docRef.get();
  if (!docSnap.exists) {
    return jsonError("Original document not found", "NOT_FOUND", 404);
  }

  const data = docSnap.data();
  const savedVideo = data?.videoDownloadUrl;
  const ownsObject = isUserMediaUrl(firebaseVideoUrl, uid);
  const ownsSavedUrl =
    typeof savedVideo === "string" &&
    savedVideo === firebaseVideoUrl &&
    isAllowedStorageUrl(savedVideo);
  if (!ownsObject && !ownsSavedUrl) {
    return jsonError("Unsupported video URL.", "VALIDATION_ERROR", 400);
  }

  const videoBytes = await fetchChecked(firebaseVideoUrl, {
    maxBytes: MAX_VIDEO_BYTES,
    allow: isAllowedStorageUrl,
  });
  const videoBuffer = await convertToGif(videoBytes);

  const cloneRef = adminDb.collection(FirestorePaths.profileCovers(uid)).doc();
  const gifUrl = await saveGif(videoBuffer, uid);

  await cloneRef.set({
    ...data,
    id: cloneRef.id,
    videoDownloadUrl: gifUrl,
    timestamp: Timestamp.now(),
  });

  return jsonOk({ newId: cloneRef.id, gifUrl });
});
