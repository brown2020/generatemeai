import { beforeEach, describe, expect, it, vi } from "vitest";
import { memory } from "@/test/memoryFirestore";
import { PUBLIC_IMAGES_TAG } from "@/constants/cacheTags";
import { FirestorePaths } from "@/firebase/paths";

const deleted = vi.hoisted(() => ({
  prefixes: [] as string[],
  files: [] as string[],
  users: [] as string[],
}));
const revalidateTag = vi.hoisted(() => vi.fn());

vi.mock("@/firebase/firebaseAdmin", async () => {
  const { memory: store } = await import("@/test/memoryFirestore");
  return {
    adminDb: store.adminDb,
    adminAuth: {
      deleteUser: async (uid: string) => {
        deleted.users.push(uid);
      },
    },
    adminBucket: {
      deleteFiles: async ({ prefix }: { prefix: string }) => {
        deleted.prefixes.push(prefix);
      },
      file: (objectPath: string) => ({
        delete: async () => {
          deleted.files.push(objectPath);
        },
      }),
    },
  };
});

vi.mock("@/utils/serverAuth", () => ({
  authenticateAction: async () => "user-a",
  getAuthContext: async () => ({ uid: "user-a", emailVerified: true }),
}));

vi.mock("next/cache", () => ({ revalidateTag }));

import { DELETE as deleteProfile } from "@/app/api/profile/route";

describe("account deletion", () => {
  beforeEach(() => {
    memory.reset();
    deleted.prefixes = [];
    deleted.files = [];
    deleted.users = [];
    revalidateTag.mockReset();
  });

  it("removes gallery data, storage, the public cache, and the auth user", async () => {
    memory.docs.set(FirestorePaths.userProfile("user-a"), { credits: 10 });
    memory.docs.set(FirestorePaths.user("user-a"), { email: "a@example.com" });
    memory.docs.set(FirestorePaths.profileCover("user-a", "img-1"), {
      downloadUrl: "https://storage.googleapis.com/bucket/generated/user-a/a.png",
      videoDownloadUrl: "https://storage.googleapis.com/bucket/video-generation/legacy.gif",
    });
    memory.docs.set(FirestorePaths.publicImage("img-1"), { downloadUrl: "https://example.com/a.png" });
    memory.docs.set(FirestorePaths.userPayment("user-a", "pi_1"), { status: "succeeded" });
    memory.docs.set("users/user-a/rateLimit/generation", { count: 1, windowStart: 1 });

    const response = await deleteProfile();
    expect(response.status).toBe(200);
    expect(memory.docs.has(FirestorePaths.userProfile("user-a"))).toBe(false);
    expect(memory.docs.has(FirestorePaths.profileCover("user-a", "img-1"))).toBe(false);
    expect(memory.docs.has(FirestorePaths.publicImage("img-1"))).toBe(false);
    expect(memory.docs.has(FirestorePaths.userPayment("user-a", "pi_1"))).toBe(false);
    expect(memory.docs.has("users/user-a/rateLimit/generation")).toBe(false);
    expect(deleted.prefixes).toEqual([
      "generated/user-a/",
      "image-references/user-a/",
      "video-generation/user-a/",
    ]);
    expect(deleted.files).toContain("video-generation/legacy.gif");
    expect(deleted.users).toEqual(["user-a"]);
    expect(revalidateTag).toHaveBeenCalledWith(PUBLIC_IMAGES_TAG, { expire: 0 });
  });
});
