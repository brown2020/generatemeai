declare global {
  interface Window {
    SpeechRecognition: typeof window.SpeechRecognition;
    webkitSpeechRecognition: typeof window.SpeechRecognition;
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
  }

  // Extend the Navigator interface
  interface Navigator {
    standalone?: boolean;
  }

  // Use the global type for SpeechRecognition
  type SpeechRecognition = typeof window.SpeechRecognition;
}

export {};
