'use client';

import { useState, useRef, useEffect } from 'react';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [ollamaStatus, setOllamaStatus] = useState<'checking' | 'running' | 'error'>('checking');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check if Ollama is running
  useEffect(() => {
    const checkOllamaStatus = async () => {
      try {
        const response = await fetch('http://localhost:11434/api/tags');
        if (response.ok) {
          setOllamaStatus('running');
        } else {
          setOllamaStatus('error');
        }
      } catch (error) {
        setOllamaStatus('error');
      }
    };

    checkOllamaStatus();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || ollamaStatus !== 'running') return;

    const userMessage: Message = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 503) {
          throw new Error('Ollama is not running. Please start Ollama and try again.');
        }
        throw new Error(errorData.error || 'Failed to fetch response');
      }

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';

      // Add an empty assistant message that we'll update
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        assistantMessage += chunk;
        
        // Update the last message (which is the assistant's message)
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage?.role === 'assistant') {
            lastMessage.content = assistantMessage;
          }
          return [...newMessages];
        });
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Sorry, something went wrong. Please try again.';
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: errorMessage 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (ollamaStatus === 'checking') {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Checking Ollama status...</p>
        </div>
      </div>
    );
  }

  if (ollamaStatus === 'error') {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center p-8 bg-red-50 rounded-lg max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Ollama is not running</h2>
          <p className="text-gray-700 mb-4">
            Please make sure Ollama is installed and running on your system.
          </p>
          <ol className="text-left list-decimal list-inside space-y-2 text-gray-600">
            <li>Download and install Ollama from <a href="https://ollama.ai/download" className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">ollama.ai</a></li>
            <li>Start Ollama on your system</li>
            <li>Run <code className="bg-gray-100 px-2 py-1 rounded">ollama pull llama3</code> in your terminal</li>
            <li>Refresh this page</li>
          </ol>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4">
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : message.content.includes('Ollama is not running')
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-200 text-gray-800'
              }`}
            >
              {message.content || (message.role === 'assistant' && isLoading ? '...' : '')}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading || ollamaStatus !== 'running'}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim() || ollamaStatus !== 'running'}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
} 