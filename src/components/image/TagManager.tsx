"use client";

import { useState } from "react";
import { X, Plus, Sparkle, Tag } from "lucide-react";
import toast from "react-hot-toast";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/firebaseClient";
import { FirestorePaths } from "@/firebase/paths";
import { suggestTags } from "@/actions/suggestTags";
import { ImageData } from "@/types/image";

interface TagManagerProps {
  imageData: ImageData;
  tags: string[];
  setTags: (tags: string[]) => void;
  uid: string;
  imageId: string;
  openAPIKey: string;
  useCredits: boolean;
  credits: number;
  minusCredits: (amount: number) => Promise<boolean>;
}

/**
 * Component for managing tags on an image.
 */
export const TagManager = ({
  imageData,
  tags,
  setTags,
  uid,
  imageId,
  openAPIKey,
  useCredits,
  credits,
  minusCredits,
}: TagManagerProps) => {
  const [newTag, setNewTag] = useState("");

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
        ? doc(db, FirestorePaths.profileCover(uid, imageId))
        : doc(db, FirestorePaths.publicImage(imageId));

      await updateDoc(docRef, { tags: updatedTags });
      setTags(updatedTags as string[]);
      setNewTag("");
      if (showToast) toast.success("Tag added successfully");
    } catch (error) {
      if (showToast) {
        const msg = error instanceof Error ? error.message : "Unknown error";
        toast.error(`Error adding tag: ${msg}`);
      }
    }
  };

  const handleRemoveTag = async (tagToRemove: string) => {
    if (!imageData) return;

    try {
      const updatedTags = tags.filter((tag) => tag !== tagToRemove);
      const docRef = uid
        ? doc(db, FirestorePaths.profileCover(uid, imageId))
        : doc(db, FirestorePaths.publicImage(imageId));

      await updateDoc(docRef, { tags: updatedTags });
      setTags(updatedTags);
      toast.success("Tag removed successfully");
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Error removing tag: ${msg}`);
    }
  };

  const handleSuggestions = async () => {
    try {
      const result = await suggestTags(
        imageData?.freestyle || "",
        imageData?.colorScheme || "",
        imageData?.lighting || "",
        imageData?.style || "",
        imageData?.imageCategory || "",
        tags,
        openAPIKey,
        useCredits,
        credits
      );

      // Handle ActionResult response
      if (!result.success) {
        toast.error(result.error);
        return;
      }

      // Handle successful response
      const suggestions = result.data.split(",").map((s) => s.trim());
      if (suggestions.length >= 1) {
        if (useCredits) {
          await minusCredits(1);
        }
        await handleAddTag(false, suggestions);
        toast.success("Tags added successfully");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      toast.error(`Error adding tags: ${msg}`);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden p-6">
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
  );
};
