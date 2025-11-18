import { QdrantClient } from '@qdrant/js-client-rest';

export const qdrantClient = new QdrantClient({
  url: process.env.QDRANT_CLUSTER_URL!,
  apiKey: process.env.QDRANT_API_KEY!,
});

const COLLECTION_NAME = 'prism_documents';
const VECTOR_SIZE = 768;

export async function initializeCollection() {
  try {
    const collections = await qdrantClient.getCollections();
    const exists = collections.collections.some(
      (col) => col.name === COLLECTION_NAME
    );

    if (!exists) {
      await qdrantClient.createCollection(COLLECTION_NAME, {
        vectors: {
          size: VECTOR_SIZE,
          distance: 'Cosine',
        },
        optimizers_config: {
          indexing_threshold: 10000,
        },
      });
      console.log(`Created Qdrant collection: ${COLLECTION_NAME}`);
      
      await qdrantClient.createPayloadIndex(COLLECTION_NAME, {
        field_name: 'userId',
        field_schema: 'keyword',
      });
      console.log(`Created userId index`);
      
      await qdrantClient.createPayloadIndex(COLLECTION_NAME, {
        field_name: 'documentType',
        field_schema: 'keyword',
      });
      console.log(`Created documentType index`);
      
      await qdrantClient.createPayloadIndex(COLLECTION_NAME, {
        field_name: 'category',
        field_schema: 'keyword',
      });
      console.log(`Created category index`);
      
      await qdrantClient.createPayloadIndex(COLLECTION_NAME, {
        field_name: 'documentId',
        field_schema: 'keyword',
      });
      console.log(`Created documentId index`);
    } else {
      console.log(`Collection ${COLLECTION_NAME} already exists`);
      
      try {
        await qdrantClient.createPayloadIndex(COLLECTION_NAME, {
          field_name: 'userId',
          field_schema: 'keyword',
        });
        console.log(`Ensured userId index exists`);
      } catch (e: any) {
        if (!e.message?.includes('already exists')) {
          console.log(`userId index already exists or error:`, e.message);
        }
      }
      
      try {
        await qdrantClient.createPayloadIndex(COLLECTION_NAME, {
          field_name: 'documentType',
          field_schema: 'keyword',
        });
        console.log(`Ensured documentType index exists`);
      } catch (e: any) {
        if (!e.message?.includes('already exists')) {
          console.log(`documentType index already exists or error:`, e.message);
        }
      }
      
      try {
        await qdrantClient.createPayloadIndex(COLLECTION_NAME, {
          field_name: 'category',
          field_schema: 'keyword',
        });
        console.log(`Ensured category index exists`);
      } catch (e: any) {
        if (!e.message?.includes('already exists')) {
          console.log(`category index already exists or error:`, e.message);
        }
      }
      
      try {
        await qdrantClient.createPayloadIndex(COLLECTION_NAME, {
          field_name: 'documentId',
          field_schema: 'keyword',
        });
        console.log(`Ensured documentId index exists`);
      } catch (e: any) {
        if (!e.message?.includes('already exists')) {
          console.log(`documentId index already exists or error:`, e.message);
        }
      }
    }

    return true;
  } catch (error: any) {
    console.error('Failed to initialize Qdrant collection:', error);
    throw error;
  }
}

export async function indexDocumentChunk(
  documentId: string,
  chunkIndex: number,
  chunkText: string,
  embedding: number[],
  metadata: {
    documentName: string;
    documentType: string;
    userId: string;
    uploadDate: string;
    category?: string;
    pageNumber?: number;
    section?: string;
  }
) {
  try {
    const pointId = `${documentId}_chunk_${chunkIndex}`;

    await qdrantClient.upsert(COLLECTION_NAME, {
      wait: true,
      points: [
        {
          id: pointId,
          vector: embedding,
          payload: {
            documentId,
            chunkIndex,
            chunkText,
            documentName: metadata.documentName,
            documentType: metadata.documentType,
            userId: metadata.userId,
            uploadDate: metadata.uploadDate,
            category: metadata.category,
            pageNumber: metadata.pageNumber,
            section: metadata.section,
          },
        },
      ],
    });

    return pointId;
  } catch (error: any) {
    console.error('Failed to index document chunk:', error);
    throw error;
  }
}

