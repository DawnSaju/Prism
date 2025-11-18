import { NextRequest, NextResponse } from "next/server";
import { Client, Storage } from "node-appwrite";
import { extractText, chunkText, detectFileType, detectCategory, IMAGE_EXTENSIONS } from "@/lib/document-processor";
import { batchGenerateEmbeddings, generateImageDescription } from "@/lib/gemini";
import { initializeCollection, batchIndexChunks } from "@/lib/qdrant";

export const runtime = "nodejs";
export const maxDuration = 300;

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

const storage = new Storage(client);

export async function POST(request: NextRequest) {
  try {
    const { documentId, userId, fileName } = await request.json();

    if (!documentId || !userId || !fileName) {
      return NextResponse.json(
        { error: "Missing important fields" },
        { status: 400 }
      );
    }

    await initializeCollection();

    const file = await storage.getFile(
      process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!,
      documentId
    );

    const fileBuffer = await storage.getFileDownload(
      process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!,
      documentId
    );

    const buffer = Buffer.isBuffer(fileBuffer) ? fileBuffer : Buffer.from(fileBuffer);

    const fileType = detectFileType(file.name);
    const extension = file.name.split(".").pop()?.toLowerCase() || "";

    let text = "";

    if (IMAGE_EXTENSIONS.includes(extension)) {
      const mimeTypes: { [key: string]: string } = {
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        png: "image/png",
        gif: "image/gif",
        webp: "image/webp",
        bmp: "image/bmp",
        svg: "image/svg+xml",
      };
      const mimeType = mimeTypes[extension] || "image/jpeg";

      try {
        text = await generateImageDescription(buffer, mimeType);
      } catch (visionError: any) {
        text =
          `Image file: ${file.name}. Format: ${extension.toUpperCase()}. ` +
          `Uploaded on ${new Date(file.$createdAt).toLocaleDateString()}. ` +
          `File size: ${(file.sizeOriginal / 1024).toFixed(1)} KB. ` +
          `This image could not be automatically analyzed. Manual tagging recommended.`;
      }
    } else {
      text = await extractText(buffer, fileType);
    }

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: "No text content found in document" },
        { status: 400 }
      );
    }

    const chunks = chunkText(text, {
      maxChunkSize: 1000,
      overlap: 200,
      splitByHeaders: fileType === "MD",
    });

    const embeddings = await batchGenerateEmbeddings(chunks);

    const category = detectCategory(file.name, text);

    const indexData = chunks.map((chunkText, index) => ({
      documentId: documentId,
      chunkIndex: index,
      chunkText: chunkText,
      embedding: embeddings[index],
      metadata: {
        documentName: file.name,
        documentType: fileType,
        userId: userId,
        uploadDate: file.$createdAt,
        category: category,
      },
    }));

    await batchIndexChunks(indexData);

    return NextResponse.json({
      success: true,
      documentId,
      documentName: file.name,
      chunks: chunks.length,
      category,
      message: "Document indexed successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message || "Failed to index document",
        details: error.stack,
      },
      { status: 500 }
    );
  }
}
