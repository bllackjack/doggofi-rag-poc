'use client';

import React, { useState, FormEvent, useEffect, useRef }
 from 'react';
import { useChatbot } from  '@/hooks/useChatbot'
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import useSpeechToText from '@/hooks/useSpeechToText';

export default function ChatPage() {

    const lastSpokenMessageId = useRef<number | null>(null);
  const { messages, isLoading, error, sendMessage, resetChat } = useChatbot();
  const {
    transcript,
    listening,
    toggleListening,
    stopListening
  } = useSpeechToText();

  const { speak,
    cancel,
    speaking,
    supported}=useSpeechSynthesis();

  const [input, setInput] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (listening) {
        stopListening();
      }
      if(!speaking){
        cancel();
      }
    await sendMessage(input);
    setInput(''); 
  };

  useEffect(() => {
    if (transcript && (listening || !listening && input !== transcript)) {
      setInput(transcript);
    }
    
  }, [transcript, listening]); 

  useEffect(() => {
    if (supported && messages.length > 0) {
      const lastMessage = messages[messages.length - 1]; 
      if (lastMessage.sender === 'ai' && lastMessage.id !== lastSpokenMessageId.current) {
        if (speaking) {
            cancel();
          }
        speak(lastMessage.text);
          lastSpokenMessageId.current = lastMessage.id;
      }
    }
  }, [messages, supported, speaking, speak]); 

  return (
    <div className="flex flex-col h-screen bg-gray-100 items-center justify-center">
      <div className="flex flex-col w-full max-w-2xl bg-white shadow-lg rounded-lg h-[90vh]">
        <div className="p-4 border-b border-gray-200 text-center text-xl font-semibold text-gray-700">
          Langflow AI Chat
        </div>

        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.length === 0 && !isLoading && !error && (
            <div className="text-center text-gray-500 mt-10">
              Start a conversation with your Langflow AI!
            </div>
          )}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-lg ${
                  msg.sender === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-300 text-gray-800'
                }`}
              >
                {msg.text}
                
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-xs px-4 py-2 rounded-lg bg-gray-300 text-gray-800">
                Thinking...
              </div>
            </div>
          )}
          {error && (
            <div className="text-red-500 text-center mt-4">
              Error: {error}
            </div>
          )}
          <div ref={messagesEndRef} /> {/* For auto-scrolling */}
        </div>

        <form onSubmit={handleFormSubmit} className="p-4 border-t border-gray-200 flex space-x-2">
          <input
            type="text"
            value={input||transcript}
            onChange={(e) => {
                if (!listening) {
                    setInput(e.target.value);
                  }
            }}
            placeholder="Type your message..."
            className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={toggleListening}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            disabled={isLoading}
          >
             {listening ? "Stop Mic" : "Mic"}
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            disabled={isLoading}
          >
            Send
          </button>
          <button
            type="button" 
            onClick={resetChat}
            className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Reset
          </button>
        </form>
      </div>
    </div>
  );
}