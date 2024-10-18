"use server";
import { adminBucket } from "@/firebase/firebaseAdmin";
import ffmpeg from "fluent-ffmpeg";
import { PassThrough } from 'stream';
import { db } from "@/firebase/firebaseClient";
import { collection, doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import path from "path";

const ffmpegPath = path.resolve(__dirname, '../../../../../', "node_modules", "ffmpeg-static", "ffmpeg.exe");
ffmpeg.setFfmpegPath(ffmpegPath);

async function convertToGIF(videoUrl: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const gifStream = new PassThrough();
        const gifBuffer: Buffer[] = [];

        ffmpeg()
            .input(videoUrl)
            .outputFormat('gif')
            .addOption('-loglevel', 'verbose')
            .on('end', () => {
                console.log("Conversion to GIF completed.");
            })
            .on('error', (err: Error) => {
                reject(new Error(err.message));
            })
            .on('stderr', (stderr: string) => {
                console.log(`FFmpeg stderr: ${stderr}`);
            })
            .pipe(gifStream, { end: true });

        gifStream.on('data', (chunk: Buffer) => {
            gifBuffer.push(chunk);
        });

        gifStream.on('finish', () => {
            console.log('GIF stream finished. Total size:', gifBuffer.length);
            resolve(Buffer.concat(gifBuffer));
        });

        gifStream.on('error', (err: Error) => {
            reject(new Error(err.message));
        });
    });
}

export async function processVideoToGIF(firebaseVideoUrl: string, id: string, uid: string): Promise<string | void> {
    try {
        const videoBuffer: Buffer = await convertToGIF(firebaseVideoUrl);

        const docRef = doc(db, "profiles", uid, "covers", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            const coll = collection(db, "profiles", uid, "covers");
            const cloneRef = doc(coll);
            const newFilePath = `video-generation/${Date.now()}.gif`;
            const gifFileRef = adminBucket.file(newFilePath);

            await gifFileRef.save(videoBuffer, { contentType: 'image/gif' });

            const [gifsReferenceUrl] = await gifFileRef.getSignedUrl({
                action: 'read',
                expires: '03-17-2125',
            });

            await setDoc(cloneRef, {
                ...data,
                id: cloneRef.id,
                videoDownloadUrl: gifsReferenceUrl,
                timestamp: Timestamp.now()
            });
            return cloneRef.id;
        }
    } catch (error) {
        throw error;
    }
}