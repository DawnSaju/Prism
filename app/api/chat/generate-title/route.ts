import { NextRequest, NextResponse } from "next/server";
import { generateChatTitle } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages are importaant" },
        { status: 400 }
      );
    }

    const title = await generateChatTitle(messages);

    return NextResponse.json({ title });
  } catch (error: any) {
    console.error("Error generating chat title:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate title" },
      { status: 500 }
    );
  }
}
