"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeSanitize from "rehype-sanitize";
import { type UIMessage, isTextUIPart } from "ai";
import { cn } from "~/lib/utils";
import { User, Bot } from "lucide-react";

interface MessageListProps {
  messages: UIMessage[];
  isLoading?: boolean;
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  if (messages.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center space-y-4 opacity-50">
        <Bot className="h-12 w-12 text-zinc-400" />
        <h3 className="text-xl font-semibold">How can I help you today?</h3>
        <p className="text-center text-sm max-w-xs">
          Start a conversation or ask me anything. I'm here to assist you!
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-12">
      {messages.map((message) => {
        const isAssistant = message.role === "assistant";
        const textContent = message.parts
          .filter(isTextUIPart)
          .map((part) => part.text)
          .join("\n");

        return (
          <div
            key={message.id}
            className={cn(
              "flex w-full gap-4 px-4 py-2",
              isAssistant ? "bg-zinc-900/50" : "bg-transparent"
            )}
          >
            <div className="flex flex-shrink-0 flex-col items-center">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg border",
                  isAssistant
                    ? "border-blue-500/20 bg-blue-500/10 text-blue-400"
                    : "border-zinc-700 bg-zinc-800 text-zinc-100"
                )}
              >
                {isAssistant ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
              </div>
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-2 overflow-hidden">
              <div className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                {isAssistant ? "Assistant" : "You"}
              </div>
              <div className="prose prose-invert prose-zinc max-w-none overflow-hidden text-sm leading-relaxed text-zinc-300">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight, rehypeSanitize]}
                  components={{
                    pre: ({ node, ...props }) => (
                      <div className="overflow-auto rounded-lg bg-zinc-950 p-4 border border-zinc-800 my-2">
                        <pre {...props} />
                      </div>
                    ),
                    code: ({ node, ...props }) => (
                      <code
                        className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-xs text-zinc-100"
                        {...props}
                      />
                    ),
                    p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
                  }}
                >
                  {textContent}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
