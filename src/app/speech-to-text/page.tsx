'use client';

import useSpeechToText from '@/hooks/useSpeechToText';

export default function SpeechToTextPage() {
  const { transcript, listening, toggleListening } = useSpeechToText();

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
