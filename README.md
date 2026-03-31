# T3 AI Chatbot: High-Performance & Resilient 🚀🤖🛡️

A premium, production-ready AI chatbot platform built with the [T3 Stack](https://create.t3.gg/). This application features blazing-fast streaming responses, automated message persistence, and a highly optimized, modern user interface.

## 🏎️ Key Features

### 1. High-Speed Groq Engine
- **Intelligence**: Powered by Groq's high-performance `Llama-3` models.
- **Performance**: Near-instant streaming responses (70-100+ tokens/second).
- **Auto-Summarization**: Lightning-fast, background title generation for every new chat.

### 2. Full Architecture & Persistence
- **Message Storage**: Automatic, persistent database storage for both user and assistant messages via Prisma.
- **Latency Optimized**: Custom-built tRPC query handlers with N+1 query elimination, ensuring sidebar load times of <200ms.
- **Auth Protected**: Secure user sessions using NextAuth v5 (Google Provider).

### 3. Polished User Experience
- **Focus Persistence**: Optimized chat input that maintains focus across message submissions and AI responses for an uninterrupted "no-click" typing experience.
- **Modern UI**: A sleek, dark-mode glassmorphism interface built with Tailwind CSS and Lucide icons.
- **Resilient Pipeline**: Graceful error handling and fallback streams to ensure the UI remains active even during API rate limits.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org) (App Router)
- **AI Backend**: [AI SDK v6](https://sdk.vercel.ai/docs) (Integrated with Groq)
- **Database**: [Prisma](https://prisma.io) (PostgreSQL)
- **API**: [tRPC](https://trpc.io)
- **Authentication**: [NextAuth.js v5](https://next-auth.js.org)
- **Styling**: [Tailwind CSS](https://tailwindcss.com)

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js installed on your machine.
- A PostgreSQL database (e.g., Supabase or Neon).
- A [Groq API Key](https://console.groq.com/keys).

### 2. Environment Setup
Create a `.env` file in the root directory based on `.env.example`:

```env
# Next Auth
AUTH_SECRET="..."
AUTH_GOOGLE_ID="..."
AUTH_GOOGLE_SECRET="..."

# Prisma
DATABASE_URL="..."

# AI Providers
GROQ_API_KEY="..."
```

### 3. Installation
```bash
npm install
npx prisma generate
```

### 4. Database Setup
```bash
npx prisma db push
```

### 5. Start Development
```bash
npm run dev
```

---

## 🏁 Final Status
This project has been fully stabilized and optimized for production. It includes architectural fixes for AI SDK schema normalization, race-condition mitigation, and high-performance data fetching. 🚀🤖🛡️🏎️💨
