import { NextRequest, NextResponse } from "next/server";
import { initializeCollection, getRecommendations } from "@/lib/qdrant";
import { Client, Storage } from "node-appwrite";

export const runtime = "nodejs";
export const maxDuration = 60;

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

const storage = new Storage(client);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get("documentId");
    const userId = searchParams.get("userId");
    const limit = parseInt(searchParams.get("limit") || "5");

    if (!documentId) {
      return NextResponse.json(
        { error: "documentId is important" },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: "userId is important" },
        { status: 400 }
      );
    }

    await initializeCollection();

    const recommendations = await getRecommendations(
      documentId,
      userId,
      limit * 2
    );

    const validRecommendations = [];
    for (const rec of recommendations) {
      try {
        await storage.getFile(
          process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!,
          rec.documentId
        );
        validRecommendations.push(rec);

        if (validRecommendations.length >= limit) {
          break;
        }
      } catch (error: any) {}
    }

    return NextResponse.json({
      success: true,
      recommendations: validRecommendations,
      count: validRecommendations.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to get recommendations" },
      { status: 500 }
    );
  }
}
