import { NextResponse } from 'next/server';

// Ollama API endpoint - runs locally
const OLLAMA_API = 'http://localhost:11434/api/generate';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Validate the request
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages are required and must be an array' },
        { status: 400 }
      );
    }

    // Convert messages to prompt format
    const prompt = messages
      .map((msg) => `${msg.role === 'user' ? 'Human' : 'Assistant'}: ${msg.content}`)
      .join('\n') + '\nAssistant: ';

    // Create a streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const response = await fetch(OLLAMA_API, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'llama3',
              prompt: prompt,
              stream: true,
            }),
          });

          if (!response.ok) {
            throw new Error(`Ollama API error: ${response.statusText}`);
          }

          const reader = response.body?.getReader();
          if (!reader) {
            throw new Error('No response body');
          }

          const decoder = new TextDecoder();
          let buffer = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.trim() === '') continue;
              try {
                const data = JSON.parse(line);
                if (data.response) {
                  controller.enqueue(new TextEncoder().encode(data.response));
                }
                if (data.done) {
                  controller.close();
                }
              } catch (e) {
                console.error('Error parsing Ollama response:', e);
              }
            }
          }
        } catch (error) {
          console.error('Streaming error:', error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 