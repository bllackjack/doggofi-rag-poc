'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Montserrat } from 'next/font/google';

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '700'],
});

type Message = {
  role: 'user' | 'assistant';
  content: string;
  id: string;
};

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [ollamaStatus, setOllamaStatus] = useState<'checking' | 'running' | 'error'>('checking');
  const [retryCount, setRetryCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const checkOllamaStatus = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:11434/api/tags');
      if (response.ok) {
        setOllamaStatus('running');
        setRetryCount(0);
      } else {
        setOllamaStatus('error');
      }
    } catch (error) {
      setOllamaStatus('error');
    }
  }, []);

  useEffect(() => {
    checkOllamaStatus();
    
    // Set up retry mechanism
    const retryInterval = setInterval(() => {
      if (ollamaStatus === 'error' && retryCount < MAX_RETRIES) {
        setRetryCount(prev => prev + 1);
        checkOllamaStatus();
      } else {
        clearInterval(retryInterval);
      }
    }, RETRY_DELAY);

    return () => clearInterval(retryInterval);
  }, [checkOllamaStatus, ollamaStatus, retryCount]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || ollamaStatus !== 'running') return;

    const userMessage: Message = { 
      role: 'user', 
      content: input.trim(),
      id: Date.now().toString()
    };
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

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: '', 
        id: (Date.now() + 1).toString() 
      }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        assistantMessage += chunk;
        
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
        content: errorMessage,
        id: Date.now().toString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (ollamaStatus === 'checking') {
    return (
      <div className="flex items-center justify-center min-h-[400px]" role="status" aria-label="Checking Ollama status">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" aria-hidden="true"></div>
          <p className={montserrat.className}>Checking Ollama status...</p>
        </div>
      </div>
    );
  }

  if (ollamaStatus === 'error') {
    return (
      <div className="flex items-center justify-center min-h-[400px]" role="alert" aria-label="Ollama error status">
        <div className="text-center p-8 bg-red-50 rounded-lg max-w-md">
          <h2 className={`${montserrat.className} text-2xl font-bold text-red-600 mb-4`}>
            Ollama is not running
          </h2>
          <p className="text-gray-700 mb-4">
            {retryCount < MAX_RETRIES 
              ? `Attempting to reconnect (${retryCount + 1}/${MAX_RETRIES})...`
              : 'Please make sure Ollama is installed and running on your system.'}
          </p>
          {retryCount >= MAX_RETRIES && (
            <ol className="text-left list-decimal list-inside space-y-2 text-gray-600">
              <li>Download and install Ollama from <a href="https://ollama.ai/download" className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">ollama.ai</a></li>
              <li>Start Ollama on your system</li>
              <li>Run <code className="bg-gray-100 px-2 py-1 rounded">ollama pull llama3</code> in your terminal</li>
              <li>Refresh this page</li>
            </ol>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[400px] max-w-4xl mx-auto p-4 bg-gray-800 rounded-lg" role="region" aria-label="Chat interface">
      <div className='flex justify-center items-center text-4xl text-white mb-6'>
        <h1 className={montserrat.className}>
          Let's Chat with me
        </h1>
      </div>
      <div className="flex-1 overflow-y-auto mb-4 space-y-4" role="log" aria-label="Chat messages">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
            role="listitem"
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : message.content.includes('Ollama is not running')
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-200 text-gray-800'
              }`}
              role="article"
              aria-label={`${message.role === 'user' ? 'Your message' : 'Assistant message'}`}
            >
              {message.content || (message.role === 'assistant' && isLoading ? '...' : '')}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} aria-hidden="true" />
      </div>
      
      <form onSubmit={handleSubmit} className="flex gap-2" role="search">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
          disabled={isLoading || ollamaStatus !== 'running'}
          aria-label="Message input"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim() || ollamaStatus !== 'running'}
          className={`px-6 py-2 bg-blue-600 text-white rounded-lg 
            ${!isLoading && input.trim() && ollamaStatus === 'running' 
              ? 'hover:bg-blue-700 active:bg-blue-800' 
              : 'opacity-50 cursor-not-allowed'
            } 
            transition-colors duration-200 font-medium shadow-md`}
          aria-label={isLoading ? 'Sending message...' : 'Send message'}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              Sending...
            </span>
          ) : (
            'Send'
          )}
        </button>
      </form>
    </div>
  );
} 