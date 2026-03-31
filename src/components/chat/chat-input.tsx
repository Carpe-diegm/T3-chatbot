"use client";

import { Send, CornerDownLeft, Paperclip, Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { cn } from "~/lib/utils";

interface ChatInputProps {
  input: string;
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
}

export function ChatInput({ input, onInputChange, onSubmit, isLoading }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Focus on mount and after loading finishes
  useEffect(() => {
    if (!isLoading && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isLoading]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!input.trim() || isLoading) return;
      onSubmit(e as any);
      // Re-focus immediately after submit
      setTimeout(() => textareaRef.current?.focus(), 0);
    }
  };

  return (
    <div className="absolute bottom-0 left-0 w-full border-t border-zinc-800 bg-zinc-950/80 p-4 backdrop-blur-md">
      <form
        onSubmit={onSubmit}
        className="mx-auto flex max-w-4xl items-end gap-2 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 pr-2 transition-all focus-within:border-zinc-600 focus-within:ring-1 focus-within:ring-zinc-600"
      >
        <button
          type="button"
          className="flex h-12 w-12 items-center justify-center text-zinc-500 hover:text-zinc-300 transition-colors"
          title="Attach File"
        >
          <Paperclip className="h-5 w-5" />
        </button>

        <textarea
          ref={textareaRef}
          rows={1}
          value={input}
          onChange={onInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Message Assistant..."
          className="flex-1 resize-none bg-transparent py-4 text-sm text-zinc-100 outline-none placeholder:text-zinc-500"
        />

        <div className="flex h-12 items-center">
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg transition-all",
              isLoading || !input.trim()
                ? "bg-zinc-800 text-zinc-600 opacity-50"
                : "bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/20"
            )}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
            ) : (
              <div className="relative flex items-center gap-1 overflow-hidden group">
                 <Send className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </div>
            )}
          </button>
        </div>
      </form>
      <div className="mt-2 flex w-full justify-center">
        <p className="text-[10px] text-zinc-600 flex items-center gap-1">
          Press <span className="rounded border border-zinc-700 bg-zinc-800 px-1 py-0.5 text-[8px]">Enter</span> to send, 
          <span className="rounded border border-zinc-700 bg-zinc-800 px-1 py-0.5 text-[8px]">Shift + Enter</span> for new line.
        </p>
      </div>
    </div>
  );
}
