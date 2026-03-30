import { Bot, MessageSquarePlus } from "lucide-react";
import { Sidebar } from "~/components/chat/sidebar";

export default function ChatEmptyPage() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center p-8 bg-zinc-950 text-center animate-in fade-in duration-700">
      <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-zinc-800 to-zinc-900 shadow-2xl shadow-zinc-950">
        <Bot className="h-12 w-12 text-zinc-100" />
      </div>
      <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
        Select a Chat to Start
      </h1>
      <p className="max-w-md text-balance text-lg text-zinc-400">
        Whether it's code, creativity, or conversation, I'm here to help you get things done.
      </p>
      
      <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 max-w-2xl">
         <div className="flex flex-col gap-2 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 text-left transition-all hover:border-zinc-700 hover:bg-zinc-800/50">
            <h3 className="font-semibold text-zinc-100 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span>
              Coding Assistance
            </h3>
            <p className="text-sm text-zinc-400">Debug, refactor, or explain complex logic with ease.</p>
         </div>
         <div className="flex flex-col gap-2 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 text-left transition-all hover:border-zinc-700 hover:bg-zinc-800/50">
            <h3 className="font-semibold text-zinc-100 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]"></span>
              Creative Writing
            </h3>
            <p className="text-sm text-zinc-400">Draft emails, essays, or stories at the click of a button.</p>
         </div>
      </div>
    </div>
  );
}
