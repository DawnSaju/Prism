import { NextRequest, NextResponse } from "next/server";
import { generateEmbedding } from "@/lib/gemini";
import { searchSimilarChunks, initializeCollection } from "@/lib/qdrant";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const { query, userId, documentType, limit = 10, scoreThreshold = 0.5 } = await request.json();

    if (!query || !userId) {
      return NextResponse.json(
        { error: "Missing query or userId" },
        { status: 400 }
      );
    }

    await initializeCollection();

    const queryEmbedding = await generateEmbedding(query);

    const results = await searchSimilarChunks(queryEmbedding, {
      limit,
      userId,
      documentType,
      scoreThreshold,
    });

    const groupedResults = results.reduce((acc: any, result) => {
      const docId = result.documentId;
      if (!acc[docId]) {
        acc[docId] = {
          documentId: docId,
          documentName: result.documentName,
          documentType: result.documentType,
          category: result.category,
          chunks: [],
          maxScore: 0,
        };
      }
      acc[docId].chunks.push({
        chunkIndex: result.chunkIndex,
        chunkText: result.chunkText,
        score: result.score,
      });
      acc[docId].maxScore = Math.max(acc[docId].maxScore, result.score);
      return acc;
    }, {});

    const documents = Object.values(groupedResults).sort(
      (a: any, b: any) => b.maxScore - a.maxScore
    );

    return NextResponse.json({
      success: true,
      query,
      results: results,
      documents,
      totalResults: results.length,
      totalDocuments: documents.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message || "Search failed",
        details: error.stack,
      },
      { status: 500 }
    );
  }
}
