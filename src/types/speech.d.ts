declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
  }
}

export {};
