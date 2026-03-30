import Link from "next/link";
import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import { Bot, Sparkles, Shield, Cpu, MessageSquare } from "lucide-react";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    redirect("/chat");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 text-white selection:bg-blue-500/30">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -left-1/4 -top-1/4 h-[1000px] w-[1000px] rounded-full bg-blue-500/10 blur-[120px]" />
        <div className="absolute -right-1/4 -bottom-1/4 h-[1000px] w-[1000px] rounded-full bg-purple-500/10 blur-[120px]" />
      </div>

      <div className="container relative z-10 flex flex-col items-center justify-center gap-12 px-4 py-16 text-center">
        <div className="flex flex-col items-center gap-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl">
             <Bot className="h-8 w-8 text-blue-400" />
          </div>
          <h1 className="max-w-4xl text-5xl font-extrabold tracking-tight sm:text-7xl">
            The next generation of <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">AI Intelligence</span>
          </h1>
          <p className="max-w-2xl text-xl text-zinc-400">
            Powered by GPT-4 and built on the T3 stack. Experience real-time streaming, 
            secure authentication, and persistent chat history.
          </p>
        </div>

        <div className="flex flex-col items-center gap-4">
          <Link
            href="/api/auth/signin"
            className="group relative flex h-14 items-center justify-center overflow-hidden rounded-full bg-white px-12 text-lg font-bold text-zinc-950 transition-all hover:scale-105 active:scale-95"
          >
            Get Started Free
          </Link>
          <p className="text-sm text-zinc-500">No credit card required.</p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 mt-24">
          <FeatureCard 
            icon={<Sparkles className="h-6 w-6 text-yellow-400" />}
            title="Real-time Streaming"
            description="Experience low-latency responses as the AI thinks and writes."
          />
          <FeatureCard 
            icon={<Shield className="h-6 w-6 text-green-400" />}
            title="Secure & Private"
            description="Your data is protected by industry-standard authentication and privacy."
          />
          <FeatureCard 
            icon={<Cpu className="h-6 w-6 text-purple-400" />}
            title="Advanced Intelligence"
            description="Leverage GPT-4o for complex reasoning and advanced coding tasks."
          />
          <FeatureCard 
            icon={<MessageSquare className="h-6 w-6 text-blue-400" />}
            title="Persistent History"
            description="Access your conversations from any device with automatic cloud sync."
          />
        </div>
      </div>
      
      <footer className="relative z-10 mt-32 py-8 text-zinc-500 text-sm">
        &copy; {new Date().getFullYear()} T3 AI Chatbot. Built with excellence.
      </footer>
    </main>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="flex flex-col items-center gap-4 p-8 rounded-3xl bg-zinc-900/50 border border-zinc-800 backdrop-blur-sm transition-all hover:bg-zinc-900 hover:border-zinc-700">
      <div className="h-12 w-12 rounded-xl bg-zinc-950 flex items-center justify-center border border-zinc-800 shadow-inner">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-white">{title}</h3>
      <p className="text-zinc-400">{description}</p>
    </div>
  )
}
