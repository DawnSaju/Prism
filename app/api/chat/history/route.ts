import { NextRequest, NextResponse } from "next/server";
import { Client, Databases, ID, Query } from "node-appwrite";

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "";
const CHAT_HISTORY_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_CHAT_HISTORY_COLLECTION_ID || "";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is important" },
        { status: 400 }
      );
    }

    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1")
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "")
      .setKey(process.env.APPWRITE_API_KEY || "");

    const databases = new Databases(client);

    const sessions = await databases.listDocuments(
      DATABASE_ID,
      CHAT_HISTORY_COLLECTION_ID,
      [
        Query.equal("userId", userId),
        Query.orderDesc("$updatedAt"),
        Query.limit(100)
      ]
    );

    return NextResponse.json({ sessions: sessions.documents });
  } catch (error: any) {
    console.error("❌ Error fetching chat history:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch chat history" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, title, messages, selectedDocument } = await request.json();

    if (!userId || !messages) {
      return NextResponse.json(
        { error: "User ID and messages are required" },
        { status: 400 }
      );
    }

    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1")
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "")
      .setKey(process.env.APPWRITE_API_KEY || "");

    const databases = new Databases(client);

    const session = await databases.createDocument(
      DATABASE_ID,
      CHAT_HISTORY_COLLECTION_ID,
      ID.unique(),
      {
        userId,
        title: title || "New Chat",
        messages: JSON.stringify(messages),
        selectedDocument: selectedDocument || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    );

    return NextResponse.json({ session });
  } catch (error: any) {
    console.error("❌ Error creating chat session:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create chat session" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { sessionId, title, messages, selectedDocument } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1")
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "")
      .setKey(process.env.APPWRITE_API_KEY || "");

    const databases = new Databases(client);

    const updateData: any = {
      updatedAt: new Date().toISOString(),
    };

    if (title !== undefined) updateData.title = title;
    if (messages !== undefined) updateData.messages = JSON.stringify(messages);
    if (selectedDocument !== undefined) updateData.selectedDocument = selectedDocument;

    const session = await databases.updateDocument(
      DATABASE_ID,
      CHAT_HISTORY_COLLECTION_ID,
      sessionId,
      updateData
    );

    return NextResponse.json({ session });
  } catch (error: any) {
    console.error("❌ Error updating chat session:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update chat session" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1")
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "")
      .setKey(process.env.APPWRITE_API_KEY || "");

    const databases = new Databases(client);

    await databases.deleteDocument(
      DATABASE_ID,
      CHAT_HISTORY_COLLECTION_ID,
      sessionId
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("❌ Error deleting chat session:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete chat session" },
      { status: 500 }
    );
  }
}
