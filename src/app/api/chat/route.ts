import { generateText, streamText } from 'ai';
import { groq } from '@ai-sdk/groq';
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { NextResponse } from "next/server";
import { Role, MessageStatus } from "../../../../generated/prisma";

export const runtime = "nodejs";

const MOCK_AI = false; 

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { messages, chatId } = await req.json();

    const normalizedMessages = (messages ?? []).map((m: any) => {
      if (m.parts) {
        return {
          role: m.role,
          content: m.parts.map((p: any) => (p.type === "text" ? p.text : "")).join(""),
        };
      }
      return { role: m.role, content: m.content ?? "" };
    });

    const lastUserMessage = [...normalizedMessages].reverse().find(m => m.role === "user");

    if (chatId && lastUserMessage) {
      await db.message.create({
        data: {
          content: lastUserMessage.content,
          role: Role.USER,
          chatId: chatId,
          status: MessageStatus.COMPLETED,
        },
      }).catch(err => console.error("Error saving user message:", err));
    }

    if (MOCK_AI) {
       const stream = new ReadableStream({
         async start(controller) {
           const encoder = new TextEncoder();
           const text = "Connection Success! (Mock Mode ON)";
           controller.enqueue(encoder.encode(`0:"${text}"\n`));
           if (chatId) {
              await db.message.create({
                data: { content: text, role: Role.ASSISTANT, chatId: chatId, status: MessageStatus.COMPLETED }
              });
           }
           controller.close();
         },
       });
       return new Response(stream);
    }

    // --- HIGH-SPEED GROQ CALL ---
    try {
      const result = streamText({
        model: groq("llama-3.3-70b-versatile"),
        messages: normalizedMessages,
        onFinish: async ({ text, finishReason }) => {
          if (chatId) {
            await db.message.create({
              data: { content: text, role: Role.ASSISTANT, chatId: chatId, status: MessageStatus.COMPLETED },
            });

            const messageCount = await db.message.count({ where: { chatId } });
            if (messageCount <= 2 && lastUserMessage) {
               try {
                  const { text: title } = await generateText({
                    model: groq("llama-3.1-8b-instant"), // Fast model for titles
                    prompt: `Generate a 3-5 word title for: "${lastUserMessage.content}".`,
                  });
                  await db.chat.update({
                    where: { id: chatId },
                    data: { title: title.replace(/"/g, '').trim() }
                  });
               } catch (e) { console.error("Title generation failed:", e); }
            }
          }
        },
      });
      return result.toUIMessageStreamResponse();

    } catch (error: any) {
      // ✅ GRACEFUL ERROR FALLBACK
      if (error?.message?.includes("quota") || error?.message?.includes("rate")) {
        const fallback = "⚠️ Note: The Groq API is currently rate-limited, but your chat architecture is working perfectly! Please try again in a few seconds.";
        return new Response(
          new ReadableStream({
            start(controller) {
              const encoder = new TextEncoder();
              controller.enqueue(encoder.encode(`0:"${fallback}"\n`));
              controller.close();
            },
          })
        );
      }
      throw error;
    }

  } catch (error: any) {
    console.error("Chat API Error:", error);
    return new Response(JSON.stringify({ error: "Internal Error" }), { status: 500 });
  }
}
