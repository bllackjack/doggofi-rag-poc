// components/ChatBox.tsx

'use client';

import React, { useState, useRef, useEffect } from 'react';

// Define the message type for consistency
interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export default function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'system', content: 'You are a helpful assistant.' }, // System message is typically not displayed directly
  ]);
  const [input, setInput] = useState('');
  const [streamingText, setStreamingText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null); // Ref to scroll to bottom

  // Effect to scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText]); // Scroll on message update or streaming text update

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault(); // Prevent default form submission if called from form
    if (!input.trim() || isLoading) return; // Don't send empty messages or if already loading

    const userMessage: ChatMessage = { role: 'user', content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages); // Add user message to history
    setInput(''); // Clear input field
    setIsLoading(true); // Set loading state
    setStreamingText(''); // Clear previous streaming text

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      if (!res.ok || !res.body) {
        throw new Error(`API error: ${res.status} ${res.statusText}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');

      let done = false;
      let streamedResponse = '';

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value);
        streamedResponse += chunkValue; // Accumulate the streamed text
        setStreamingText(streamedResponse); // Update the UI with accumulated text
      }

      // Once streaming is complete, add the full assistant message to history
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: streamedResponse.trim() },
      ]);
      setStreamingText(''); // Clear streaming text as it's now part of messages
    } catch (error) {
      console.error('Frontend API call error:', error);
      // Display an error message to the user if the API call fails
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' },
      ]);
    } finally {
      setIsLoading(false); // End loading state
    }
  };

  const displayedMessages = messages.filter(m => m.role !== 'system'); // Don't display the system message

  return (
    <div className="max-w-xl mx-auto p-4 flex flex-col h-[90vh] bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold mb-4 text-center text-gray-800">Chat with me</h1>
      <div className="flex-1 overflow-y-auto mb-4 p-2 border border-gray-200 rounded-md bg-gray-50 custom-scrollbar">
        {displayedMessages.map((m, i) => (
          <div key={i} className={`p-3 my-2 rounded-lg max-w-[85%] ${m.role === 'user' ? 'bg-black text-white ml-auto rounded-br-none' : 'bg-gray-200 text-gray-800 mr-auto rounded-bl-none'}`}>
            <strong>{m.role === 'user' ? 'You' : 'Bot'}:</strong> {m.content}
          </div>
        ))}
        {isLoading && streamingText && (
          <div className="p-3 my-2 rounded-lg bg-gray-200 text-gray-700 mr-auto rounded-bl-none">
            <strong>Bot:</strong> {streamingText}
            <span className="animate-pulse">▌</span> {/* Blinking cursor */}
          </div>
        )}
        <div ref={messagesEndRef} /> {/* Scroll target */}
      </div>
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type your message here..."
          className="flex-grow border border-gray-300 text-black rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          disabled={isLoading}
        />
        <button
          type="submit" // Use type="submit" for form submission
          disabled={isLoading || !input.trim()}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  );
}