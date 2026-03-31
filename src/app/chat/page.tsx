"use client";

import { Bot, Code2, Sparkles } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { ChatInput } from "~/components/chat/chat-input";

export default function ChatEmptyPage() {
  const [input, setInput] = useState("");
  const router = useRouter();
  const utils = api.useUtils();

  const createChat = api.chat.createChat.useMutation({
    onSuccess: (newChat, variables) => {
      utils.chat.getUserChats.invalidate();
      const query = variables?.initialMessage ? `?q=${encodeURIComponent(variables.initialMessage)}` : "";
      router.push(`/chat/${newChat.id}${query}`);
    },
  });

  const handleStartChat = (initialMessage?: string) => {
    const msg = initialMessage || input;
    if (!msg.trim()) return;
    createChat.mutate({ initialMessage: msg });
  };

  const isPending = createChat.isPending;

  return (
    <div className="flex h-full w-full flex-col items-center justify-center p-8 bg-zinc-950 text-center animate-in fade-in duration-700">
      <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-zinc-800 shadow-2xl relative group">
        <Bot className="h-10 w-10 text-zinc-100 transition-transform group-hover:scale-110" />
        <div className="absolute inset-0 rounded-3xl bg-blue-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
        How can I help you <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">today?</span>
      </h1>
      <p className="max-w-md text-balance text-lg text-zinc-400 mb-12">
        Start a new conversation or choose a suggestion below.
      </p>
      
      {/* Central Input Section */}
      <div className="w-full max-w-2xl mb-12 relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur opacity-25 group-focus-within:opacity-100 transition duration-1000"></div>
        <ChatInput 
          input={input}
          onInputChange={(e) => setInput(e.target.value)}
          onSubmit={(e) => {
            e.preventDefault();
            handleStartChat();
          }}
          isLoading={isPending}
        />
      </div>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 w-full max-w-2xl">
         <button 
           onClick={() => handleStartChat("I need help debugging some code.")}
           disabled={isPending}
           className="flex flex-col gap-2 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 text-left transition-all hover:border-blue-500/50 hover:bg-zinc-800/80 group disabled:opacity-50"
         >
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center mb-2">
              <Code2 className="h-5 w-5 text-blue-400" />
            </div>
            <h3 className="font-semibold text-zinc-100 flex items-center gap-2">
              Coding Assistance
            </h3>
            <p className="text-sm text-zinc-400 line-clamp-2">Debug, refactor, or explain complex logic with ease.</p>
         </button>
         
         <button 
           onClick={() => handleStartChat("Can you help me write a creative story or essay?")}
           disabled={isPending}
           className="flex flex-col gap-2 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 text-left transition-all hover:border-purple-500/50 hover:bg-zinc-800/80 group disabled:opacity-50"
         >
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center mb-2">
              <Sparkles className="h-5 w-5 text-purple-400" />
            </div>
            <h3 className="font-semibold text-zinc-100 flex items-center gap-2">
              Creative Writing
            </h3>
            <p className="text-sm text-zinc-400 line-clamp-2">Draft emails, essays, or stories at the click of a button.</p>
         </button>
      </div>
    </div>
  );
}
