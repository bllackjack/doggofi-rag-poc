'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  SpeechRecognition,
  SpeechRecognitionEvent,
  SpeechRecognitionErrorEvent
} from '../interfaces/SpeechToText';

interface UseSpeechToTextOptions {
  onTranscriptChange?: (text: string) => void;
}

export default function useSpeechToText({ onTranscriptChange }: UseSpeechToTextOptions = {}) {
  const [transcript, setTranscript] = useState('');
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const updateTranscript = useCallback((text: string) => {
    setTranscript(text);
    if (onTranscriptChange) {
      onTranscriptChange(text);
    }
  }, [onTranscriptChange]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognitionConstructor =
        window.SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (!SpeechRecognitionConstructor) {
        alert("Your browser does not support Speech Recognition!");
        return;
      }

      const recognition = new SpeechRecognitionConstructor() as SpeechRecognition;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-IN';

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript;
        updateTranscript(transcript);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'no-speech') {
          setListening(false);
          updateTranscript('');
        }
      };

      recognition.onend = () => {
        setListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [updateTranscript]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && listening) {
      recognitionRef.current.stop();
      setListening(false);
      updateTranscript('');
    }
  }, [listening, updateTranscript]);

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) return;

    if (listening) {
      stopListening();
    } else {
      recognitionRef.current.start();
      setListening(true);
    }
  }, [listening, stopListening]);

  return {
    transcript,
    listening,
    toggleListening,
    stopListening
  };
}