export async function batchIndexChunks(
  chunks: Array<{
    documentId: string;
    chunkIndex: number;
    chunkText: string;
    embedding: number[];
    metadata: any;
  }>
) {
  try {
    const invalidChunks = chunks.filter(
      (chunk) => !Array.isArray(chunk.embedding) || chunk.embedding.length !== 768
    );
    
    if (invalidChunks.length > 0) {
      console.error('Invalid embeddings found:', {
        count: invalidChunks.length,
        firstInvalid: {
          length: invalidChunks[0]?.embedding?.length,
          type: typeof invalidChunks[0]?.embedding,
        },
      });
      throw new Error(`Invalid embeddings: expected 768 dimensions, found ${invalidChunks[0]?.embedding?.length || 'undefined'}`);
    }

    const { randomUUID } = await import('node:crypto');
    
    const points = chunks.map((chunk, index) => ({
      id: randomUUID(),
      vector: chunk.embedding,
      payload: {
        documentId: chunk.documentId,
        chunkIndex: chunk.chunkIndex,
        chunkText: chunk.chunkText,
        documentName: chunk.metadata.documentName,
        documentType: chunk.metadata.documentType,
        userId: chunk.metadata.userId,
        uploadDate: chunk.metadata.uploadDate,
        category: chunk.metadata.category,
      },
    }));

    console.log(`Uploading ${points.length} points to Qdrant...`);
    console.log('Sample point structure:', JSON.stringify(points[0], null, 2).substring(0, 500));

    try {
      const response = await qdrantClient.upsert(COLLECTION_NAME, {
        wait: true,
        points,
      });

      console.log('Qdrant upsert response:', response);
      return points.length;
    } catch (upsertError: any) {
      console.error('Upsert failed:', upsertError.message);
      console.error('Error status:', upsertError.status);
      
      if (upsertError.data) {
        console.error('Error data:', upsertError.data);
        console.error('Error data stringified:', JSON.stringify(upsertError.data, null, 2));
      }
      
      console.error('First point sample:', {
        id: points[0].id,
        vectorLength: points[0].vector?.length,
        payloadKeys: Object.keys(points[0].payload || {}),
      });
      
      throw upsertError;
    }
  } catch (error: any) {
    console.error('Failed to batch index chunks:', error);
    throw error;
  }
}

export async function searchSimilarChunks(
  queryEmbedding: number[],
  options: {
    limit?: number;
    userId?: string;
    documentType?: string[];
    scoreThreshold?: number;
  } = {}
) {
  try {
    const {
      limit = 5,
      userId,
      documentType,
      scoreThreshold = 0.7,
    } = options;

    const filter: any = {
      must: [],
    };

    if (userId) {
      filter.must.push({
        key: 'userId',
        match: { value: userId },
      });
    }

    if (documentType && documentType.length > 0) {
      filter.must.push({
        key: 'documentType',
        match: { any: documentType },
      });
    }

    console.log('🔍 Search params:', {
      vectorLength: queryEmbedding.length,
      limit,
      userId,
      documentType,
      scoreThreshold,
      hasFilter: filter.must.length > 0,
    });

    try {
      const allResults = await qdrantClient.search(COLLECTION_NAME, {
        vector: queryEmbedding,
        limit: 3,
        filter: filter.must.length > 0 ? filter : undefined,
        with_payload: true,
      });
      
      console.log(`Top 3 results (any score):`, allResults.map(r => ({
        score: r.score,
        docName: r.payload?.documentName,
      })));

      const searchResult = await qdrantClient.search(COLLECTION_NAME, {
        vector: queryEmbedding,
        limit,
        filter: filter.must.length > 0 ? filter : undefined,
        score_threshold: scoreThreshold,
        with_payload: true,
      });

      console.log(`Search returned ${searchResult.length} results (threshold: ${scoreThreshold})`);

      return searchResult.map((result) => ({
        id: result.id,
        score: result.score,
        documentId: result.payload?.documentId as string,
        chunkText: result.payload?.chunkText as string,
        documentName: result.payload?.documentName as string,
        documentType: result.payload?.documentType as string,
        category: result.payload?.category as string,
        chunkIndex: result.payload?.chunkIndex as number,
        pageNumber: result.payload?.pageNumber as number | undefined,
        section: result.payload?.section as string | undefined,
      }));
    } catch (searchError: any) {
      console.error('Qdrant search error:', searchError.message);
      console.error('Error status:', searchError.status);
      
      if (searchError.data) {
        console.error('Error data:', searchError.data);
        console.error('Error data stringified:', JSON.stringify(searchError.data, null, 2));
      }
      
      throw searchError;
    }
  } catch (error: any) {
    console.error('Search failed:', error);
    throw error;
  }
}

