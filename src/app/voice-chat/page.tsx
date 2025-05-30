'use client';

import { useEffect, useRef, useState } from 'react';
import { ChatMessage } from '@/interfaces/chat';
import { useChatHandler } from '@/hooks/useChatHandler';
import useSpeechToText from '@/hooks/useSpeechToText';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { SpeechOptions } from '@/interfaces/speech'; // Ensure this path is correct

export default function VoiceChatPage() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // We use this ref to ensure the bot doesn't speak the same message multiple times
  const lastSpokenBotMessage = useRef<string>('');

  // 1. Initialize Chat Handler
  const {
    messages,
    input,
    isLoading,
    streamingText,
    setInput,
    handleSubmit
  } = useChatHandler([
    { role: 'system', content: 'You are a helpful assistant.' }
  ]);

  // 2. Initialize Speech-to-Text
  const {
    transcript,
    listening,
    toggleListening,
    stopListening
  } = useSpeechToText({
    // Automatically update the chat input field with the transcribed speech
    onTranscriptChange: (text) => setInput(text)
  });

  // 3. Initialize Text-to-Speech
  const {
    speak,
    stop: stopSpeaking, // Renamed 'stop' to 'stopSpeaking' for clarity
    isSpeaking: ttsIsSpeaking, // Renamed 'isSpeaking' to 'ttsIsSpeaking' to avoid name collision
    voices,
    isSupported // Indicates if browser supports Speech Synthesis
  } = useTextToSpeech();

  // Find the best available English voice for consistent bot responses
  const englishVoice = voices.find(voice =>
    voice.lang.startsWith('en') &&
    voice.localService && // Prefer local voices for better performance/offline use
    voice.name.toLowerCase().includes('english')
  ) || voices.find(voice =>
    voice.lang.startsWith('en') // Fallback to any English voice
  );

  // Define speech options for the bot
  const speechOptions: SpeechOptions = {
    lang: 'en-US',
    pitch: 1,
    rate: 1,
    volume: 1,
    voiceURI: englishVoice?.voiceURI // Use the URI of the selected voice
  };

  // --- Core Effects for UI and Interaction ---

  // Auto-scroll to the bottom of the chat when new messages or streaming text appear
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText]);

  // Effect to make the bot speak its responses
  useEffect(() => {
    const lastBotMessage = messages[messages.length - 1];

    // Conditions to speak:
    // 1. There's a last message and it's from the assistant.
    // 2. The message content is new (not already spoken).
    // 3. The chat handler is not currently loading (meaning the full response is received).
    // 4. The Text-to-Speech is not already active.
    // 5. Speech Synthesis is supported and voices are available.
    if (
      lastBotMessage &&
      lastBotMessage.role === 'assistant' &&
      lastBotMessage.content !== lastSpokenBotMessage.current &&
      !isLoading &&
      !ttsIsSpeaking &&
      isSupported &&
      voices.length > 0
    ) {
      console.log('Bot is speaking:', lastBotMessage.content);
      stopSpeaking(); // Stop any ongoing speech before starting new
      speak({
        ...speechOptions,
        text: lastBotMessage.content,
      });
      lastSpokenBotMessage.current = lastBotMessage.content; // Update ref to mark message as spoken
    }
  }, [messages, isLoading, speak, stopSpeaking, ttsIsSpeaking, voices, englishVoice, isSupported, speechOptions]);

  // Cleanup effect: Stop all speech and listening when the component unmounts
  useEffect(() => {
    return () => {
      stopSpeaking();
      stopListening();
    };
  }, [stopSpeaking, stopListening]); // Dependencies ensure cleanup functions are always current

  // --- Event Handlers ---

  // Handles clicks on the main "Speak" button
  const handleToggleSpeech = () => {
    if (ttsIsSpeaking) {
      // If the bot is speaking, stop its speech
      console.log('User stopped bot speech.');
      stopSpeaking();
    } else if (listening) {
      // If the user's microphone is active, stop listening
      console.log('User stopped microphone input.');
      stopListening();
    } else {
      // Otherwise, start listening for user's speech
      console.log('User started microphone input.');
      toggleListening();
    }
  };

  // Handles clicking the '🔊' icon to replay a specific bot message
  const handleReplayMessage = (text: string) => {
    console.log('Replaying message:', text);
    if (isSupported && voices.length > 0) {
      stopSpeaking(); // Stop any current speech before replaying
      speak({
        ...speechOptions,
        text: text,
      });
    } else {
      console.warn('Cannot replay message: Speech synthesis not available or no voices.');
    }
  };

  // Filter out system messages from the display
  const displayedMessages = messages.filter((m: ChatMessage) => m.role !== 'system');

  return (
    <div className="min-h-screen bg-black text-white p-4 font-sans antialiased">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-400">Voice & Text Chat</h1>

        {/* Chat Messages Display Area */}
        <div className="bg-gray-900 rounded-xl p-4 mb-4 shadow-lg h-[60vh] overflow-y-auto custom-scrollbar">
          {displayedMessages.map((m: ChatMessage, i: number) => (
            <div
              key={i}
              className={`p-3 my-2 rounded-lg max-w-[85%] text-lg ${
                m.role === 'user'
                  ? 'bg-blue-600 text-white ml-auto rounded-br-none shadow-md'
                  : 'bg-gray-700 text-white mr-auto rounded-bl-none shadow-md'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <strong className="text-sm font-semibold opacity-80">{m.role === 'user' ? 'You' : 'Bot'}:</strong>
                {m.role === 'assistant' && (
                  <button
                    onClick={() => handleReplayMessage(m.content)}
                    className="text-xl text-blue-300 hover:text-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={ttsIsSpeaking} // Disable replay while bot is speaking
                    title="Replay message"
                  >
                    🔊
                  </button>
                )}
              </div>
              <div>{m.content}</div>
            </div>
          ))}
          {/* Display streaming text with a typing indicator */}
          {isLoading && streamingText && (
            <div className="p-3 my-2 rounded-lg bg-gray-700 text-white mr-auto rounded-bl-none max-w-[85%] shadow-md">
              <div className="flex items-center gap-2 mb-1">
                <strong className="text-sm font-semibold opacity-80">Bot:</strong>
                {ttsIsSpeaking && <span className="text-sm text-blue-300">🔊 Speaking...</span>}
              </div>
              <div>
                {streamingText}
                <span className="animate-pulse">▌</span> {/* Simple typing cursor */}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} /> {/* Invisible element to scroll to */}
        </div>

        {/* Input and Controls Area */}
        <div className="bg-gray-900 rounded-xl p-4 shadow-lg">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={listening ? "Listening..." : "Type your message or speak..."}
                className="flex-grow bg-gray-800 text-white text-lg rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                disabled={isLoading || ttsIsSpeaking} // Disable input when bot is processing or speaking
              />
              <button
                type="button"
                onClick={handleToggleSpeech}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-200 ease-in-out ${
                  listening || ttsIsSpeaking // Button visually indicates active listening or speaking
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                disabled={isLoading} // Disable while bot response is loading
              >
                {listening ? 'Stop Listening' : ttsIsSpeaking ? 'Stop Speaking' : 'Speak (Mic)'}
              </button>
              <button
                type="submit"
                disabled={isLoading || !input.trim() || ttsIsSpeaking} // Disable send if loading, input empty, or bot speaking
                className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send
              </button>
            </div>
            {/* Display the current speech-to-text transcript */}
            {transcript && (
              <div className="text-sm text-gray-400 mt-2 p-2 bg-gray-800 rounded-md">
                You said: <span className="font-medium text-gray-200">{transcript}</span>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}