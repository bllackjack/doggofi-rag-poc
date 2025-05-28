// app/page.tsx
'use client';
import TTSComponent from "@/components/TTSComponent";

export default function tts() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <TTSComponent/>
    </main>
  );
}