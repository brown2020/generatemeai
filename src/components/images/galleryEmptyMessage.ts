export type GalleryEmptyMessage = {
  title: string;
  body: string;
};

/** A filtered gallery is not an empty account. Say which one the user is looking at. */
export function galleryEmptyMessage(hasAnyImages: boolean): GalleryEmptyMessage {
  if (hasAnyImages) {
    return {
      title: "No matching images",
      body: "Nothing matches this search or filter. Clear them to see your gallery.",
    };
  }

  return {
    title: "No images yet",
    body: "Generate your first image to get started!",
  };
}
