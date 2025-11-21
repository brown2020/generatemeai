import Footer from "@/components/Footer";
import HomePage from "@/components/HomePage";
import { adminDb } from "@/firebase/firebaseAdmin";

async function getPublicImages() {
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
}

export const revalidate = 3600; // Revalidate every hour

export default async function Home() {
  const images = await getPublicImages();

  return (
    <>
      <HomePage initialImages={images} />
      <Footer />
    </>
  );
}
