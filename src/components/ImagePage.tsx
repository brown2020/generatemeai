"use client";
import React, { useEffect, useState, useRef } from "react";
import { db } from "../firebase/firebaseClient";
import {
  doc,
  getDoc,
  runTransaction,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
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
import '../app/globals.css';
import { processVideoToGIF } from "@/actions/generateGif";
import { useAuthStore } from "@/zustand/useAuthStore";
import toast from "react-hot-toast";
import { X, Sparkle, Plus, Download, Lock, Share2, Trash2, Info, Tag } from "lucide-react";
import domtoimage from "dom-to-image";
import { useRouter } from "next/navigation";
import TextareaAutosize from "react-textarea-autosize";
import { suggestTags } from "@/actions/suggestTags";
import useProfileStore from "@/zustand/useProfileStore";
import { creditsToMinus } from "@/utils/credits";
import ModalComponent from "./VideoModalComponent";
import { removeBackground } from "@/actions/removeBackground";
import { SiStagetimer } from "react-icons/si";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const ImagePage = ({ id }: { id: string }) => {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [imageData, setImageData] = useState<any>(null);
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [isSharable, setIsSharable] = useState<boolean>(false);
  const [newTag, setNewTag] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [caption, setCaption] = useState<string>("");
  const debounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const uid = useAuthStore((s) => s.uid);
  const authPending = useAuthStore((s) => s.authPending);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [refreshCounter, setRefreshCounter] = useState<number>(0);
  const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  const [enteredPassword, setEnteredPassword] = useState<string>("");
  const [isPasswordProtected, setIsPasswordProtected] =
    useState<boolean>(false);
  const [passwordVerified, setPasswordVerified] = useState<boolean>(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedColor, setSelectedColor] = useState("#ffffff");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [loading, setLoading] = useState(false);

  const useCredits = useProfileStore((s) => s.profile.useCredits);
  const openAPIKey = useProfileStore((s) => s.profile.openai_api_key);
  const briaApiKey = useProfileStore((s) => s.profile.bria_api_key);

  const credits = useProfileStore((s) => s.profile.credits);
  const minusCredits = useProfileStore((state) => state.minusCredits);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const closeModal = () => {
    setIsModalOpen(false);
  };

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
          setCaption(data?.caption ?? "");
          setIsOwner(true);
          setBackgroundColor(data?.backgroundColor);
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
            setCaption(data?.caption ?? "");
            setBackgroundColor(data?.backgroundColor);
            if (data?.password) {
              setIsPasswordProtected(true);
            }
          } else {
            setImageData(false);
            setIsSharable(false);
            setTags([]);
            setCaption("");
          }
        }
      }
    };

    if (id) {
      fetchImageData();
    }
  }, [id, uid, authPending, refreshCounter, isOwner]);

  const getFileTypeFromUrl = (url: string): string | null | undefined => {
    if (!url) { return; }
    const fileName = url.split('/').pop();
    const cleanFileName = fileName?.split('?')[0];
    const fileParts: string[] | undefined = cleanFileName?.split('.');

    return fileParts && fileParts.length > 1 ? fileParts.pop() : null;
  }

  const handleDownload = async () => {
    if (imageData?.videoDownloadUrl) {
      const videoUrl = imageData.videoDownloadUrl;
      const currentDate = new Date().toISOString().split("T")[0];
      const fileName = `${imageData?.freestyle}_${currentDate}.${getFileTypeFromUrl(videoUrl)}`;

      try {
        const response = await fetch(videoUrl);
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        window.URL.revokeObjectURL(blobUrl);
      } catch (error) {
        console.error("Video download error:", error);
        toast.error("Download error: " + error);
      }
    } else {
      const container = document.getElementById("image-container");

      if (!container) return;

      try {
        const dataUrl = await domtoimage.toPng(container);
        const currentDate = new Date().toISOString().split("T")[0];
        const fileName = `${imageData?.freestyle}_${currentDate}.png`;

        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        toast.error("Download error: " + error);
      }
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
          transaction.set(publicImagesDocRef, {
            ...coversDocSnap.data(),
            isSharable: true,
            password: password,
          });
          transaction.update(coversDocRef, { isSharable: true });
        });
        setShowPasswordModal(false);
      } else {
        await runTransaction(db, async (transaction) => {
          const publicImagesDocSnap = await transaction.get(publicImagesDocRef);
          if (!publicImagesDocSnap.exists()) {
            throw new Error("Document does not exist in publicImages");
          }
          transaction.set(coversDocRef, {
            ...publicImagesDocSnap.data(),
            isSharable: false,
            password: "",
          });
          transaction.delete(publicImagesDocRef);
        });
      }

      setIsSharable(newSharableState);
      toast.success(
        `Image is now ${newSharableState ? "sharable" : "private"}`
      );
    } catch (error) {
      toast.error("Error updating share status: " + error);
    }
  };

  const handleAddTag = async (
    showToast: boolean = true,
    tagsArray: string[] | null = null
  ) => {
    if ((!tagsArray || !imageData) && (!newTag.trim() || !imageData)) return;

    const newTagValue = tagsArray || newTag.trim();

    try {
      const updatedTags = tagsArray
        ? tags.concat(newTagValue)
        : [...tags, newTagValue];
      const docRef = uid
        ? doc(db, "profiles", uid, "covers", id)
        : doc(db, "publicImages", id);

      await updateDoc(docRef, { tags: updatedTags });
      setTags(updatedTags as string[]);
      setNewTag("");
      if (showToast) toast.success("Tag added successfully");
    } catch (error) {
      if (showToast) toast.error("Error adding tag: " + error);
    }
  };

  const handleRemoveTag = async (tagToRemove: string) => {
    if (!imageData) return;

    try {
      const updatedTags = tags.filter((tag) => tag !== tagToRemove);
      const docRef = uid
        ? doc(db, "profiles", uid, "covers", id)
        : doc(db, "publicImages", id);

      await updateDoc(docRef, { tags: updatedTags });
      setTags(updatedTags);
      toast.success("Tag removed successfully");
    } catch (error) {
      toast.error("Error removing tag: " + error);
    }
  };

  const handleSuggestions = async () => {
    try {
      const freestyle = imageData?.freestyle;
      const color = imageData?.color;
      const lighting = imageData?.lighting;
      const style = imageData?.style;
      const imageCategory = imageData?.imageCategory;

      let suggestions = await suggestTags(
        freestyle,
        color,
        lighting,
        style,
        imageCategory,
        tags,
        openAPIKey,
        useCredits,
        credits
      );
      suggestions = suggestions.split(",");
      if (suggestions.length >= 1) {
        if (useCredits) {
          minusCredits(1);
        }
        await handleAddTag(false, suggestions);
        toast.success("Tags add succesfully");
      }
    } catch (err) {
      toast.error("Error adding tags: " + err);
    }
  };

  const handleCaptionChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setCaption(event.target.value);

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      handleRegenerateImage(event.target.value);
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, []);

  const handleRegenerateImage = async (captionValue: string) => {
    if (!imageData) return;

    try {
      const docRef = uid
        ? doc(db, "profiles", uid, "covers", id)
        : doc(db, "publicImages", id);

      await updateDoc(docRef, {
        caption: captionValue || "",
      });

      setRefreshCounter(refreshCounter + 1);
      toast.success("Image regenerated successfully");
    } catch (error) {
      toast.error("Error regenerating image: " + error);
    }
  };

  const handleDelete = async () => {
    if (!imageData || !uid) return;

    if (window.confirm("Are you sure you want to delete this image?")) {
      try {
        const docRef = uid
          ? doc(db, "profiles", uid, "covers", id)
          : doc(db, "publicImages", id);

        await deleteDoc(docRef);

        if (uid) {
          const publicImagesDocRef = doc(db, "publicImages", id);
          await deleteDoc(publicImagesDocRef);
        }

        toast.success("Image deleted successfully");
        delay(1000).then(() => {
          router.push("/images");
        });
      } catch (error) {
        toast.error("Error deleting image: " + error);
      }
    }
  };

  if (imageData == false)
    return (
      <div className="text-center text-3xl mt-10">
        The image does not exist or is private.
      </div>
    );

  const handlePasswordSubmit = () => {
    if (enteredPassword === imageData?.password) {
      setPasswordVerified(true);
    } else {
      toast.error("Invalid password");
    }
  };

  if (isPasswordProtected && !passwordVerified && !isOwner) {
    return (
      <div className="flex flex-col items-center mt-5">
        <h2 className="text-xl mb-4">
          This image is password-protected. Please enter the password to view:
        </h2>
        <input
          type="password"
          value={enteredPassword}
          onChange={(e) => setEnteredPassword(e.target.value)}
          className="p-2 border rounded mb-4"
        />
        <button onClick={handlePasswordSubmit} className="btn-primary2">
          Submit
        </button>
      </div>
    );
  }

  const handleBackgroundRemove = async () => {
    const imageUrl = imageData?.downloadUrl;

    const formData = new FormData();
    formData.append(
      "file",
      await fetch(imageUrl).then((res) => res.blob()),
      "image.png"
    );

    try {
      const result = await removeBackground(useCredits, credits, imageUrl, briaApiKey);

      if (!result?.error) {
        if (useCredits) {
          minusCredits(creditsToMinus("bria.ai"));
        }

        const bgRemovedImageUrl = result?.result_url;

        const docRef = uid
          ? doc(db, "profiles", uid, "covers", id)
          : doc(db, "publicImages", id);

        await updateDoc(docRef, {
          downloadUrl: bgRemovedImageUrl,
        });

        setRefreshCounter(refreshCounter + 1);

        toast.success("Background removed successfully!");
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      console.error("Error removing background: ", error);
      toast.error(`Failed to remove background: ${errorMessage}`);
    }
  };

  const changeBackground = async (color: string) => {
    const docRef = uid
      ? doc(db, "profiles", uid, "covers", id)
      : doc(db, "publicImages", id);

    await updateDoc(docRef, {
      backgroundColor: color,
    });

    setBackgroundColor(color);

    setRefreshCounter(refreshCounter + 1);
    toast.success("Background color changed successfully");
  };

  const currentPageUrl = `${window.location.origin}/image/${id}`;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {imageData && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div
            className="relative aspect-square"
            id="image-container"
            style={{ backgroundColor: backgroundColor }}
          >
            {imageData?.videoDownloadUrl && getFileTypeFromUrl(imageData?.videoDownloadUrl) != "gif" ? (
              <video
                className="w-full h-full object-contain"
                src={imageData.videoDownloadUrl}
                controls
                height={512}
                width={512}
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <img
                className="w-full h-full object-contain"
                src={getFileTypeFromUrl(imageData?.videoDownloadUrl) == "gif" ? imageData?.videoDownloadUrl : imageData?.downloadUrl}
                alt="Visual Result"
                height={512}
                width={512}
              />
            )}

            {caption && (
              <div className="absolute inset-0 flex items-end justify-center cursor-default p-4">
                <div className="bg-black/60 backdrop-blur-sm text-white text-xl md:text-2xl rounded-lg text-center p-4 w-full max-w-2xl">
                  {caption}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {imageData && isSharable && (
        <div className="flex gap-3 justify-center py-4">
          <FacebookShareButton url={currentPageUrl}>
            <FacebookIcon size={40} round className="hover:opacity-80 transition-opacity" />
          </FacebookShareButton>
          <TwitterShareButton url={currentPageUrl}>
            <TwitterIcon size={40} round className="hover:opacity-80 transition-opacity" />
          </TwitterShareButton>
          <LinkedinShareButton url={currentPageUrl}>
            <LinkedinIcon size={40} round className="hover:opacity-80 transition-opacity" />
          </LinkedinShareButton>
          <EmailShareButton url={currentPageUrl}>
            <EmailIcon size={40} round className="hover:opacity-80 transition-opacity" />
          </EmailShareButton>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {imageData && (
          <button
            className="flex-1 min-w-[200px] px-4 py-3 bg-blue-600 text-white rounded-lg font-medium 
              hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            onClick={handleDownload}
          >
            <Download className="w-5 h-5" />
            Download
          </button>
        )}

        {uid && isOwner && (
          <button
            className="flex-1 min-w-[200px] px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium 
              hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
            onClick={() => {
              if (isSharable) {
                toggleSharable();
                return;
              }
              setShowPasswordModal(true);
            }}
          >
            {isSharable ? (
              <>
                <Lock className="w-5 h-5" />
                Make Private
              </>
            ) : (
              <>
                <Share2 className="w-5 h-5" />
                Make Sharable
              </>
            )}
          </button>
        )}

        {imageData && uid && isOwner && (
          <button
            className="flex-1 min-w-[200px] px-4 py-3 bg-red-50 text-red-600 rounded-lg font-medium 
              hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
            onClick={handleDelete}
          >
            <Trash2 className="w-5 h-5" />
            Delete
          </button>
        )}
      </div>

      {imageData && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Info className="w-5 h-5 text-gray-500" />
            Metadata
          </h2>
          
          <div className="grid gap-3 text-sm">
            {imageData?.freestyle && (
              <div className="grid grid-cols-[120px,1fr] gap-2">
                <span className="font-medium text-gray-600">Freestyle:</span>
                <span>{imageData.freestyle}</span>
              </div>
            )}
            {imageData?.style && (
              <div className="grid grid-cols-[120px,1fr] gap-2">
                <span className="font-medium text-gray-600">Style:</span>
                <span>{imageData.style}</span>
              </div>
            )}
            {imageData?.model && (
              <div className="grid grid-cols-[120px,1fr] gap-2">
                <span className="font-medium text-gray-600">Model:</span>
                <span>{imageData.model}</span>
              </div>
            )}
            {imageData?.colorScheme && (
              <div className="grid grid-cols-[120px,1fr] gap-2">
                <span className="font-medium text-gray-600">Color:</span>
                <span>{imageData.colorScheme}</span>
              </div>
            )}
            {imageData?.lighting && (
              <div className="grid grid-cols-[120px,1fr] gap-2">
                <span className="font-medium text-gray-600">Lighting:</span>
                <span>{imageData.lighting}</span>
              </div>
            )}
            {imageData?.perspective && (
              <div className="grid grid-cols-[120px,1fr] gap-2">
                <span className="font-medium text-gray-600">Perspective:</span>
                <span>{imageData.perspective}</span>
              </div>
            )}
            {imageData?.composition && (
              <div className="grid grid-cols-[120px,1fr] gap-2">
                <span className="font-medium text-gray-600">Composition:</span>
                <span>{imageData.composition}</span>
              </div>
            )}
            {imageData?.medium && (
              <div className="grid grid-cols-[120px,1fr] gap-2">
                <span className="font-medium text-gray-600">Medium:</span>
                <span>{imageData.medium}</span>
              </div>
            )}
            {imageData?.mood && (
              <div className="grid grid-cols-[120px,1fr] gap-2">
                <span className="font-medium text-gray-600">Mood:</span>
                <span>{imageData.mood}</span>
              </div>
            )}
            {imageData?.imageCategory && (
              <div className="grid grid-cols-[120px,1fr] gap-2">
                <span className="font-medium text-gray-600">Category:</span>
                <span>{imageData.imageCategory}</span>
              </div>
            )}
            {imageData?.timestamp?.seconds && (
              <div className="grid grid-cols-[120px,1fr] gap-2">
                <span className="font-medium text-gray-600">Timestamp:</span>
                <span>{new Date(imageData.timestamp.seconds * 1000).toLocaleString()}</span>
              </div>
            )}
            {imageData?.videoModel && (
              <div className="grid grid-cols-[120px,1fr] gap-2">
                <span className="font-medium text-gray-600">Video Model:</span>
                <span>{imageData.videoModel}</span>
              </div>
            )}
            {imageData?.audio && (
              <div className="grid grid-cols-[120px,1fr] gap-2">
                <span className="font-medium text-gray-600">Audio:</span>
                <span>{imageData.audio}</span>
              </div>
            )}
            {imageData?.scriptPrompt && (
              <div className="grid grid-cols-[120px,1fr] gap-2">
                <span className="font-medium text-gray-600">Script:</span>
                <span>{imageData.scriptPrompt}</span>
              </div>
            )}
            {!imageData?.scriptPrompt && imageData?.animation && (
              <div className="grid grid-cols-[120px,1fr] gap-2">
                <span className="font-medium text-gray-600">Animation:</span>
                <span>{imageData.animation}</span>
              </div>
            )}
            {(imageData?.imageReference || (imageData?.downloadUrl && imageData?.videoDownloadUrl)) && (
              <div className="grid grid-cols-[120px,1fr] gap-2">
                <span className="font-medium text-gray-600">{imageData?.imageReference ? 'Image Reference' : 'Avatar'} Used:</span>
                <img
                  className="w-32 h-32 object-cover rounded-md border-2 border-black-600"
                  src={imageData?.imageReference || imageData?.downloadUrl}
                  alt="image reference used"
                ></img>
              </div>
            )}
          </div>
        </div>
      )}

      {uid && isOwner && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden p-6">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <Tag className="w-5 h-5 text-gray-500" />
            Tags
          </h3>
          
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg 
                    text-gray-700 hover:bg-gray-200 transition-colors group"
                >
                  <span>{tag}</span>
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="text-gray-400 group-hover:text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add new tag"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 
                    focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button
                onClick={() => handleAddTag()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium 
                  hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add
              </button>
              <button
                onClick={handleSuggestions}
                className="px-4 py-2 bg-purple-50 text-purple-600 rounded-lg font-medium 
                  hover:bg-purple-100 transition-colors flex items-center gap-2"
              >
                <Sparkle className="w-5 h-5" />
                Suggestions
              </button>
            </div>
          </div>
        </div>
      )}

      {imageData && uid && isOwner && !imageData?.videoDownloadUrl && (
        <div className="mt-4 w-full p-3 py-0">
          <h2 className="text-2xl mb-3 font-bold">Caption:</h2>
          <TextareaAutosize
            value={caption}
            onChange={handleCaptionChange}
            placeholder="Enter caption"
            className="p-2 border border-gray-300 rounded-md w-full"
          />
        </div>
      )}

      {imageData &&
        uid &&
        isOwner &&
        imageData?.downloadUrl &&
        imageData?.downloadUrl.includes("cloudfront.net") &&
        !imageData?.videoDownloadUrl && (
          <button
            className="btn-primary2 h-12 flex items-center justify-center mx-3 mt-2"
            onClick={() => {
              setShowColorPicker(true);
            }}
          >
            Change Background Color
          </button>
        )}

      {imageData &&
        uid &&
        isOwner &&
        imageData?.downloadUrl &&
        imageData?.downloadUrl.includes("googleapis.com") &&
        !imageData?.videoDownloadUrl && (
          <button
            className="btn-primary2 h-12 flex items-center justify-center mx-3 mt-2"
            onClick={() => {
              handleBackgroundRemove();
            }}
          >
            Remove Background
          </button>
        )}

      {showColorPicker && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-md shadow-md w-[90%] max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              Select a Background Color
            </h2>
            <input
              type="color"
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              className="w-full mb-4 h-10"
            />
            <div className="flex justify-end">
              <button
                className="btn-secondary mr-2"
                onClick={() => setShowColorPicker(false)}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={() => {
                  setShowColorPicker(false);
                  changeBackground(selectedColor);
                }}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {imageData && !isOwner && (
        <button
          className="btn-primary2 h-12 flex items-center justify-center mx-3"
          onClick={() => {
            router.push("/generate");
          }}
        >
          Next: Generate Your Image
        </button>
      )}
      {(imageData?.videoDownloadUrl && getFileTypeFromUrl(imageData?.videoDownloadUrl) != "gif") && <div className="p-2">
        <button onClick={async () => {
          try {
            setLoading(true);
            const response = await processVideoToGIF(imageData?.videoDownloadUrl, id, uid);
            setLoading(false);
            toast.success(`GIF Created Successfully!`);
            router.push(`${response}`);
          } catch (error: unknown) {
            if (error instanceof Error) {
              toast.error(`${error.message}`);
            } else {
              toast.error(`An unexpected error occurred.`);
            }
          }

        }} className="btn-primary2  flex h-12 items-center justify-center  w-full  " disabled={loading}>
          {loading ? <span className="flex flex-row  items-center space-x-2">
            <span className="rotating-icon">
              <SiStagetimer />
            </span> <span> Converting ... </span>

          </span> : <span> Create GIF </span>}
        </button>

      </div>}
      {!imageData?.videoDownloadUrl && uid && isOwner && (
        <button
          className="btn-primary2 h-12 flex items-center justify-center mx-3"
          onClick={() => {
            if (imageData) {
              const {
                freestyle,
                style,
                model,
                colorScheme,
                lighting,
                tags,
                imageReference,
                imageCategory,
                perspective,
                composition,
                medium,
                mood,
              } = imageData;

              const addQueryParam = (key: string, value: string | string[] | undefined) => {
                if (value) {
                  if (Array.isArray(value)) {
                    return `${key}=${encodeURIComponent(value.join(","))}`;
                  }
                  return `${key}=${encodeURIComponent(value)}`;
                }
                return null;
              };

              const queryParams = [
                addQueryParam("freestyle", freestyle),
                addQueryParam("style", style),
                addQueryParam("model", model),
                addQueryParam("color", colorScheme),
                addQueryParam("lighting", lighting),
                addQueryParam("tags", tags),
                addQueryParam("imageReference", imageReference),
                addQueryParam("imageCategory", imageCategory),
                addQueryParam("perspective", perspective),
                addQueryParam("composition", composition),
                addQueryParam("medium", medium),
                addQueryParam("mood", mood),
              ].filter(Boolean);

              if (queryParams.length > 0) {
                const queryString = queryParams.join("&");
                router.push(`/generate?${queryString}`);
              } else {
                console.warn("No valid parameters to pass in the URL");
              }
            } else {
              console.warn("imageData is not available");
            }
          }}
        >
          Try again
        </button>
      )}

      {imageData?.videoDownloadUrl && uid && isOwner && (
        <button
          className="btn-primary2 h-12 flex items-center justify-center mx-3"
          onClick={() => {
            setIsModalOpen(true)
          }}
        >
          Try again
        </button>
      )}

      {showPasswordModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-md shadow-md w-[90%] max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              Make Sharable with Password (Optional)
            </h2>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password (optional)"
              className="w-full p-2 border rounded mb-4"
            />
            <div className="flex justify-end">
              <button
                className="btn-secondary mr-2"
                onClick={() => setShowPasswordModal(false)}
              >
                Cancel
              </button>
              <button className="btn-primary" onClick={toggleSharable}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      <canvas ref={canvasRef} className="hidden" />
      <br />

      {isModalOpen && (
        <ModalComponent
          imageData={{ ...imageData }}
          isOpen={isModalOpen}
          onRequestClose={closeModal}
          downloadUrl={imageData?.downloadUrl}
          ariaHideApp={false}
          initialData={imageData?.videoDownloadUrl && imageData}
        />
      )}
    </div>
  );
};

export default ImagePage;
