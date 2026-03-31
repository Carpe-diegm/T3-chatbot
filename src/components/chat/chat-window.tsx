"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { MessageList } from "./message-list";
import { ChatInput } from "./chat-input";
import { useEffect, useRef, useState } from "react";
import { api } from "~/trpc/react";

interface ChatWindowProps {
  chatId: string;
}

export function ChatWindow({ chatId }: ChatWindowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const utils = api.useUtils();

  // Load initial messages from DB
  const { data: initialMessagesData, isLoading: isMessagesLoading } = api.chat.getMessages.useQuery({
    chatId,
  });

  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  const initialMessages = initialMessagesData
    ? initialMessagesData.items.map((m) => ({
        id: m.id,
        role: m.role.toLowerCase() as "user" | "assistant",
        parts: [{ type: "text" as const, text: m.content }],
      }))
    : [] as any;

  const {
    messages,
    sendMessage,
    status,
  } = useChat({
    id: chatId,
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: { chatId },
    }),
    messages: initialMessages,
    onFinish: () => {
      utils.chat.getUserChats.invalidate();
      setErrorStatus(null);
    },
    onError: (err: any) => {
      console.error("Chat Error:", err);
      const msg = err?.message || "";
      if (msg.includes("quota") || msg.includes("402")) {
        setErrorStatus("OpenAI Out of Credits. Please check your billing.");
      } else {
        setErrorStatus(msg || "Something went wrong. Please try again.");
      }
      utils.chat.getUserChats.invalidate();
    }
  });

  const isLoading = status === "submitted" || status === "streaming";

  // Handle initial query from URL (?q=...)
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const query = searchParams.get("q");
    
    console.log(">>> FRONTEND CHECK:", { 
      query, 
      messagesLength: messages.length, 
      isMessagesLoading, 
      status,
      chatId
    });

    if (query && !isMessagesLoading && messages.length === 0 && status === "ready") {
      console.log(">>> TRIGGERING MESSAGE NOW!");
      void sendMessage({ text: query });
      // Clear the query param from URL without refreshing
      window.history.replaceState({}, "", window.location.pathname);
    } else if (query) {
      console.log(">>> TRIGGER BLOCKED BY:", { 
        alreadyHasMessages: messages.length > 0, 
        stillLoadingDB: isMessagesLoading, 
        notReady: status !== "ready" 
      });
    }
  }, [isMessagesLoading, messages.length, sendMessage, status, chatId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement> | React.KeyboardEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const message = input;
    setInput(""); // Clear input
    await sendMessage({ text: message });
  };


  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-zinc-950">
      {/* Header */}
      <header className="flex h-14 items-center border-b border-zinc-800 px-6 backdrop-blur-md">
        <h2 className="text-sm font-semibold text-zinc-100 truncate">
          {isMessagesLoading ? "Loading..." : "Chat Session"}
        </h2>
      </header>

      {/* Messages Container */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto scroll-smooth scrollbar-thin scrollbar-thumb-zinc-800"
      >
        <div className="mx-auto max-w-4xl py-8">
          <MessageList messages={messages} isLoading={isLoading} />
          
          {errorStatus && (
            <div className="mx-4 mt-4 rounded-lg border border-red-900/50 bg-red-950/20 p-4">
              <p className="text-sm font-medium text-red-500">
                Error: {errorStatus}
              </p>
              <p className="mt-1 text-xs text-red-400">
                This usually means the OpenAI API key is out of credits or the server is temporarily down.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Input Section */}
      <div className="mx-auto w-full max-w-4xl px-4 relative">
        <ChatInput
          input={input}
          onInputChange={handleInputChange}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
