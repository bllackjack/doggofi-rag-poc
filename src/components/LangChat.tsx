'use client';

import React, { useState, FormEvent, useEffect, useRef } from 'react';
import { useChatbot } from '@/hooks/useChatbot';
import { useSpeechSynthesis } from '@/hooks/useTextToSpeech';
import useSpeechToText from '@/hooks/useSpeechToText';
import { AiOutlineAudioMuted ,AiOutlineAudio ,AiOutlineRedo ,AiOutlineSend  } from "react-icons/ai";

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
        supported } = useSpeechSynthesis();

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
        if (!speaking) {
            cancel();
        }
        await sendMessage(input);
        setInput('');
    };

    useEffect(() => {
        if (!transcript || !listening) return;

        const debounceTimeout = setTimeout(async () => {
            stopListening();       // Stop mic
            if (!speaking) cancel(); // Cancel any ongoing speech
            await sendMessage(transcript);  // Send message
            setInput('');          // Clear input
        }, 2000); // 2 seconds debounce

        return () => clearTimeout(debounceTimeout); // Clear timeout on next transcript change
    }, [transcript]);


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
        <div className="flex flex-col h-screen bg-gray-100 rounded-lg items-center justify-center">
            <div className="flex flex-col w-full max-w-2xl bg-white shadow-lg rounded-lg h-full">
                <div className="p-4 border-b border-gray-900 text-center text-xl  text-gray-700">
                    Let's Chat
                </div>

                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                    {messages.length === 0 && !isLoading && !error && (
                        <div className="text-center text-gray-500 mt-10">
                            Start a conversation with me!
                        </div>
                    )}
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-xs px-4 py-2 rounded-lg ${msg.sender === 'user'
                                    ? 'bg-black text-white'
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

                <form onSubmit={handleFormSubmit} className="p-4 border-t border-gray-200 flex juctify-center   space-x-2">
                    <input
                        type="text"
                        value={input || transcript}
                        onChange={(e) => {
                            if (!listening) {
                                setInput(e.target.value);
                            }
                        }}
                        placeholder="Type your message..."
                        className="flex-1 p-2 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black-500"
                        disabled={isLoading}
                    />
                    
                    <button
                        type="button"
                        onClick={toggleListening}
                        className="px-4 py-2  text-black rounded-lg hover:bg-black hover:text-white disabled:opacity-50"
                        disabled={isLoading}

                    >

                        {listening ?<AiOutlineAudio/> : <AiOutlineAudioMuted/> }
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2  text-black rounded-lg hover:bg-black hover:text-white disabled:opacity-50"
                        disabled={isLoading}
                    >
                        <AiOutlineSend/>
                    </button>
                    <button
                        type="button"
                        onClick={resetChat}
                        className="px-4 py-2  text-black rounded-lg hover:bg-black hover:text-white disabled:opacity-50"
                    >
                        <AiOutlineRedo />
                    </button>
                </form>
            </div>
        </div>
    );
}