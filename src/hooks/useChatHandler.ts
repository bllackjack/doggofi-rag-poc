// hooks/useChatHandler.ts
'use client';

import { useState } from 'react';
import { ChatMessage } from '@/interfaces/chat';

export function useChatHandler(initialMessages: ChatMessage[]) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [streamingText, setStreamingText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);
    setStreamingText('');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      if (!res.ok || !res.body) {
        throw new Error(`API error: ${res.status} ${res.statusText}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let streamedResponse = '';
      let done = false;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        streamedResponse += decoder.decode(value);
        setStreamingText(streamedResponse);
      }

      setMessages(prev => [...prev, { role: 'assistant', content: streamedResponse.trim() }]);
      setStreamingText('');
    } catch (error) {
      console.error('API error:', error);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    input,
    isLoading,
    streamingText,
    setInput,
    handleSubmit,
  };
}
