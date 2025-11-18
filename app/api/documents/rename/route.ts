import { NextRequest, NextResponse } from "next/server";
import { Client, Storage } from "node-appwrite";
import { QdrantClient } from "@qdrant/js-client-rest";

export const runtime = "nodejs";

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

const storage = new Storage(client);

const qdrant = new QdrantClient({
  url: process.env.QDRANT_CLUSTER_URL!,
  apiKey: process.env.QDRANT_API_KEY!,
});

const COLLECTION_NAME = "prism_documents";

export async function POST(request: NextRequest) {
  try {
    const { documentId, newName } = await request.json();

    if (!documentId || !newName) {
      return NextResponse.json(
        { error: "Missing important fields" },
        { status: 400 }
      );
    }

    if (!newName.trim() || newName.length > 255) {
      return NextResponse.json(
        { error: "Invalid filename" },
        { status: 400 }
      );
    }

    const file = await storage.getFile(
      process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!,
      documentId
    );

    const updatedFile = await storage.updateFile(
      process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!,
      documentId,
      newName
    );

    try {
      await qdrant.setPayload(COLLECTION_NAME, {
        payload: {
          documentName: newName,
        },
        filter: {
          must: [
            {
              key: "documentId",
              match: { value: documentId },
            },
          ],
        },
      });
    } catch (qdrantError) {}

    return NextResponse.json({
      success: true,
      documentId,
      newName,
      message: "File renamed successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message || "Failed to rename file",
        details: error.stack,
      },
      { status: 500 }
    );
  }
}
