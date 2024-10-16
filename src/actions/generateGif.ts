"use server";
import { admin, adminBucket } from "@/firebase/firebaseAdmin";
import ffmpeg from "fluent-ffmpeg";
import { PassThrough, Readable } from 'stream';
import { db } from "@/firebase/firebaseClient";
import {  collection, doc, FieldPath, getDoc, getDocs, query, setDoc, Timestamp, where } from "firebase/firestore";
import path from "path";
const ffmpegPath = path.resolve(__dirname, '../../../../../' , "node_modules" , "ffmpeg-static","ffmpeg.exe");  
ffmpeg.setFfmpegPath(ffmpegPath as string);

async function convertToGIF(videoUrl: string) {
    // Create a pass-through stream for the GIF output
    const gifStream = new PassThrough();
    let gifBuffer: Buffer[] = [];  
        const ffmpegProcess = ffmpeg().input(videoUrl)
            .outputFormat('gif').addOption('-loglevel verbose')
            .on('end', () => {
                console.log("Conversion to GIF completed.");
                
             
            })
            .on('error', (err) => {
                console.error("Error during GIF conversion:", err);
           
            }) .on('stderr', (stderr) => {
                console.log(`FFmpeg stderr: ${stderr}`);
            }).pipe(gifStream,{ end: true });

            // ffmpegProcess.pipe(gifStream);
            gifStream.on('data', (chunk) => {
                gifBuffer.push(chunk);  // Push each chunk to the array
            });
            gifStream.on('finish', () => {
                console.log('GIF stream finished. Total size:', gifBuffer.length);
              });
         
         return gifStream;
 

}

function streamToBuffer(stream: any): Promise<Buffer> {
    
    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        stream.on('data', (chunk: Buffer) => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', reject);
    });
}
 
export async function processVideoToGIF(firebaseVideoUrl: string , id:string,uid:string) {
    try {
 
       
        const videoBuffer = await streamToBuffer(await convertToGIF(firebaseVideoUrl));
        const  docRef = doc(db, "profiles", uid, "covers", id);
        const docSnap = await getDoc(docRef);
 
        if(docSnap.exists()){

            const data =  docSnap.data();
            const coll = collection(db, "profiles", uid, "covers");
            const cloneRef = doc(coll);
            const newFilePath = `video-generation/${Date.now()}.gif`; // Adjust as necessary
            const gifFileRef = adminBucket.file(newFilePath);
    
            // Step 4: Save the new GIF file to Firebase Storage
            await gifFileRef.save(videoBuffer, {
                contentType: 'image/gif',
            });
    
            // Get a signed URL for the new GIF
             
            const [gifsReferenceUrl] = await gifFileRef.getSignedUrl({
                action: 'read',
                expires: '03-17-2125',
            });
         
            await setDoc(cloneRef,{...data, id:cloneRef.id,  videoDownloadUrl:gifsReferenceUrl,timestamp:Timestamp.now()});
            return cloneRef.id;
        }
        
        
    } catch (error) {
        console.error('Error during process:', error);
    }
}
