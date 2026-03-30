import { Sidebar } from "~/components/chat/sidebar";
import { auth } from "~/server/auth";
import { redirect } from "next/navigation";

export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/api/auth/signin");
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-zinc-950 text-zinc-200">
      <Sidebar />
      <main className="flex-1 transition-all duration-300 sm:ml-64">
        {children}
      </main>
    </div>
  );
}
