import admin from "firebase-admin";
import { getApps } from "firebase-admin/app";
import type { Firestore } from "firebase-admin/firestore";
import type { Auth } from "firebase-admin/auth";
import type { Bucket } from "@google-cloud/storage";

const privateKey = process.env.FIREBASE_PRIVATE_KEY;
const projectId = process.env.FIREBASE_PROJECT_ID?.trim();

const adminCredentials = {
  type: process.env.FIREBASE_TYPE,
  projectId,
  privateKeyId: process.env.FIREBASE_PRIVATE_KEY_ID,
  privateKey: privateKey ? privateKey.replace(/\\n/g, "\n") : undefined,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  clientId: process.env.FIREBASE_CLIENT_ID,
  authUri: process.env.FIREBASE_AUTH_URI,
  tokenUri: process.env.FIREBASE_TOKEN_URI,
  authProviderX509CertUrl: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
  clientCertsUrl: process.env.FIREBASE_CLIENT_CERTS_URL,
};

/** True when server service-account env is present. */
export const hasAdminConfig = Boolean(
  projectId && adminCredentials.clientEmail && adminCredentials.privateKey
);

let adminBucket: Bucket;
let adminDb: Firestore;
let adminAuth: Auth;

if (hasAdminConfig) {
  try {
    if (!getApps().length) {
      admin.initializeApp({
        credential: admin.credential.cert(adminCredentials as admin.ServiceAccount),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGEBUCKET,
      });
    }
    adminBucket = admin.storage().bucket();
    adminDb = admin.firestore();
    adminAuth = admin.auth();
  } catch (e) {
    console.warn("Firebase Admin initialization failed (expected in build):", e);
    adminBucket = {} as Bucket;
    adminDb = {} as Firestore;
    adminAuth = {} as Auth;
  }
} else {
  console.warn(
    "Firebase Admin config missing; skipping init (expected in CI without secrets)"
  );
  adminBucket = {} as Bucket;
  adminDb = {} as Firestore;
  adminAuth = {} as Auth;
}

export { adminBucket, adminDb, adminAuth, admin };
