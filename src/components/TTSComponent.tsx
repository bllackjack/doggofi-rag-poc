// components/TTSComponent.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis';// Import your custom hook

interface TTSComponentProps {
  initialText?: string;
}

export default function TTSComponent({ initialText = '' }: TTSComponentProps) {
  const [text, setText] = useState(initialText);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>('');
  const [rate, setRate] = useState<number>(1);
  const [pitch, setPitch] = useState<number>(1);
  const [volume, setVolume] = useState<number>(1);

  const { voices, speak, cancel, pause, resume, speaking, paused, supported } = useSpeechSynthesis();

  // Set a default voice once voices are loaded
  useEffect(() => {
    if (voices.length > 0 && !selectedVoiceName) {
      const defaultVoice = voices.find(v => v.default) || voices[0];
      if (defaultVoice) {
        setSelectedVoiceName(defaultVoice.name);
      }
    }
  }, [voices, selectedVoiceName]);

  const handleSpeak = () => {
    speak(text, selectedVoiceName, rate, pitch, volume);
  };

  if (!supported) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-md max-w-xl mx-auto mt-8">
        <p>Text-to-Speech is not supported in your browser. Please try a modern browser like Chrome, Firefox, Edge, or Safari.</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-8">
      <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">Browser Text-to-Speech</h2>

      <div className="mb-4">
        <label htmlFor="tts-text" className="block text-gray-700 text-sm font-bold mb-2">
          Text to Speak:
        </label>
        <textarea
          id="tts-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text here..."
          rows={5}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline resize-y"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="voice-select" className="block text-gray-700 text-sm font-bold mb-2">
            Select Voice:
          </label>
          <select
            id="voice-select"
            value={selectedVoiceName}
            onChange={(e) => setSelectedVoiceName(e.target.value)}
            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            {voices.length === 0 ? (
              <option value="">Loading voices...</option>
            ) : (
              voices.map((voice) => (
                <option key={voice.name} value={voice.name}>
                  {voice.name} ({voice.lang}) {voice.default ? '(Default)' : ''}
                </option>
              ))
            )}
          </select>
        </div>

        <div>
          <label htmlFor="rate-input" className="block text-gray-700 text-sm font-bold mb-2">
            Rate: {rate.toFixed(1)} (0.1 - 10)
          </label>
          <input
            id="rate-input"
            type="range"
            min="0.1"
            max="10"
            step="0.1"
            value={rate}
            onChange={(e) => setRate(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-lg accent-blue-500"
          />
        </div>

        <div>
          <label htmlFor="pitch-input" className="block text-gray-700 text-sm font-bold mb-2">
            Pitch: {pitch.toFixed(1)} (0 - 2)
          </label>
          <input
            id="pitch-input"
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={pitch}
            onChange={(e) => setPitch(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-lg accent-blue-500"
          />
        </div>

        <div>
          <label htmlFor="volume-input" className="block text-gray-700 text-sm font-bold mb-2">
            Volume: {volume.toFixed(1)} (0 - 1)
          </label>
          <input
            id="volume-input"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-lg accent-blue-500"
          />
        </div>
      </div>

      <div className="flex justify-center gap-4">
        <button
          onClick={handleSpeak}
          disabled={speaking || !text.trim()}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors"
        >
          {speaking ? 'Speaking...' : 'Speak'}
        </button>
        <button
          onClick={pause}
          disabled={!speaking || paused}
          className="bg-yellow-500 text-white px-6 py-3 rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors"
        >
          Pause
        </button>
        <button
          onClick={resume}
          disabled={!speaking || !paused}
          className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors"
        >
          Resume
        </button>
        <button
          onClick={cancel}
          disabled={!speaking && !paused}
          className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors"
        >
          Stop
        </button>
      </div>
    </div>
  );
}