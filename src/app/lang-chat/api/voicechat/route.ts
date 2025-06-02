// app/voice-chat2/api/voicechat/route.ts
import { LangflowClient, FlowOutput } from "@datastax/langflow-client";
import { NextResponse } from 'next/server'; // Import NextResponse

// Define a type for the expected request body (same as before)
interface ChatRequestBody {
  message: string;
  flowId: string;
  sessionId?: string;
}

// --- CHANGE THIS WHOLE FUNCTION SIGNATURE ---
export async function POST(request: Request) { // Renamed to POST, takes 'request'
  // No need for req.method check, as this function only handles POST requests
  // const reqBody = await request.json(); // Parse body from the Request object

  const LANGFLOW_API_KEY = process.env.LANGFLOW_API_KEY;
  const LANGFLOW_ID = process.env.LANGFLOW_ID;

  if (!LANGFLOW_API_KEY || !LANGFLOW_ID) {
    console.error("Missing Langflow API Key or Langflow ID environment variables.");
    return NextResponse.json({ message: "Server configuration error: Langflow API key or ID not set." }, { status: 500 });
  }

  const { message, flowId, sessionId } = await request.json() as ChatRequestBody; // Parse JSON from request

  if (!message || !flowId) {
    return NextResponse.json({ message: 'Bad Request: Missing "message" or "flowId" in request body.' }, { status: 400 });
  }

  try {
    const client = new LangflowClient({ langflowId: LANGFLOW_ID, apiKey: LANGFLOW_API_KEY });
    const flow = client.flow(flowId);

    const response: FlowOutput = await flow.run(message, {
      input_type: 'chat',
      output_type: 'chat',
      session_id: sessionId || undefined,
    });

    // --- CHANGE THIS RESPONSE ---
    return NextResponse.json({ output: response.chatOutputText() || response.outputs });

  } catch (error: any) {
    console.error('Error calling Langflow API:', error);
    // --- CHANGE THIS RESPONSE ---
    return NextResponse.json({ message: `Error processing your request with Langflow: ${error.message || 'An unknown error occurred.'}` }, { status: 500 });
  }
}