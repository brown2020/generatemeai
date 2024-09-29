// utils/platform.ts
export function isIOSReactNativeWebView(): boolean {
  if (typeof window === "undefined") {
    return false; // Ensure this is only run client-side
  }

  const userAgent = window.navigator.userAgent || "";

  // Check if the device is running iOS
  const isIOS = /iPhone|iPad|iPod/i.test(userAgent);

  // Check if we are in a React Native WebView
  const isReactNativeWebView = typeof window.ReactNativeWebView !== "undefined";

  // Return true if it is iOS and in a React Native WebView
  return isIOS && isReactNativeWebView;
}
