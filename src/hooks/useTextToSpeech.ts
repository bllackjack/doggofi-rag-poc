// hooks/useSpeechSynthesis.ts
import { useState, useEffect, useCallback } from 'react';

// Define the shape of a voice for better type safety
interface Voice {
  name: string;
  lang: string;
  default: boolean;
}

interface UseSpeechSynthesisResult {
  speak: (text: string) => void; // Simplified: no voiceName, rate, pitch, volume args
  cancel: () => void;
  speaking: boolean;
  supported: boolean; // Indicates if SpeechSynthesis is supported by the browser
}

export const useSpeechSynthesis = (): UseSpeechSynthesisResult => {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);

  // --- Hardcoded Speech Parameters ---
  const DEFAULT_LANGUAGE_CODE = 'en-US';
  const PREFERRED_VOICE_NAME = 'Google US English'; // Example: Adjust to your preferred voice
  const DEFAULT_RATE = 1.0; // 0.1 to 10
  const DEFAULT_PITCH = 1.0; // 0 to 2
  const DEFAULT_VOLUME = 1.0; // 0 to 1
  // -----------------------------------

  // Check if SpeechSynthesis API is available and populate voices
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSupported(true);
      const populateVoiceList = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices.map(v => ({
          name: v.name,
          lang: v.lang,
          default: v.default,
        })));
      };

      populateVoiceList();
      window.speechSynthesis.onvoiceschanged = populateVoiceList;

      return () => {
        window.speechSynthesis.onvoiceschanged = null;
      };
    }
  }, []);

  const speak = useCallback(
    (text: string) => { // Removed optional parameters
      if (!supported || !text.trim()) {
        console.warn('SpeechSynthesis not supported or no text to speak.');
        return;
      }

      // If already speaking, cancel current speech before starting new one
      if (speaking) {
        window.speechSynthesis.cancel();
      }

      const utterance = new SpeechSynthesisUtterance(text);

      // Select voice based on preferred name or default
      const selectedVoice = voices.find(v => v.name === PREFERRED_VOICE_NAME && v.lang.startsWith(DEFAULT_LANGUAGE_CODE)) ||
                             voices.find(v => v.default && v.lang.startsWith(DEFAULT_LANGUAGE_CODE)) ||
                             voices.find(v => v.lang.startsWith(DEFAULT_LANGUAGE_CODE)) ||
                             voices[0] || // Fallback to first available voice
                             null;

      if (selectedVoice) {
        utterance.voice = window.speechSynthesis.getVoices().find(v => v.name === selectedVoice.name && v.lang === selectedVoice.lang) || null;
      } else {
          console.warn(`Preferred voice "${PREFERRED_VOICE_NAME}" not found. Using default or first available.`);
      }

      // Set hardcoded parameters
      utterance.rate = DEFAULT_RATE;
      utterance.pitch = DEFAULT_PITCH;
      utterance.volume = DEFAULT_VOLUME;
      utterance.lang = DEFAULT_LANGUAGE_CODE; // Ensure correct language is set

      utterance.onstart = () => {
        setSpeaking(true);
      };

      utterance.onend = () => {
        setSpeaking(false);
      };

      utterance.onerror = (event) => {
        console.error('SpeechSynthesisUtterance error:', event);
        setSpeaking(false);
      };

      window.speechSynthesis.speak(utterance);
    },
    [supported, voices, speaking] // Recreate speak function if supported status, voices, or speaking state changes
  );

  const cancel = useCallback(() => {
    if (supported) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    }
  }, [supported]);



  return {
    speak,
    cancel,
    speaking,
    supported,
  };
};