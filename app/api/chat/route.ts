import { NextRequest, NextResponse } from "next/server";
import { generateChatResponse, generateEmbedding, ChatMessage } from "@/lib/gemini";
import { searchSimilarChunks, initializeCollection } from "@/lib/qdrant";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const { messages, userId, useRAG = true } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Invalid request: messages array is important" },
        { status: 400 }
      );
    }

    const lastUserMessage = messages.filter((m: any) => m.role === "user").pop();
    let contextChunks: any[] = [];
    
    if (useRAG && lastUserMessage && userId) {
      try {
        await initializeCollection();
        const queryEmbedding = await generateEmbedding(lastUserMessage.content);
        contextChunks = await searchSimilarChunks(queryEmbedding, {
          limit: 5,
          userId,
          scoreThreshold: 0.4,
        });
      } catch (error) {}
    }

    const formattedMessages: ChatMessage[] = messages.map((msg: any, index: number) => {
      if (msg.role === "user" && index === messages.length - 1 && contextChunks.length > 0) {
        const contextText = contextChunks
          .map((chunk, i) => `[Source ${i + 1}: ${chunk.documentName}]\n${chunk.chunkText}`)
          .join("\n\n---\n\n");
        
        return {
          role: "user",
          parts: `Context from your documents:\n\n${contextText}\n\n---\n\nUser question: ${msg.content}\n\nPlease answer based on the provided context. If the context doesn't contain relevant information, say so.`,
        };
      }
      
      return {
        role: msg.role === "user" ? "user" : "model",
        parts: msg.content,
      };
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          if (contextChunks.length > 0) {
            const sources = contextChunks.map((chunk, i) => ({
              index: i + 1,
              documentId: chunk.documentId,
              documentName: chunk.documentName,
              documentType: chunk.documentType,
              score: chunk.score,
            }));
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ sources })}\n\n`)
            );
          }

          await generateChatResponse(formattedMessages, (chunk) => {
            const data = `data: ${JSON.stringify({ chunk })}\n\n`;
            controller.enqueue(encoder.encode(data));
          });

          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error: any) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: error.message })}\n\n`)
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
