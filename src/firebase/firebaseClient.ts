import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_APIKEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTHDOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECTID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGEBUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGINGSENDERID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APPID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENTID,
};

/** True when public Firebase web config is present (false in CI without secrets). */
export const hasClientConfig = Boolean(firebaseConfig.apiKey?.trim());

let auth: Auth;

if (hasClientConfig) {
  auth = getAuth(getApps().length ? getApp() : initializeApp(firebaseConfig));
} else {
  // CI gate jobs / SSG without Actions secrets: skip module-level init so
  // prerender does not throw auth/invalid-api-key. Runtime without config
  // still fails on first auth use until NEXT_PUBLIC_FIREBASE_* is set.
  console.warn(
    "Firebase client config missing (NEXT_PUBLIC_FIREBASE_APIKEY); deferring init"
  );
  auth = null as unknown as Auth;
}

export { auth };
