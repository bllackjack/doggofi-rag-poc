// hooks/useSpeechSynthesis.ts
import { useState, useEffect, useCallback } from 'react';

// Define the shape of a voice for better type safety
interface Voice {
  name: string;
  lang: string;
  default: boolean;
}

interface UseSpeechSynthesisResult {
  voices: Voice[];
  speak: (text: string, voiceName?: string, rate?: number, pitch?: number, volume?: number) => void;
  cancel: () => void;
  pause: () => void;
  resume: () => void;
  speaking: boolean;
  paused: boolean;
  supported: boolean; // Indicates if SpeechSynthesis is supported by the browser
}

export const useSpeechSynthesis = (): UseSpeechSynthesisResult => {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [supported, setSupported] = useState(false);

  // Check if SpeechSynthesis API is available
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSupported(true);
      // Get voices when they are loaded (they might load asynchronously)
      const populateVoiceList = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices.map(v => ({
          name: v.name,
          lang: v.lang,
          default: v.default,
        })));
      };

      populateVoiceList();
      // Listen for voiceschanged event if voices load later
      window.speechSynthesis.onvoiceschanged = populateVoiceList;

      return () => {
        // Clean up event listener
        window.speechSynthesis.onvoiceschanged = null;
      };
    }
  }, []);

  const speak = useCallback(
    (text: string, voiceName?: string, rate: number = 1, pitch: number = 1, volume: number = 1) => {
      if (!supported || !text.trim()) {
        console.warn('SpeechSynthesis not supported or no text to speak.');
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);

      // Set voice
      if (voiceName) {
        const selectedVoice = voices.find(v => v.name === voiceName);
        if (selectedVoice) {
          utterance.voice = window.speechSynthesis.getVoices().find(v => v.name === voiceName) || null;
        }
      } else {
        // Fallback to default or first available voice if no specific voice is chosen
        const defaultVoice = window.speechSynthesis.getVoices().find(v => v.default) || window.speechSynthesis.getVoices()[0] || null;
        utterance.voice = defaultVoice;
      }

      // Set parameters
      utterance.rate = Math.max(0.1, Math.min(10, rate)); // 0.1 to 10
      utterance.pitch = Math.max(0, Math.min(2, pitch)); // 0 to 2
      utterance.volume = Math.max(0, Math.min(1, volume)); // 0 to 1

      utterance.onstart = () => {
        setSpeaking(true);
        setPaused(false);
      };

      utterance.onend = () => {
        setSpeaking(false);
        setPaused(false);
      };

      utterance.onerror = (event) => {
        console.error('SpeechSynthesisUtterance error:', event);
        setSpeaking(false);
        setPaused(false);
      };

      window.speechSynthesis.speak(utterance);
    },
    [supported, voices] // Recreate speak function if supported status or voices change
  );

  const cancel = useCallback(() => {
    if (supported) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      setPaused(false);
    }
  }, [supported]);

  const pause = useCallback(() => {
    if (supported && speaking && !paused) {
      window.speechSynthesis.pause();
      setPaused(true);
    }
  }, [supported, speaking, paused]);

  const resume = useCallback(() => {
    if (supported && speaking && paused) {
      window.speechSynthesis.resume();
      setPaused(false);
    }
  }, [supported, speaking, paused]);

  return {
    voices,
    speak,
    cancel,
    pause,
    resume,
    speaking,
    paused,
    supported,
  };
};