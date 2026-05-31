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
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      let documentIdToCleanup: string | undefined;
      
      const sendUpdate = (data: any) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch (e) {
          console.error("Failed to enqueue SSE update:", e);
        }
      };

      try {
        const { documentId, userId, fileName } = await request.json();
        documentIdToCleanup = documentId;

        if (!documentId || !userId || !fileName) {
          sendUpdate({ error: "Missing important fields" });
          controller.close();
          return;
        }

        sendUpdate({ status: 'initializing', progress: 5, message: 'Initializing vector database...' });
        await initializeCollection();

        sendUpdate({ status: 'downloading', progress: 10, message: 'Downloading document from storage...' });
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

        sendUpdate({ status: 'extracting', progress: 30, message: 'Extracting text content...' });
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
          sendUpdate({ error: "No text content found in document" });
          controller.close();
          return;
        }

        sendUpdate({ status: 'chunking', progress: 40, message: 'Chunking text...' });
        const chunks = chunkText(text, {
          maxChunkSize: 1000,
          overlap: 200,
          splitByHeaders: fileType === "MD",
        });

        sendUpdate({ status: 'embedding', progress: 50, message: `Generating embeddings (0/${chunks.length})...` });
        const embeddings = await batchGenerateEmbeddings(chunks, (completed, total) => {
          const progressPercent = 50 + Math.round((completed / total) * 30);
          sendUpdate({ 
            status: 'embedding', 
            progress: progressPercent, 
            message: `Generating embeddings (${completed}/${total})...` 
          });
        });

        sendUpdate({ status: 'indexing', progress: 85, message: 'Saving vectors to database...' });
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

        sendUpdate({
          success: true,
          documentId,
          documentName: file.name,
          chunks: chunks.length,
          category,
          progress: 100,
          message: "Document indexed successfully",
        });
        
        controller.close();
      } catch (error: any) {
        console.error("Indexing Error:", error);
        
        if (documentIdToCleanup) {
          try {
            await storage.deleteFile(
              process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!,
              documentIdToCleanup
            );
            console.log(`Cleaned up unindexed file: ${documentIdToCleanup}`);
          } catch (cleanupError) {
            console.error('Failed to clean up file after indexing error:', cleanupError);
          }
        }

        sendUpdate({
          error: error.message || "Failed to index document",
          details: error.stack,
        });
        
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
