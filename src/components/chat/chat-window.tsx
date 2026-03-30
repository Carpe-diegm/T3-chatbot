"use client";

import { useChat } from "@ai-sdk/react";
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

  const {
    messages,
    sendMessage,
    status,
    setMessages,
  } = useChat({
    id: chatId,
    messages: initialMessagesData?.items.map((m) => ({
      id: m.id,
      role: m.role.toLowerCase() as "user" | "assistant",
      parts: [{ type: "text", text: m.content }],
    })) || [],
    onFinish: () => {
      // Refresh sidebar to show latest messages/titles
      utils.chat.getUserChats.invalidate();
    },
  });

  const isLoading = status === "submitted" || status === "streaming";

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

  // Sync initial messages when they load
  useEffect(() => {
    if (initialMessagesData?.items) {
      setMessages(initialMessagesData.items.map((m) => ({
        id: m.id,
        role: m.role.toLowerCase() as "user" | "assistant",
        parts: [{ type: "text", text: m.content }],
      })));
    }
  }, [initialMessagesData, setMessages]);

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