export async function getRecommendations(
  documentId: string,
  userId: string,
  limit: number = 5
) {
  try {
    const response = await fetch(
      `${process.env.QDRANT_CLUSTER_URL}/collections/${COLLECTION_NAME}/points/scroll`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': process.env.QDRANT_API_KEY!,
        },
        body: JSON.stringify({
          filter: {
            must: [
              { key: 'documentId', match: { value: documentId } },
              { key: 'userId', match: { value: userId } },
            ],
          },
          limit: 1,
          with_payload: true,
          with_vector: true,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Scroll API error:', errorData);
      return [];
    }

    const scrollData = await response.json();
    
    if (!scrollData.result?.points || scrollData.result.points.length === 0) {
      console.log(`No chunks found for document ${documentId}`);
      return [];
    }

    const queryVector = scrollData.result.points[0].vector;

    const similar = await qdrantClient.search(COLLECTION_NAME, {
      vector: queryVector,
      limit: limit * 3,
      filter: {
        must: [
          { key: 'userId', match: { value: userId } },
        ],
        must_not: [
          { key: 'documentId', match: { value: documentId } },
        ],
      },
      with_payload: true,
    });

    const documentData = new Map<string, { 
      score: number; 
      payload: any; 
      matchingChunks: Array<{ text: string; score: number }> 
    }>();

    similar.forEach((result) => {
      const docId = result.payload?.documentId as string;
      const chunkText = result.payload?.chunkText as string;
      
      if (!documentData.has(docId)) {
        documentData.set(docId, {
          score: result.score,
          payload: result.payload,
          matchingChunks: [{ text: chunkText, score: result.score }],
        });
      } else {
        const existing = documentData.get(docId)!;
        if (result.score > existing.score) {
          existing.score = result.score;
        }
        existing.matchingChunks.push({ text: chunkText, score: result.score });
        existing.matchingChunks.sort((a, b) => b.score - a.score);
        existing.matchingChunks = existing.matchingChunks.slice(0, 3);
      }
    });

    const SIMILARITY_THRESHOLD = 0.5;
    
    return Array.from(documentData.values())
      .filter((item) => item.score >= SIMILARITY_THRESHOLD)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((item) => ({
        documentId: item.payload.documentId,
        documentName: item.payload.documentName,
        documentType: item.payload.documentType,
        category: item.payload.category,
        score: item.score,
        matchingChunks: item.matchingChunks,
      }));
  } catch (error: any) {
    console.error('Failed to get recommendations:', error);
    throw error;
  }
}

export async function deleteDocumentChunks(documentId: string) {
  try {
    await qdrantClient.delete(COLLECTION_NAME, {
      wait: true,
      filter: {
        must: [
          {
            key: 'documentId',
            match: { value: documentId },
          },
        ],
      },
    });

    console.log(`Deleted all chunks for document: ${documentId}`);
    return true;
  } catch (error: any) {
    console.error('Failed to delete document chunks:', error);
    throw error;
  }
}

export async function getCollectionStats() {
  try {
    const info = await qdrantClient.getCollection(COLLECTION_NAME);
    return {
      vectorCount: info.points_count,
      status: info.status,
      indexedVectorCount: info.indexed_vectors_count,
    };
  } catch (error: any) {
    console.error('Failed to get collection stats:', error);
    return null;
  }
}
