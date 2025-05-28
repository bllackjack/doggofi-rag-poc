// components/ChatBox.tsx
'use client';

import React, { useRef, useEffect } from 'react';
import { useChatHandler } from '@/hooks/useChatHandler';
import { ChatMessage } from '@/interfaces/chat';

interface ChatBoxProps {
  initialMessages?: ChatMessage[];
  showVoiceControls?: boolean;
  onTranscriptChange?: (text: string) => void;
  onNewMessage?: (message: ChatMessage) => void;
  className?: string;
}

export default function ChatBox({ 
  initialMessages = [{ role: 'system', content: 'You are a helpful assistant.' }],
  showVoiceControls = false,
  onTranscriptChange,
  onNewMessage,
  className = ''
}: ChatBoxProps) {
  const {
    messages,
    input,
    setInput,
    isLoading,
    streamingText,
    handleSubmit: originalHandleSubmit,
  } = useChatHandler(initialMessages);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText]);

  // Notify parent component of new messages
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      onNewMessage?.(lastMessage);
    }
  }, [messages, onNewMessage]);

  const displayedMessages = messages.filter(m => m.role !== 'system');

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    await originalHandleSubmit(e);
  };

  return (
    <div className={`flex flex-col ${className}`}>
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
            <span className="animate-pulse">▌</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          value={input}
          onChange={e => {
            setInput(e.target.value);
            onTranscriptChange?.(e.target.value);
          }}
          placeholder="Type your message here..."
          className="flex-grow border border-gray-300 text-black rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  );
}
