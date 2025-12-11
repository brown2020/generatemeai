import { useState, useCallback, useRef } from "react";
import type {
  SpeechRecognition,
  SpeechRecognitionEvent,
  SpeechRecognitionErrorEvent,
} from "@/types/speech-recognition";

/**
 * Gets the SpeechRecognition constructor from the window object.
 * Handles vendor-prefixed versions (webkit).
 */
const getSpeechRecognition = (): (new () => SpeechRecognition) | null => {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
};

/**
 * Hook for browser speech recognition functionality.
 * Provides recording state and controls for voice-to-text conversion.
 *
 * @param onTranscript - Callback fired with the recognized text
 * @returns Recording state and control functions
 */
export const useSpeechRecognition = (onTranscript: (text: string) => void) => {
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const startRecording = useCallback(() => {
    const SpeechRecognitionClass = getSpeechRecognition();

    if (!SpeechRecognitionClass) {
      console.error("Speech recognition not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognitionClass();
    recognition.lang = "en-US";
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = event.results[0]?.[0];
      if (result?.transcript) {
        onTranscript(result.transcript);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("Speech recognition error:", event.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [onTranscript]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  }, []);

  return { isRecording, startRecording, stopRecording };
};
