'use client';

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
}

import { useEffect, useRef, useState } from 'react';

export default function SttPage() {
  // State management
  const [transcript, setTranscript] = useState('');     // Stores the recognized speech text
  const [listening, setListening] = useState(false);    // Tracks if speech recognition is active
  const recognitionRef = useRef<SpeechRecognition | null>(null);  // Reference to SpeechRecognition instance

  useEffect(() => {
    // Initialize speech recognition only on client-side
    if (typeof window !== 'undefined') {
      // Get the appropriate SpeechRecognition constructor
      const SpeechRecognition =
        window.SpeechRecognition || (window as any).webkitSpeechRecognition;

      // Check browser support
      if (!SpeechRecognition) {
        alert("Your browser does not support Speech Recognition!");
        return;
      }

      // Create and configure speech recognition instance
      const recognition = new SpeechRecognition();
      recognition.continuous = true; // Keep listening until stopped
      recognition.interimResults = true; // Get results as user speaks
      recognition.lang = "en-US";
      recognition.lang = "en-GB"; // English (UK accent)
      recognition.lang = "en-IN"; // English (Indian accent)
      recognition.lang = "en-AU"; // English (Australian accent)
      // recognition.lang = "fr-FR"; // French (France)
      // recognition.lang = "es-ES"; // Spanish (Spain)
      // recognition.lang = "es-MX"; // Spanish (Mexico)         

      // Handle speech recognition results
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = "";
        // Process all results
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          finalTranscript += event.results[i][0].transcript;
        }
        setTranscript(finalTranscript);
      };

      // Handle speech recognition errors
      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Speech recognition error:", event.error);
        // Stop listening if no speech is detected
        if (event.error === "no-speech") {
          setListening(false);
        }
      };

      // Store recognition instance in ref
      recognitionRef.current = recognition;
    }
  }, []); // Empty dependency array means this runs once on mount

  // Toggle speech recognition on/off
  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      recognitionRef.current.start();
      setListening(true);
    }
  };

  return (
    <div className="p-10 min-h-screen bg-black text-white">
      <h1 className="text-4xl font-bold mb-4">Speech to Text (STT)</h1>

      {/* Toggle button for starting/stopping speech recognition */}
      <button
        onClick={toggleListening}
        className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        {listening ? 'Stop Listening' : 'Start Listening'}
      </button>

      {/* Text area to display recognized speech */}
      <textarea
        className="w-full mt-6 p-4 bg-gray-800 text-amber-100 rounded h-48"
        value={transcript}
        placeholder="Your speech will appear here..."
        readOnly
      />
    </div>
  );
}

