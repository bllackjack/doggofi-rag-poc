import { useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
// Replace with your actual Langflow Flow ID
const LANGFLOW_CHAT_FLOW_ID =process.env.NEXT_PUBLIC_LANGFLOW_CHAT_ID;
 // <--- IMPORTANT: REPLACE THIS!
// const LANGFLOW_CHAT_FLOW_ID=process.env.LANGFLOW_CHAT_FLOW_PUBLIC_ID;
interface ChatMessage {
    text: string;
    sender: 'user' | 'ai';
    id: number;
}

interface ChatResponse {
    output: string; // Assuming your API returns { output: "AI's response" }
}

interface UseChatbotResult {
    messages: ChatMessage[];
    isLoading: boolean;
    error: string | null;
    sendMessage: (message: string) => Promise<void>;
    resetChat: () => void; // Optional: to clear chat history
}

export const useChatbot = (): UseChatbotResult => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [sessionId, setSessionId] = useState<string | null>(null);

    // Generate a new session ID when the hook is first mounted or if needed
    useEffect(() => {
        if (!sessionId) {
            setSessionId( uuidv4()); // Use crypto.randomUUID() for robust UUIDs
        }
    }, [sessionId]); // Dependency array ensures it only runs once per mount

    const sendMessage = useCallback(async (text: string) => {
        if (!text.trim() || isLoading) return;

        const userMessage: ChatMessage = { text: text, sender: 'user', id: messages.length + 1 };
        setMessages((prevMessages) => [...prevMessages, userMessage]);
        setIsLoading(true);
        setError(null); // Clear previous errors

        try {
            const apiEndpoint = '/lang-chat/api/voicechat'; // Your Next.js API route

            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: text,
                    flowId: LANGFLOW_CHAT_FLOW_ID,
                    sessionId: sessionId, // Pass the session ID
                }),
            });

            if (!response.ok) {
                // Attempt to parse error message from the server
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
            }

            const data: ChatResponse = await response.json();
            const aiMessage: ChatMessage = {
                text: data.output || 'No response from AI.',
                sender: 'ai',
                id: messages.length + 2, // Ensure unique ID for the new message
            };
            setMessages((prevMessages) => [...prevMessages, aiMessage]);

        } catch (err: any) {
            console.error('Error in useChatbot:', err);
            setError(err.message || 'An unknown error occurred.');
            // Optionally add an error message to chat for user feedback
            const errorMessage: ChatMessage = { text: `Error: ${err.message || 'Failed to get a response.'}`, sender: 'ai', id: messages.length + 2 };
            setMessages((prevMessages) => [...prevMessages, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, messages.length, sessionId]); // Dependencies: isLoading, messages.length (for ID), sessionId

    const resetChat = useCallback(() => {
        setMessages([]);
        setSessionId(crypto.randomUUID()); // Generate a new session ID for a fresh start
        setError(null);
        setIsLoading(false);
    }, []);

    return { messages, isLoading, error, sendMessage, resetChat };
};