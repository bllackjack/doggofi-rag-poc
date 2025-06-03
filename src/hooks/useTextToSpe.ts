// hooks/useTextToSpeech.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { SpeechOptions } from '@/interfaces/speech';

export function useTextToSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  // Add isSupported state, initialized based on browser support
  const [isSupported, setIsSupported] = useState<boolean>(false);

  useEffect(() => {
    // Check for speech synthesis support when the component mounts
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true);

      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        console.log('Available voices:', availableVoices);
        setVoices(availableVoices);
      };

      // Chrome loads voices asynchronously, so listen for changes
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
      // Load voices immediately in case they are already available
      loadVoices();
    } else {
      console.warn('Speech Synthesis not supported in this browser.');
      setIsSupported(false);
    }
  }, []); // Empty dependency array means this runs once on mount

  const speak = useCallback(({ text, lang = 'en-US', pitch = 1, rate = 1, volume = 1, voiceURI }: SpeechOptions) => {
    // If not supported, log an error and return
    if (!isSupported) {
      console.error('Speech Synthesis not supported, cannot speak.');
      return;
    }

    // Cancel any ongoing speech to prevent overlap
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.pitch = pitch;
    utterance.rate = rate;
    utterance.volume = Math.min(Math.max(volume, 0), 1); // Ensure volume is between 0 and 1

    // Try to find a suitable voice
    if (voices.length > 0) {
      // Prioritize the requested voiceURI if provided
      if (voiceURI) {
        const selectedVoice = voices.find(voice => voice.voiceURI === voiceURI);
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
      }

      // If no specific voice found or requested, try to find a voice matching the language
      if (!utterance.voice) {
        const matchingVoice = voices.find(voice => voice.lang.startsWith(lang.split('-')[0]));
        if (matchingVoice) {
          utterance.voice = matchingVoice;
        }
      }
    }

    // Set up event handlers for the utterance
    utterance.onstart = () => {
      console.log('Speech started:', text);
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      console.log('Speech ended');
      setIsSpeaking(false);
    };

    utterance.onerror = (event) => {
      console.error('Speech error:', event);
      setIsSpeaking(false);
    };

    // Speak the text
    try {
      window.speechSynthesis.speak(utterance);
      console.log('Speech synthesis initiated');
    } catch (error) {
      console.error('Error starting speech:', error);
      setIsSpeaking(false);
    }
  }, [voices, isSupported]); // Add isSupported to dependencies

  const stop = useCallback(() => {
    if (isSupported && window.speechSynthesis) { // Only try to stop if supported
      console.log('Stopping speech');
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [isSupported]); // Add isSupported to dependencies

  return {
    isSpeaking,
    speak,
    stop,
    voices,
    isSupported // Expose the isSupported flag
  };
}