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

const restrictedWords = [
  "nude", "naked", "sexual", "explicit", "porn", "erotic", "provocative", 
  "seductive", "intimate", "lingerie", "underwear", "bikini", "strip", 
  "sex", "breasts", "genital", "vagina", "penis", "buttocks", "bare",
  "inappropriate", "obscene", "lewd"
];

export const checkRestrictedWords = (imagePrompt: string): boolean => {
  return restrictedWords.some(word => imagePrompt.toLowerCase().includes(word));
};
