import { NextRequest, NextResponse } from "next/server";
import { deleteDocumentChunks } from "@/lib/qdrant";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const { documentId } = await request.json();

    if (!documentId) {
      return NextResponse.json(
        { error: "documentId is important" },
        { status: 400 }
      );
    }

    await deleteDocumentChunks(documentId);

    return NextResponse.json({
      success: true,
      message: "Document deleted from vector database",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete document" },
      { status: 500 }
    );
  }
}
