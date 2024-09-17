'use client'

import React, { useEffect, useState, useRef } from "react";
import { db } from "../../../firebase/firebaseClient";
import { doc, getDoc, runTransaction, updateDoc, deleteDoc } from "firebase/firestore";
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
import domtoimage from 'dom-to-image'
import { useRouter } from "next/navigation";
import Select from 'react-select';
import TextareaAutosize from 'react-textarea-autosize';
import { findModelByValue, models, SelectModel } from '@/constants/models';
import { artStyles, findArtByValue } from '@/constants/artStyles';
import { selectStyles } from '@/constants/selectStyles';
import { model } from "@/types/model";
import { generateImage } from "@/actions/generateImage";
import { generatePrompt } from "@/utils/promptUtils";
import useProfileStore from "@/zustand/useProfileStore";

type Params = { params: { id: string } };

function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const ImagePage = ({ params: { id } }: Params) => {
    const router = useRouter();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [imageData, setImageData] = useState<any>(null);
    const [isOwner, setIsOwner] = useState<boolean>(false);
    const [isSharable, setIsSharable] = useState<boolean>(false);
    const [newTag, setNewTag] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [caption, setCaption] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [imagePrompt, setImagePrompt] = useState<string>(imageData?.freestyle || '');
    const [imageStyle, setImageStyle] = useState<string>(imageData?.style || '');
    const [imageModel, setImageModel] = useState<model>(imageData?.model);
    const uid = useAuthStore((s) => s.uid);
    const authPending = useAuthStore((s) => s.authPending);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const fireworksAPIKey = useProfileStore((s) => s.profile.fireworks_api_key);
    const openAPIKey = useProfileStore((s) => s.profile.openai_api_key);
    const stabilityAPIKey = useProfileStore((s) => s.profile.stability_api_key)
    const useCredits = useProfileStore((s) => s.profile.useCredits);
    const credits = useProfileStore((s) => s.profile.credits);
    const [refreshCounter, setRefreshCounter] = useState<number>(0);

    useEffect(() => {
        const fetchImageData = async () => {
            let docRef;

            if (uid && !authPending) {
                docRef = doc(db, "profiles", uid, "covers", id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setImageData({ ...data });
                    setIsSharable(data?.isSharable ?? false);
                    setTags(data?.tags ?? []);
                    setCaption(data?.caption ?? '');
                    setIsOwner(true);
                    setImagePrompt(data?.freestyle || '');
                    setImageStyle(data?.style || '');
                    setImageModel(data?.model);
                }
            } else {
                if (!isOwner) {
                    docRef = doc(db, "publicImages", id);
                    const docSnap = await getDoc(docRef);

                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        setImageData({ ...data });
                        setIsSharable(data?.isSharable ?? false);
                        setTags(data?.tags ?? []);
                        setCaption(data?.caption ?? '');
                        setImagePrompt(data?.freestyle || '');
                        setImageStyle(data?.style || '');
                        setImageModel(data?.model);
                    } else {
                        setImageData(false);
                        setIsSharable(false);
                        setTags([]);
                        setCaption('');
                    }
                }
            }
        };

        if (id) {
            fetchImageData();
        }
    }, [id, uid, authPending, refreshCounter, isOwner]);

    const handleDownload = async () => {
        const container = document.getElementById('image-container');
        if (!container) return;

        try {
            const dataUrl = await domtoimage.toPng(container);

            const currentDate = new Date().toISOString().split('T')[0];
            const fileName = `${imageData?.freestyle}_${currentDate}.png`;

            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
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

    const handleRegenerateImage = async () => {
        if (!imageData) return;

        setLoading(true);

        try {
            const docRef = uid ? doc(db, "profiles", uid, "covers", id) : doc(db, "publicImages", id);

            if ((imageData?.freestyle != imagePrompt) || (imageData?.style != imageStyle) || (imageData?.model != imageModel)) {
                const prompt: string = generatePrompt(imagePrompt, imageStyle);
                const response = await generateImage(prompt, uid, openAPIKey, fireworksAPIKey, stabilityAPIKey, useCredits, credits, imageModel);

                if (response?.error) {
                    toast.error(response.error);
                    return;
                }

                const downloadURL = response?.imageUrl;
                if (!downloadURL) {
                    throw new Error("Error generating image");
                }

                await updateDoc(docRef, {
                    downloadUrl: downloadURL,
                    freestyle: imagePrompt,
                    prompt: prompt,
                    model: imageModel,
                    style: imageStyle
                });
            } 
            
            if (imageData?.caption != caption) {
                await updateDoc(docRef, {
                    caption: caption || ''
                });
            }

            setRefreshCounter(refreshCounter + 1)

            toast.success("Image regenerated successfully");
        } catch (error) {
            toast.error("Error regenerating image: " + error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!imageData || !uid) return;

        if (window.confirm("Are you sure you want to delete this image?")) {
            try {
                const docRef = uid ? doc(db, "profiles", uid, "covers", id) : doc(db, "publicImages", id);

                await deleteDoc(docRef);

                if (uid) {
                    const publicImagesDocRef = doc(db, "publicImages", id);
                    await deleteDoc(publicImagesDocRef);
                }

                toast.success("Image deleted successfully");
                delay(1000).then(() => {
                    router.push('/images')
                })
            } catch (error) {
                toast.error("Error deleting image: " + error);
            }
        }
    };

    if (imageData == false) return <div className="text-center text-3xl mt-10">The image does not exist or is private.</div>;

    const currentPageUrl = `${window.location.origin}/image/${id}`;

    return (
        <div className="flex flex-col w-full max-w-4xl mx-auto h-full gap-2">
            {imageData && <div className="relative inline-block" id="image-container">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    className="block h-full w-full object-cover"
                    src={imageData?.downloadUrl}
                    alt="Visual Result"
                    height={512}
                    width={512}
                />
                {caption && (
                    <div className="absolute inset-0 flex items-end justify-center cursor-default">
                        <div className="bg-[#000] bg-opacity-50 text-white text-xl md:text-3xl rounded-md text-center mb-4 h-[40%] md:h-[30%] w-[90%] md:w-[80%] overflow-hidden flex justify-center items-center select-none">
                            {caption}
                        </div>
                    </div>
                )}
            </div>}

            {imageData && isSharable && (
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

            {imageData && <button
                className="btn-primary2 h-12 flex items-center justify-center mx-3"
                onClick={handleDownload}
            >
                Download
            </button>
            }
            {uid && isOwner && (
                <button
                    className="btn-primary2 h-12 flex items-center justify-center mx-3 mt-2"
                    onClick={toggleSharable}
                >
                    {isSharable ? "Make Private" : "Make Sharable"}
                </button>
            )}

            {imageData && uid && isOwner && (
                <button
                    className="btn-primary2 h-12 flex items-center justify-center mx-3"
                    onClick={handleDelete}
                >
                    Delete
                </button>
            )}


            {imageData && <div className="mt-4 w-1/2 p-3 py-0">
                <h2 className="text-2xl mb-3 font-bold">Metadata: </h2>
                {imageData?.freestyle && <p><strong>Freestyle:</strong> {imageData?.freestyle}</p>}
                {/* {imageData?.prompt && <p><strong>Prompt:</strong> {imageData?.prompt}</p>} */}
                {imageData?.style && <p><strong>Style:</strong> {imageData?.style}</p>}
                {imageData?.model && <p><strong>Model:</strong> {imageData?.model}</p>}
                {imageData?.timestamp?.seconds && (
                    <p><strong>Timestamp:</strong> {new Date(imageData?.timestamp.seconds * 1000).toLocaleString()}</p>
                )}
                {uid && isOwner && (
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
            </div>}

            {imageData && uid && isOwner && (
                <div className="mt-4 w-full p-3 py-0">
                    <h2 className="text-2xl mb-3 font-bold">Caption:</h2>
                    <TextareaAutosize
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        placeholder="Enter caption"
                        className="p-2 border border-gray-300 rounded-md w-full"
                    />
                </div>
            )}

            {imageData && uid && isOwner && (
                <div className="mt-4 w-full p-3 py-0">
                    <h2 className="text-2xl mb-3 font-bold">Edit Prompt and Model:</h2>
                    <TextareaAutosize
                        value={imagePrompt}
                        onChange={(e) => setImagePrompt(e.target.value)}
                        placeholder="Edit prompt"
                        className="p-2 border border-gray-300 rounded-md w-full mb-4"
                        minRows={2}
                    />
                    <Select
                        isClearable={true}
                        isSearchable={true}
                        name="model"
                        onChange={(v) => setImageModel(v ? (v as SelectModel).value : "dall-e")}
                        defaultValue={findModelByValue(imageModel)}
                        options={models}
                        styles={selectStyles}
                        className="mb-4"
                    />
                    <Select
                        value={findArtByValue(imageStyle)}
                        onChange={(selectedOption) => setImageStyle(selectedOption?.value || '')}
                        options={artStyles}
                        className="mb-4"
                        styles={selectStyles}
                    />
                    <button
                        onClick={handleRegenerateImage}
                        className={`btn-primary2 h-12 mt-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={loading}
                    >
                        {loading ? 'Regenerating...' : 'Regenerate Image'}
                    </button>
                </div>

            )}

            {imageData && !isOwner && (
                <button
                    className="btn-primary2 h-12 flex items-center justify-center mx-3"
                    onClick={() => { router.push('/generate') }}
                >
                    Next: Generate Your Image
                </button>
            )}
            <canvas ref={canvasRef} className="hidden" />
            <br />
        </div>
    );
};

export default ImagePage;
