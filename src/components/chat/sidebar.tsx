"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Plus, MessageSquare, Trash2, LogOut, Search, User } from "lucide-react";
import { api } from "~/trpc/react";
import { cn } from "~/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { signOut, useSession } from "next-auth/react";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [search, setSearch] = useState("");

  const { data: chats, isLoading } = api.chat.getUserChats.useQuery();
  const utils = api.useUtils();

  const createChat = api.chat.createChat.useMutation({
    onSuccess: (newChat) => {
      utils.chat.getUserChats.invalidate();
      router.push(`/chat/${newChat.id}`);
    },
  });

  const deleteChat = api.chat.deleteChat.useMutation({
    onSuccess: () => {
      utils.chat.getUserChats.invalidate();
      if (pathname.includes("/chat/")) {
        router.push("/chat");
      }
    },
  });

  const filteredChats = chats?.filter((chat) =>
    chat.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-zinc-800 bg-zinc-950 text-white transition-transform sm:translate-x-0">
      <div className="flex flex-col gap-4 p-4">
        <button
          onClick={() => createChat.mutate()}
          disabled={createChat.isPending}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 py-2.5 text-sm font-medium transition-colors hover:bg-zinc-800 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          New Chat
        </button>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search chats..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md bg-zinc-900 py-1.5 pl-9 pr-3 text-xs text-zinc-300 outline-none placeholder:text-zinc-600 focus:ring-1 focus:ring-zinc-700"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2 scrollbar-thin scrollbar-thumb-zinc-800">
        <div className="space-y-1">
          {isLoading ? (
             <div className="animate-pulse space-y-2 px-2">
               {[1, 2, 3, 4, 5].map((i) => (
                 <div key={i} className="h-10 rounded bg-zinc-900" />
               ))}
             </div>
          ) : (
            filteredChats?.map((chat) => {
              const isActive = pathname === `/chat/${chat.id}`;
              return (
                <div
                  key={chat.id}
                  className={cn(
                    "group relative flex items-center rounded-lg transition-colors",
                    isActive ? "bg-zinc-800" : "hover:bg-zinc-900"
                  )}
                >
                  <Link
                    href={`/chat/${chat.id}`}
                    className="flex flex-1 items-center gap-3 overflow-hidden px-3 py-2"
                  >
                    <MessageSquare className="h-4 w-4 flex-shrink-0 text-zinc-400" />
                    <div className="flex flex-col overflow-hidden text-left">
                      <span className="truncate text-sm font-medium text-zinc-200">
                        {chat.title || "Untitled Chat"}
                      </span>
                      <span className="text-[10px] text-zinc-500">
                        {formatDistanceToNow(chat.updatedAt, { addSuffix: true })}
                      </span>
                    </div>
                  </Link>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      const message = "Are you sure you want to delete this chat?";
                      if (confirm(message)) {
                        deleteChat.mutate({ chatId: chat.id });
                      }
                    }}
                    className="absolute right-2 opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="border-t border-zinc-800 p-4">
        {session ? (
          <div className="flex items-center justify-between gap-3 px-2">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800">
                {session.user?.image ? (
                   <img src={session.user.image} alt="User" className="h-full w-full rounded-full" />
                ) : (
                  <User className="h-4 w-4 text-zinc-400" />
                )}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="truncate text-xs font-semibold text-zinc-200">
                  {session.user?.name}
                </span>
                <span className="truncate text-[10px] text-zinc-500">
                  {session.user?.email}
                </span>
              </div>
            </div>
            <button
              onClick={() => signOut()}
              className="rounded p-1.5 transition-colors hover:bg-zinc-800 text-zinc-400 hover:text-white"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
           <Link
             href="/api/auth/signin"
             className="flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-100 py-2 text-sm font-medium text-zinc-950 transition-colors hover:bg-white"
           >
             Sign In
           </Link>
        )}
      </div>
    </aside>
  );
}
