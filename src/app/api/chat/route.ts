// app/api/chat/route.ts
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, Part } from '@google/generative-ai';

// This is crucial for Vercel Edge deployments for streaming
export const runtime = 'edge';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Initialize Gemini with your API key from environment variables
// Ensure GOOGLE_API_KEY is set in your .env.local file
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

export async function POST(req: Request) {
  try {
    const { messages } = await req.json() as { messages: ChatMessage[] };

    // Validate API Key presence
    if (!process.env.GOOGLE_API_KEY) {
      return new NextResponse('Google API Key not configured.', { status: 500 });
    }

    // Convert messages for Gemini's chat history format
    const history = messages.slice(0, -1).map((msg: ChatMessage) => ({
      role: msg.role === 'assistant' ? 'model' : 'user', // Gemini expects 'model' for assistant
      parts: [{ text: msg.content }] as Part[],
    }));

    // Get the last message, which is the current user's prompt
    const latestUserMessage = messages[messages.length - 1].content;

    // Use the 'gemini-pro' model for text-only conversations.
    // This is the correct and widely available alias.
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const chat = model.startChat({ history });

    // Send the latest user message to the model
    const result = await chat.sendMessageStream(latestUserMessage); // Use sendMessageStream for real-time streaming

    // Create a ReadableStream to send data back to the client
    const readableStream = new ReadableStream({
      async start(controller) {
        for await (const chunk of result.stream) {
          controller.enqueue(chunk.text());
        }
        controller.close();
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache', // Important for streaming
      },
    });

  } catch (err: any) {
    console.error('API Route Error:', err);
    // Provide more specific error details in development mode, but be cautious in production
    const errorMessage = process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error';
    const status = err.status || 500;
    return new NextResponse(errorMessage, { status });
  }
}