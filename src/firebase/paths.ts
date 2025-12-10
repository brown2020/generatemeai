/**
 * Centralized Firestore document path utilities.
 * Use these to ensure consistent path construction across the codebase.
 */

export const FirestorePaths = {
  // User paths
  user: (uid: string) => `users/${uid}`,
  userProfile: (uid: string) => `users/${uid}/profile/userData`,
  userPayments: (uid: string) => `users/${uid}/payments`,
  userPayment: (uid: string, paymentId: string) =>
    `users/${uid}/payments/${paymentId}`,

  // Profile/covers paths (legacy naming)
  profileCovers: (uid: string) => `profiles/${uid}/covers`,
  profileCover: (uid: string, coverId: string) =>
    `profiles/${uid}/covers/${coverId}`,

  // Public images
  publicImages: () => "publicImages",
  publicImage: (id: string) => `publicImages/${id}`,
} as const;

/**
 * Collection names for use with Firestore collection() function
 */
export const FirestoreCollections = {
  users: "users",
  profiles: "profiles",
  publicImages: "publicImages",
} as const;

/**
 * Storage bucket paths
 */
export const StoragePaths = {
  generated: (uid: string, filename: string) => `generated/${uid}/${filename}`,
  imageReferences: (uid: string, filename: string) =>
    `image-references/${uid}/${filename}`,
  previews: (type: string, value: string, filename: string) =>
    `previews/${type}/${value}/${filename}`,
} as const;
