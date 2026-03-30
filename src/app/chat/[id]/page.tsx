import { ChatWindow } from "~/components/chat/chat-window";
import { notFound } from "next/navigation";

interface ChatPageProps {
  params: { id: string };
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { id } = await params;

  if (!id) {
    return notFound();
  }

  return (
    <div className="h-full w-full bg-zinc-950">
      <ChatWindow chatId={id} />
    </div>
  );
}
