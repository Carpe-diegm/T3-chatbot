import { streamText } from "ai";
import { openai } from "~/lib/openai";

export async function POST(req: Request) {
  console.log(">>> NEW CONVERSATION ROUTE (BYPASSING CACHE)");
  
  try {
    const { messages } = await req.json();

    const result = streamText({
      model: openai("gpt-4o-mini"),
      messages,
      system: "You are a helpful assistant. Keep your response brief.",
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Conversation API Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
