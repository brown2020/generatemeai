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
import { animate } from "@/actions/animate";
import { useAuthStore } from "@/zustand/useAuthStore";
import toast from "react-hot-toast";
import { X, Sparkle, Plus } from "lucide-react";
import domtoimage from "dom-to-image";
import { useRouter } from "next/navigation";
import TextareaAutosize from "react-textarea-autosize";
import { suggestTags } from "@/actions/suggestTags";
import useProfileStore from "@/zustand/useProfileStore";
import { creditsToMinus } from "@/utils/credits";

interface DidResponse {
  kind: string;
  description: string;
  id: string;
}

interface ResultResponse {
  error?: { description: string };
  message?: string;
  result_url?: string;
}

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
  const [animateLoading, setAnimateLoading] = useState<boolean>(false);
  const didAPIkey = useProfileStore((s) => s.profile.did_api_key);
  const openAPIKey =
    useProfileStore((s) => s.profile.openai_api_key) ||
    process.env.OPENAI_API_KEY!;
  const briaApiKey =
    useProfileStore((s) => s.profile.bria_api_key) ||
    process.env.BRIA_AI_API_KEY!;
  const useCredits = useProfileStore((s) => s.profile.useCredits);
  const credits = useProfileStore((s) => s.profile.credits);
  const minusCredits = useProfileStore((state) => state.minusCredits);

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

  const handleAnimate = async () => {
    setAnimateLoading(true)
    try {
      if (!imageData || !uid) return;

      const imageUrls = imageData.downloadUrl;
      const result = await animate(imageUrls, useCredits, didAPIkey);

      if (result?.error) {
        console.error("Animation error:", result.error);
        toast.error(`Failed animating the image: ${result.error}`);
        setAnimateLoading(false)
        return;
      }

      const resultUrl = result.result_url;

      if (resultUrl) {
        await minusCredits(creditsToMinus("d-id"))

        const docRef = uid
          ? doc(db, "profiles", uid, "covers", id)
          : doc(db, "publicImages", id);

        await updateDoc(docRef, { videoDownloadUrl: resultUrl });

        setImageData((prevData: any) => ({
          ...prevData,
          videoDownloadUrl: resultUrl,
        }));
        setAnimateLoading(false)
        toast.success("Video animation created and saved successfully!");
      }
    } catch (error) {
      console.error("Error during animation:", error);
      setAnimateLoading(false)
      toast.error("Error creating the video animation.");
    }
  };

  const handleDownload = async () => {
    if (imageData?.videoDownloadUrl) {
      const videoUrl = imageData.videoDownloadUrl;
      const currentDate = new Date().toISOString().split("T")[0];
      const fileName = `${imageData?.freestyle}_${currentDate}.mp4`;

      const link = document.createElement("a");
      link.href = videoUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
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
      const videoScript = imageData?.scriptPrompt;
      const color = imageData?.color;
      const lighting = imageData?.lighting;
      const style = imageData?.style;
      const imageCategory = imageData?.imageCategory;

      let suggestions = await suggestTags(
        freestyle,
        videoScript,
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

  const removeBackground = async () => {
    const imageUrl = imageData?.downloadUrl;

    const formData = new FormData();
    formData.append(
      "file",
      await fetch(imageUrl).then((res) => res.blob()),
      "image.png"
    );

    try {
      const result = await fetch(
        "https://engine.prod.bria-api.com/v1/background/remove",
        {
          method: "POST",
          headers: {
            api_token: briaApiKey,
          },
          body: formData,
        }
      );

      if (result.ok) {
        if (useCredits) {
          minusCredits(creditsToMinus("bria.ai"));
        }

        const bgRemovedImageUrl = (await result.json())?.result_url;

        const docRef = uid
          ? doc(db, "profiles", uid, "covers", id)
          : doc(db, "publicImages", id);

        await updateDoc(docRef, {
          downloadUrl: bgRemovedImageUrl,
        });

        setRefreshCounter(refreshCounter + 1);

        toast.success("Background removed successfully!");
      } else {
        throw new Error("Failed to remove background via Bria API");
      }
    } catch (error) {
      console.error("Error removing background:", error);
      toast.error("Failed to remove background.");
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
    <div className="flex flex-col w-full max-w-4xl mx-auto h-full gap-2">
      {imageData && (
        <div
          className="relative inline-block"
          id="image-container"
          style={{ backgroundColor: backgroundColor }}
        >
          {imageData?.videoDownloadUrl ? (
            <video
              className="block h-full w-full object-cover"
              src={imageData.videoDownloadUrl}
              controls
              height={512}
              width={512}
            >
              Your browser does not support the video tag.
            </video>
          ) : (
            <img
              className="block h-full w-full object-cover"
              src={imageData?.downloadUrl}
              alt="Visual Result"
              height={512}
              width={512}
            />
          )}

          {caption && (
            <div className="absolute inset-0 flex items-end justify-center cursor-default">
              <div className="bg-[#000] bg-opacity-50 text-white text-xl md:text-3xl rounded-md text-center mb-4 h-[40%] md:h-[30%] w-[90%] md:w-[80%] overflow-hidden flex justify-center items-center select-none">
                {caption}
              </div>
            </div>
          )}
        </div>
      )}

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

      {imageData && (
        <button
          className="btn-primary2 h-12 flex items-center justify-center mx-3"
          onClick={handleDownload}
        >
          Download
        </button>
      )}
      {uid && isOwner && (
        <button
          className="btn-primary2 h-12 flex items-center justify-center mx-3 mt-2"
          onClick={() => {
            if (isSharable) {
              toggleSharable();
              return;
            }
            setShowPasswordModal(true);
          }}
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

      {
        (!imageData?.videoDownloadUrl) && uid && isOwner && (
          <button
            className="btn-primary2 h-12 flex items-center justify-center mx-3 disabled:bg-gray-200 disabled:hover:bg-gray-200"
            disabled={animateLoading}
            onClick={handleAnimate}
          >
            {animateLoading ? 'Animating . . .' : 'Animate'}
          </button>
        )
      }

      {imageData && (
        <div className="mt-4 p-3 py-0">
          <h2 className="text-2xl mb-3 font-bold">Metadata: </h2>
          {imageData?.freestyle && (
            <p>
              <strong>Freestyle:</strong> {imageData?.freestyle}
            </p>
          )}
          {/* {imageData?.prompt && <p><strong>Prompt:</strong> {imageData?.prompt}</p>} */}
          {imageData?.style && (
            <p>
              <strong>Style:</strong> {imageData?.style}
            </p>
          )}
          {imageData?.model && (
            <p>
              <strong>Model:</strong> {imageData?.model}
            </p>
          )}
          {imageData?.videoModel && (
            <p>
              <strong>Video Model:</strong> {imageData?.videoModel}
            </p>
          )}
          {imageData?.audio && (
            <p>
              <strong>Audio:</strong> {imageData?.audio}
            </p>
          )}
          {imageData?.colorScheme && (
            <p>
              <strong>Color:</strong> {imageData?.colorScheme}
            </p>
          )}
          {imageData?.lighting && (
            <p>
              <strong>Lighting:</strong> {imageData?.lighting}
            </p>
          )}
          {imageData?.imageReference && (
            <p>
              <strong>Image Reference Used: </strong>{" "}
              <img
                className="w-32 h-32 object-cover rounded-md border-2 border-black-600"
                src={imageData?.imageReference}
                alt="image reference used"
              ></img>
            </p>
          )}
          {imageData?.imageCategory && (
            <p>
              <strong>Category:</strong> {imageData?.imageCategory}
            </p>
          )}
          {imageData?.timestamp?.seconds && (
            <p>
              <strong>Timestamp:</strong>{" "}
              {new Date(imageData?.timestamp.seconds * 1000).toLocaleString()}
            </p>
          )}
          {imageData?.scriptPrompt && (
            <p>
              <strong>Script: </strong>
              {imageData?.scriptPrompt}
            </p>
          )}
          {uid && isOwner && (
            <div className="mt-4 overflow-x-scroll w-full">
              <h3 className="text-xl mb-3 font-semibold text-gray-800">
                Tags:
              </h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {tags.map((tag, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-gray-200 border border-gray-400 rounded-md px-3 py-1 transition hover:bg-gray-300"
                  >
                    <span className="text-gray-700">{tag}</span>
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="text-gray-500 hover:text-red-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex items-center">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add new tag"
                  className="p-2 py-[0.58rem] border border-gray-300 rounded-l-md focus:outline-none focus:drop-shadow-none focus:shadow-none"
                />
                <button
                  onClick={() => handleAddTag()}
                  className="px-5 md:px-2 h-[2.76rem] mt-0 text-sm btn-primary2 rounded-none rounded-r-lg"
                >
                  Add <Plus />
                </button>
                <button
                  className="ml-2 flex items-center px-3 py-2 text-sm rounded-full border border-blue-500 text-blue-500 hover:bg-blue-100 transition"
                  onClick={handleSuggestions}
                >
                  <Sparkle className="mr-1" /> Suggestions
                </button>
              </div>
            </div>
          )}
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
              removeBackground();
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

      {imageData && uid && isOwner && (
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
                videoModel,
                audio,
                scriptPrompt,
              } = imageData;

              const addQueryParam = (key: string, value: string) => {
                if (value) {
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
                addQueryParam("tags", tags.join(",")),
                addQueryParam("imageReference", imageReference),
                addQueryParam("imageCategory", imageCategory),
                addQueryParam("videoModel", videoModel),
                addQueryParam("audio", audio),
                addQueryParam("scriptPrompt", scriptPrompt),
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
    </div>
  );
};

export default ImagePage;
