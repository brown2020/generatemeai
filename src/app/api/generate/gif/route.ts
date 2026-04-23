import type { NextRequest } from "next/server";
import { z } from "zod";
import ffmpeg from "fluent-ffmpeg";
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
 * Streams a video URL through ffmpeg and collects the GIF output into a
 * Buffer. Errors on either stream reject the promise.
 */
function convertToGif(videoUrl: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const stream = new PassThrough();
    const chunks: Buffer[] = [];

    ffmpeg()
      .input(videoUrl)
      .outputFormat("gif")
      .addOption("-loglevel", "quiet")
      .on("error", (err: Error) => reject(new Error(err.message)))
      .pipe(stream, { end: true });

    stream.on("data", (chunk: Buffer) => chunks.push(chunk));
    stream.on("finish", () => resolve(Buffer.concat(chunks)));
    stream.on("error", (err: Error) => reject(new Error(err.message)));
  });
}

/**
 * POST /api/generate/gif
 * Converts a stored video into a GIF and writes a new cover doc pointing at
 * the uploaded GIF.
 */
export const POST = withAuth(async (uid, request: NextRequest) => {
  const { firebaseVideoUrl, id } = await parseJsonBody(request, bodySchema);

  const videoBuffer = await convertToGif(firebaseVideoUrl);

  const docRef = adminDb.doc(FirestorePaths.profileCover(uid, id));
  const docSnap = await docRef.get();
  if (!docSnap.exists) {
    return jsonError("Original document not found", "NOT_FOUND", 404);
  }

  const data = docSnap.data();
  const cloneRef = adminDb.collection(FirestorePaths.profileCovers(uid)).doc();
  const gifUrl = await saveGif(videoBuffer);

  await cloneRef.set({
    ...data,
    id: cloneRef.id,
    videoDownloadUrl: gifUrl,
    timestamp: Timestamp.now(),
  });

  return jsonOk({ newId: cloneRef.id, gifUrl });
});
