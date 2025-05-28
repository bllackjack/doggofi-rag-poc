// interfaces/chat.ts
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}
