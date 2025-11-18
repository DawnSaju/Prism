import { NextRequest, NextResponse } from "next/server";
import { QdrantClient } from "@qdrant/js-client-rest";
import { UMAP } from "umap-js";
import { Client, Storage } from "node-appwrite";

const COLLECTION_NAME = "prism_documents";

const getAppwriteClient = () => {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);
  return new Storage(client);
};

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId");
    const cleanup = request.nextUrl.searchParams.get("cleanup") === "true";

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is important" },
        { status: 400 }
      );
    }

    if (!process.env.QDRANT_URL || !process.env.QDRANT_API_KEY) {
      return NextResponse.json(
        { error: "Erro in Qdrant configuration" },
        { status: 500 }
      );
    }

    const qdrantClient = new QdrantClient({
      url: process.env.QDRANT_URL,
      apiKey: process.env.QDRANT_API_KEY,
    });

    const scrollResult = await qdrantClient.scroll(COLLECTION_NAME, {
      filter: {
        must: [
          {
            key: "userId",
            match: { value: userId },
          },
        ],
      },
      limit: 100,
      with_payload: true,
      with_vector: true,
    });

    const points = scrollResult.points;

    if (points.length === 0) {
      return NextResponse.json({
        nodes: [],
        links: [],
        totalDocuments: 0,
        totalChunks: 0,
        message: "No documents found",
      });
    }

    const storage = getAppwriteClient();
    let validDocumentIds = new Set<string>();
    let appwriteFiles: any[] = [];

    try {
      const files = await storage.listFiles(
        process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!
      );
      appwriteFiles = files.files;
      validDocumentIds = new Set(files.files.map(file => file.$id));
      console.log(`Found ${files.files.length} total files in Appwrite storage`);
      console.log(`Found ${points.length} vectors in Qdrant for user ${userId}`);
      console.log(`Valid document IDs: ${validDocumentIds.size}`);

      if (files.files.length > 0) {
        console.log(
          `Sample Appwrite IDs:`,
          files.files.slice(0, 3).map(f => f.$id)
        );
      }
      if (points.length > 0) {
        console.log(
          `Sample Qdrant doc IDs:`,
          points.slice(0, 3).map(p => p.payload?.documentId)
        );
      }

      if (files.files.length === 0) {
        console.log(
          `No files in Appwrite bucket - all ${points.length} vectors are unused`
        );
      }
    } catch (error) {
      console.error("Error fetching Appwrite files:", error);
      return NextResponse.json(
        {
          error: "Could not verify documents in storage",
          nodes: [],
          links: [],
          totalDocuments: 0,
          totalChunks: points.length,
        },
        { status: 500 }
      );
    }

    const validPoints =
      appwriteFiles.length === 0
        ? points
        : points.filter(point => {
            const docId = String(point.payload?.documentId || "");
            return validDocumentIds.has(docId);
          });

    if (cleanup) {
      const unusedPoints = points.filter(point => {
        const docId = String(point.payload?.documentId || "");
        return !validDocumentIds.has(docId);
      });

      if (unusedPoints.length > 0) {
        const unusedIds = unusedPoints.map(p => p.id);
        console.log(
          `Cleaning up ${unusedIds.length} unused vectors from Qdrant...`
        );

        await qdrantClient.delete(COLLECTION_NAME, {
          points: unusedIds,
        });

        console.log(`Removed ${unusedIds.length} unused vectors`);
      }
    }

    const filteredPoints = validPoints;

    if (filteredPoints.length === 0) {
      return NextResponse.json({
        nodes: [],
        links: [],
        totalDocuments: 0,
        totalChunks: 0,
        unusedVectors: points.length,
        cleanedUp: false,
        message: "No valid documents found. All vectors are unused.",
      });
    }

    const vectors = filteredPoints.map(point => point.vector as number[]);
    const metadata = filteredPoints.map(point => ({
      id: point.id,
      documentId: String(point.payload?.documentId || ""),
      fileName: String(point.payload?.documentName || "Unknown"),
      documentType: String(point.payload?.documentType || "unknown"),
      category: String(point.payload?.category || "uncategorized"),
      chunkIndex: Number(point.payload?.chunkIndex || 0),
      chunkText: String(point.payload?.chunkText || "").substring(0, 200),
      uploadDate: String(point.payload?.uploadDate || ""),
    }));

    const nNeighbors = Math.min(
      15,
      Math.max(2, Math.floor(vectors.length / 2))
    );

    const umap = new UMAP({
      nComponents: 2,
      nNeighbors: nNeighbors,
      minDist: 0.1,
      spread: 1.0,
    });

    const embedding2D = umap.fit(vectors);

    const xValues = embedding2D.map(coord => coord[0]);
    const yValues = embedding2D.map(coord => coord[1]);
    const xMin = Math.min(...xValues);
    const xMax = Math.max(...xValues);
    const yMin = Math.min(...yValues);
    const yMax = Math.max(...yValues);

    const normalizeRange = 400;
    const nodes = embedding2D.map((coord, i) => {
      const normalizedX =
        ((coord[0] - xMin) / (xMax - xMin)) * normalizeRange -
        normalizeRange / 2;
      const normalizedY =
        ((coord[1] - yMin) / (yMax - yMin)) * normalizeRange -
        normalizeRange / 2;

      return {
        id: String(metadata[i].id),
        x: normalizedX,
        y: normalizedY,
        documentId: metadata[i].documentId,
        fileName: metadata[i].fileName,
        documentType: metadata[i].documentType,
        category: metadata[i].category,
        chunkIndex: metadata[i].chunkIndex,
        chunkText: metadata[i].chunkText,
        uploadDate: metadata[i].uploadDate,
      };
    });

    const documentGroups = new Map<string, typeof nodes>();
    nodes.forEach(node => {
      if (!documentGroups.has(node.documentId)) {
        documentGroups.set(node.documentId, []);
      }
      documentGroups.get(node.documentId)!.push(node);
    });

    const links: Array<{ source: string; target: string }> = [];
    documentGroups.forEach(chunks => {
      if (chunks.length > 1) {
        chunks.sort((a, b) => a.chunkIndex - b.chunkIndex);
        for (let i = 0; i < chunks.length - 1; i++) {
          links.push({
            source: chunks[i].id,
            target: chunks[i + 1].id,
          });
        }
      }
    });

    const uniqueDocuments = new Set(nodes.map(node => node.fileName));
    const unusedCount =
      appwriteFiles.length === 0
        ? 0
        : points.length - filteredPoints.length;

    return NextResponse.json({
      nodes,
      links,
      totalDocuments: uniqueDocuments.size,
      totalChunks: nodes.length,
      unusedVectors: unusedCount,
      cleanedUp: cleanup && unusedCount > 0,
      documentGroups: Array.from(documentGroups.entries()).map(
        ([docId, chunks]) => ({
          documentId: docId,
          fileName: chunks[0]?.fileName || "Unknown",
          chunkCount: chunks.length,
        })
      ),
    });
  } catch (error) {
    console.error("Error fetching vector graph:", error);
    return NextResponse.json(
      { error: "Failed to generate vector graph" },
      { status: 500 }
    );
  }
}
