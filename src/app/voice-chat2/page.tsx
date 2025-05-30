"use client";
import useSpeechToText from "@/hooks/useSpeechToText";
import { useChatHandler } from "@/hooks/useChatHandler";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { useEffect, useRef, useState } from "react";

export default function VoiceChatPage2() {
  const [spokenMessageIds, setSpokenMessageIds] = useState<Set<string>>(
    new Set()
  );

  const { transcript, listening, toggleListening, stopListening } =
    useSpeechToText();

  const { messages, input, isLoading, streamingText, setInput, handleSubmit } =
    useChatHandler([]);

  const { speak, cancel, speaking, supported } = useSpeechSynthesis();


  // interface ChatBoxProps {
  //     initialMessages?: ChatMessage[];
  //     showVoiceControls?: boolean;
  //     onTranscriptChange?: (text: string) => void;
  //     onNewMessage?: (message: ChatMessage) => void;
  //     className?: string;
  //   }

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText]);

  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (
        lastMessage.role === "assistant" &&
        !speaking &&
        !spokenMessageIds.has(lastMessage.content)
      ) {
        try {
          const utterance = new SpeechSynthesisUtterance(lastMessage.content);
          utterance.onerror = (event) => {
            // Only log if it's not an interruption
            if (event.error !== 'interrupted') {
              console.warn('Speech synthesis error:', event.error);
            }
          };
          window.speechSynthesis.speak(utterance);
          setSpokenMessageIds((prev) => new Set([...prev, lastMessage.content]));
        } catch (error) {
          console.warn('Speech synthesis failed:', error);
        }
      }
    }
  }, [messages, speaking, spokenMessageIds]);

  // Sync input with transcript when transcript changes
  useEffect(() => {
    if (transcript && listening) {
      setInput(transcript);
    }
  }, [transcript, listening, setInput]);


  // Notify parent component of new messages
  //   useEffect(() => {
  //     if (messages.length > 0) {
  //       const lastMessage = messages[messages.length - 1];
  //       onNewMessage?.(lastMessage);
  //     }
  //   }, [messages, onNewMessage]);

  const displayedMessages = messages.filter((m) => m.role !== "system");

    // const handleSubmit = async (e?: React.FormEvent) => {
    //   e?.preventDefault();
    //   await originalHandleSubmit(e);
    // };

  // Add a cleanup effect to cancel speech when component unmounts
  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  return (
    <div className="p-10 min-h-screen bg-black text-white">
      <h1 className="text-4xl font-bold mb-4">voice chat</h1>

      <div className="flex flex-col ">
        <h1 className="text-2xl font-bold mb-4 text-center text-white">
          Chat with me
        </h1>
        <div className="flex-1 overflow-y-auto mb-4 p-2  border border-gray-200 rounded-md bg-gray-50 custom-scrollbar">
          {displayedMessages.map((m, i) => (
            <div
              key={i}
              className={`p-3 my-2 rounded-lg max-w-[85%] ${
                m.role === "user"
                  ? "bg-black text-white ml-auto rounded-br-none"
                  : "bg-gray-200 text-gray-800 mr-auto rounded-bl-none"
              }`}
            >
              <strong>{m.role === "user" ? "You" : "Bot"}:</strong> {m.content}
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

        <div>
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <div>
            <input
              value={input}
              onChange={(e) => {
                if (!listening) {
                  setInput(e.target.value);
                }
              }}
              placeholder="Type your message here..."
              className="flex-grow border border-gray-300 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              disabled={isLoading}
            />
            </div>
            

            <button
              onClick={toggleListening}
              className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              {listening ? "Stop Listening" : "Start Speaking"}
            </button>
            <button
              onClick={cancel}
              className="px-6 py-3 bg-red-600 text-white rounded hover:bg-red-700 transition"
            >
              Stop Bot
            </button>
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Send
            </button>
          </form>
        </div>
        <textarea
          className="w-full mt-6 p-4 bg-gray-800 text-amber-100 rounded h-14"
          value={transcript}
          placeholder="Your speech will appear here..."
          readOnly
        />
      </div>
    </div>
  );
}
