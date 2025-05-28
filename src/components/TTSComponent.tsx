// components/TTSPlayer.tsx
'use client';

import React, { useState } from 'react';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';

export default function TTSPlayer() {
  const [text, setText] = useState('Hello, this is a test of the simplified browser Text-to-Speech.');
  const { speak, cancel, speaking, supported } = useSpeechSynthesis();

  const handleSpeak = () => {
    speak(text);
  };

  const handleStop = () => {
    cancel();
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
      <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">Text-to-Speech</h2>

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

      <div className="flex justify-center gap-4">
        <button
          onClick={handleSpeak}
          disabled={speaking || !text.trim()}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors"
        >
          {speaking ? 'Speaking...' : 'Speak'}
        </button>
        <button
          onClick={handleStop}
          disabled={!speaking}
          className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors"
        >
          Stop
        </button>
      </div>
    </div>
  );
}