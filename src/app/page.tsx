import { unstable_cache } from "next/cache";
import HomePage from "@/components/HomePage";
import { PageWithFooter } from "@/components/layouts/PageWithFooter";
import { adminDb } from "@/firebase/firebaseAdmin";

/**
 * Fetches public images with caching for better performance.
 * Uses unstable_cache for fine-grained cache control.
 */
const getPublicImages = unstable_cache(
  async () => {
    try {
      const snapshot = await adminDb
        .collection("publicImages")
        .orderBy("timestamp", "desc")
        .limit(30)
        .get();

      const filteredImages = snapshot.docs.filter((doc) => {
        const data = doc.data();
        return !data.password || data.password === "";
      });

      const images = filteredImages.map(
        (doc) => doc.data().downloadUrl as string
      );

      // Return at least 15 if possible, or whatever we have
      return images.slice(0, 15);
    } catch (error) {
      console.error("Error fetching images:", error);
      return [];
    }
  },
  ["public-images"],
  { revalidate: 3600, tags: ["public-images"] }
);

export default async function Home() {
  const images = await getPublicImages();

  return (
    <PageWithFooter withPadding={false}>
      <HomePage initialImages={images} />
    </PageWithFooter>
  );
}
