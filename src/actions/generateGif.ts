"use server";

import { adminBucket, adminDb } from "@/firebase/firebaseAdmin";
import ffmpeg from "fluent-ffmpeg";
import { PassThrough } from "stream";
import { Timestamp } from "firebase-admin/firestore";

// Configure ffmpeg path based on platform
const getFfmpegPath = (): string => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const ffmpegStatic = require("ffmpeg-static");
    return ffmpegStatic;
  } catch {
    // Fallback for development or custom installations
    return process.platform === "win32" ? "ffmpeg.exe" : "ffmpeg";
  }
};

ffmpeg.setFfmpegPath(getFfmpegPath());

/**
 * Converts a video URL to a GIF buffer using ffmpeg.
 */
async function convertToGIF(videoUrl: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const gifStream = new PassThrough();
    const gifBuffer: Buffer[] = [];

    ffmpeg()
      .input(videoUrl)
      .outputFormat("gif")
      .addOption("-loglevel", "verbose")
      .on("end", () => {
        console.log("Conversion to GIF completed.");
      })
      .on("error", (err: Error) => {
        reject(new Error(err.message));
      })
      .on("stderr", (stderr: string) => {
        console.log(`FFmpeg stderr: ${stderr}`);
      })
      .pipe(gifStream, { end: true });

    gifStream.on("data", (chunk: Buffer) => {
      gifBuffer.push(chunk);
    });

    gifStream.on("finish", () => {
      console.log("GIF stream finished. Total size:", gifBuffer.length);
      resolve(Buffer.concat(gifBuffer));
    });

    gifStream.on("error", (err: Error) => {
      reject(new Error(err.message));
    });
  });
}

/**
 * Processes a video to GIF and saves it to Firebase Storage and Firestore.
 */
export async function processVideoToGIF(
  firebaseVideoUrl: string,
  id: string,
  uid: string
): Promise<string | undefined> {
  // Convert video to GIF
  const videoBuffer = await convertToGIF(firebaseVideoUrl);

  // Get original document data using Admin SDK
  const docRef = adminDb.doc(`profiles/${uid}/covers/${id}`);
  const docSnap = await docRef.get();

  if (!docSnap.exists) {
    throw new Error("Original document not found");
  }

  const data = docSnap.data();

  // Create new document reference
  const collRef = adminDb.collection(`profiles/${uid}/covers`);
  const cloneRef = collRef.doc();

  // Upload GIF to storage
  const newFilePath = `video-generation/${Date.now()}.gif`;
  const gifFileRef = adminBucket.file(newFilePath);

  await gifFileRef.save(videoBuffer, { contentType: "image/gif" });

  const [gifsReferenceUrl] = await gifFileRef.getSignedUrl({
    action: "read",
    expires: "03-17-2125",
  });

  // Save new document with GIF URL
  await cloneRef.set({
    ...data,
    id: cloneRef.id,
    videoDownloadUrl: gifsReferenceUrl,
    timestamp: Timestamp.now(),
  });

  return cloneRef.id;
}
