import { streamText } from "ai";
import { openai } from "~/lib/openai";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { ratelimit } from "~/lib/ratelimit";
import { NextResponse } from "next/server";
import { Role, MessageStatus } from "../../../../generated/prisma";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { messages, chatId } = await req.json() as {
      messages: { role: "user" | "assistant"; content: string }[];
      chatId: string;
    };

    if (!messages || !chatId) {
      return new Response("Missing messages or chatId", { status: 400 });
    }

    // Rate Limiting
    const { success } = await ratelimit.limit(`chat:${session.user.id}`);
    if (!success) {
      return new Response("Too many requests", { status: 429 });
    }

    // 1. Initial State: Create the USER message in DB if it doesn't exist
    const lastUserMessage = messages[messages.length - 1];

    if (lastUserMessage?.role === "user") {
      await db.message.create({
        data: {
          chatId,
          role: Role.USER,
          content: lastUserMessage.content,
          status: MessageStatus.COMPLETED,
        },
      });
    }

    // 2. Prepare for Assistant Response (Placeholder)
    const assistantMessage = await db.message.create({
      data: {
        chatId,
        role: Role.ASSISTANT,
        content: "",
        status: MessageStatus.STREAMING,
      },
    });

    const result = streamText({
      model: openai("gpt-4o"),
      messages,
      async onFinish({ text, usage }) {
        // 3. Finalize Message in DB
        await db.message.update({
          where: { id: assistantMessage.id },
          data: {
            content: text,
            status: MessageStatus.COMPLETED,
            tokens: usage.totalTokens,
            modelUsed: "gpt-4o",
          },
        });

        // 4. Update Chat timestamp
        await db.chat.update({
          where: { id: chatId },
          data: { updatedAt: new Date() },
        });
      },
    });

    // Use toUIMessageStreamResponse for AI SDK v6 compatibility with useChat
    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Chat API Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
