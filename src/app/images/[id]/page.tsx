'use client'

import React, { useEffect, useState } from "react";
import { db } from "../../../firebase/firebaseClient";
import { doc, getDoc, runTransaction, updateDoc } from "firebase/firestore";
import {
    FacebookShareButton,
    TwitterShareButton,
    LinkedinShareButton,
    EmailShareButton,
    FacebookIcon,
    TwitterIcon,
    LinkedinIcon,
    EmailIcon,
} from "react-share";
import { useAuthStore } from "@/zustand/useAuthStore";
import toast from "react-hot-toast";
import { X } from "lucide-react";

type Params = { params: { id: string } };

const ImagePage = ({ params: { id } }: Params) => {
    const [imageData, setImageData] = useState<any>(null);
    const [isSharable, setIsSharable] = useState<boolean>(false);
    const [newTag, setNewTag] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const uid = useAuthStore((s) => s.uid);
    const authPending = useAuthStore((s) => s.authPending);

    useEffect(() => {
        const fetchImageData = async () => {
            let docRef;

            if (uid && !authPending) {
                docRef = doc(db, "profiles", uid, "covers", id);
            } else {
                docRef = doc(db, "publicImages", id);
            }

            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                setImageData(data);
                setIsSharable(data.isSharable ?? false);
                setTags(data.tags ?? []);
            }
        };

        if (id) {
            fetchImageData();
        }
    }, [id, uid, authPending]);

    const handleDownload = async () => {
        if (!imageData) return;
        try {
            const response = await fetch(imageData.downloadUrl);
            if (!response.ok) throw new Error("Network response was not ok");

            const blob = await response.blob();
            const link = document.createElement("a");

            const url = new URL(imageData.downloadUrl);
            const filename = url.pathname.split("/").pop() || "image.jpg";

            link.href = URL.createObjectURL(blob);
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
        } catch (error) {
            toast.error("Download error: " + error);
        }
    };

    const toggleSharable = async () => {
        if (!imageData || !uid) return;
        try {
            const newSharableState = !isSharable;
            const coversDocRef = doc(db, "profiles", uid, "covers", id as string);
            const publicImagesDocRef = doc(db, "publicImages", id as string);

            if (newSharableState) {
                await runTransaction(db, async (transaction) => {
                    const coversDocSnap = await transaction.get(coversDocRef);
                    if (!coversDocSnap.exists()) {
                        throw new Error("Document does not exist in covers");
                    }
                    transaction.set(publicImagesDocRef, { ...coversDocSnap.data(), isSharable: true });
                    transaction.update(coversDocRef, { isSharable: true });

                });
            } else {
                await runTransaction(db, async (transaction) => {
                    const publicImagesDocSnap = await transaction.get(publicImagesDocRef);
                    if (!publicImagesDocSnap.exists()) {
                        throw new Error("Document does not exist in publicImages");
                    }
                    transaction.set(coversDocRef, { ...publicImagesDocSnap.data(), isSharable: false });
                    transaction.delete(publicImagesDocRef);
                });
            }

            setIsSharable(newSharableState);
            toast.success(`Image is now ${newSharableState ? "sharable" : "private"}`);
        } catch (error) {
            toast.error("Error updating share status: " + error);
        }
    };

    const handleAddTag = async () => {
        if (!newTag.trim() || !imageData) return;

        try {
            const updatedTags = [...tags, newTag.trim()];
            const docRef = uid ? doc(db, "profiles", uid, "covers", id) : doc(db, "publicImages", id);

            await updateDoc(docRef, { tags: updatedTags });
            setTags(updatedTags);
            setNewTag('');
            toast.success("Tag added successfully");
        } catch (error) {
            toast.error("Error adding tag: " + error);
        }
    };

    const handleRemoveTag = async (tagToRemove: string) => {
        if (!imageData) return;

        try {
            const updatedTags = tags.filter(tag => tag !== tagToRemove);
            const docRef = uid ? doc(db, "profiles", uid, "covers", id) : doc(db, "publicImages", id);

            await updateDoc(docRef, { tags: updatedTags });
            setTags(updatedTags);
            toast.success("Tag removed successfully");
        } catch (error) {
            toast.error("Error removing tag: " + error);
        }
    };

    if (!imageData) return <div></div>;

    const currentPageUrl = `${window.location.origin}/image/${id}`;

    return (
        <div className="flex flex-col w-full max-w-4xl mx-auto h-full gap-2">
            <img
                className="h-full w-full object-cover"
                src={imageData.downloadUrl}
                alt="Visual Result"
                height={512}
                width={512}
            />

            {isSharable && (
                <div className="flex gap-4 mt-4 justify-center">
                    <FacebookShareButton url={currentPageUrl}>
                        <FacebookIcon size={48} />
                    </FacebookShareButton>
                    <TwitterShareButton url={currentPageUrl}>
                        <TwitterIcon size={48} />
                    </TwitterShareButton>
                    <LinkedinShareButton url={currentPageUrl}>
                        <LinkedinIcon size={48} />
                    </LinkedinShareButton>
                    <EmailShareButton url={currentPageUrl}>
                        <EmailIcon size={48} />
                    </EmailShareButton>
                </div>
            )}

            <button
                className="btn-primary2 h-12 flex items-center justify-center mx-3"
                onClick={handleDownload}
            >
                Download
            </button>

            {uid && (
                <button
                    className="btn-primary2 h-12 flex items-center justify-center mx-3 mt-2"
                    onClick={toggleSharable}
                >
                    {isSharable ? "Make Private" : "Make Sharable"}
                </button>
            )}

            <div className="mt-4 w-1/2 p-3 py-0">
                <h2 className="text-2xl mb-3 font-bold">Metadata: </h2>
                {imageData.freestyle && <p><strong>Freestyle:</strong> {imageData.freestyle}</p>}
                {imageData.prompt && <p><strong>Prompt:</strong> {imageData.prompt}</p>}
                {imageData.style && <p><strong>Style:</strong> {imageData.style}</p>}
                {imageData.model && <p><strong>Model:</strong> {imageData.model}</p>}
                {imageData.timestamp?.seconds && (
                    <p><strong>Timestamp:</strong> {new Date(imageData.timestamp.seconds * 1000).toLocaleString()}</p>
                )}
                {uid && (
                    <div className="mt-4">
                        <h3 className="text-xl mb-2 font-bold">Tags:</h3>
                        <div className="flex flex-wrap gap-2">
                            {tags.map((tag, index) => (
                                <div key={index} className="flex items-center gap-2 bg-gray-100 border border-gray-300 rounded px-2 py-1">
                                    <span className="flex-1">{tag}</span>
                                    <button
                                        onClick={() => handleRemoveTag(tag)}
                                        className="text-gray-500 hover:text-gray-700"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="mt-2 flex items-center">
                            <input
                                type="text"
                                value={newTag}
                                onChange={(e) => setNewTag(e.target.value)}
                                placeholder="Add new tag"
                                className="p-2 mt-2 border border-gray-300 rounded-l-md"
                            />
                            <button
                                onClick={handleAddTag}
                                className="btn-primary2 px-2 py-[0.65rem] pr-4 text-sm rounded-l-md"
                            >
                                Add Tag
                            </button>
                        </div>
                    </div>
                )}
            </div>
            <br />
        </div>
    );
};

export default ImagePage;
