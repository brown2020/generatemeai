import { readFileSync } from "node:fs";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
} from "firebase/firestore";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

const emulatorHost = process.env.FIRESTORE_EMULATOR_HOST;

describe.skipIf(!emulatorHost)("firestore security rules", () => {
  let testEnv: RulesTestEnvironment;

  beforeAll(async () => {
    const [, portValue] = emulatorHost!.split(":");
    testEnv = await initializeTestEnvironment({
      projectId: "demo-generatemeai",
      firestore: {
        rules: readFileSync("firestore.rules", "utf8"),
        host: "127.0.0.1",
        port: Number(portValue),
      },
    });
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  beforeEach(async () => {
    await testEnv.clearFirestore();
  });

  it("lets the owner read their profile and cover, and denies everyone else", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      await setDoc(doc(db, "users/owner/profile/userData"), { credits: 40 });
      await setDoc(doc(db, "profiles/owner/covers/cover-1"), { caption: "owned" });
    });

    const owner = testEnv.authenticatedContext("owner").firestore();
    const profile = await assertSucceeds(getDoc(doc(owner, "users/owner/profile/userData")));
    expect(profile.data()).toEqual({ credits: 40 });
    const covers = await assertSucceeds(getDocs(collection(owner, "profiles/owner/covers")));
    expect(covers.docs.map((entry) => entry.id)).toEqual(["cover-1"]);

    const other = testEnv.authenticatedContext("other").firestore();
    await assertFails(getDoc(doc(other, "users/owner/profile/userData")));
    await assertFails(getDocs(collection(other, "profiles/owner/covers")));

    const anonymous = testEnv.unauthenticatedContext().firestore();
    await assertFails(getDoc(doc(anonymous, "profiles/owner/covers/cover-1")));
  });

  it("denies client writes, including a credit balance change", async () => {
    const owner = testEnv.authenticatedContext("owner").firestore();
    await assertFails(
      setDoc(doc(owner, "users/owner/profile/userData"), { credits: 999999 })
    );
    await assertFails(
      setDoc(doc(owner, "profiles/owner/covers/forged"), { caption: "forged" })
    );
    await assertFails(
      setDoc(doc(owner, "publicImages/forged"), { downloadUrl: "https://example.com/x" })
    );
  });

  it("denies public image reads and lists for anonymous and signed-in clients", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), "publicImages/shared"), {
        downloadUrl: "https://example.com/shared.png",
      });
    });

    for (const db of [
      testEnv.unauthenticatedContext().firestore(),
      testEnv.authenticatedContext("owner").firestore(),
    ]) {
      await assertFails(getDoc(doc(db, "publicImages/shared")));
      await assertFails(getDocs(collection(db, "publicImages")));
    }
  });
});
