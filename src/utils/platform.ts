// utils/platform.ts
export function isIOSReactNativeWebView(): boolean {
  if (typeof window === "undefined") {
    return false; // Ensure this is only run client-side
  }

  // Check if we are in a React Native WebView
  const isReactNativeWebView = typeof window.ReactNativeWebView !== "undefined";

  // Return trueif in a React Native WebView
  return isReactNativeWebView;
}
