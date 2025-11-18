import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

const model = genAI.getGenerativeModel({ 
  model: 'gemini-2.5-flash',
  generationConfig: {
    temperature: 0.7,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 2048,
  },
});

export interface ChatMessage {
  role: 'user' | 'model';
  parts: string;
}


export async function generateChatResponse(
  messages: ChatMessage[],
  onChunk?: (chunk: string) => void
): Promise<string> {
  try {
    const filteredMessages = messages.filter((msg, index) => {
      if (msg.role === 'user') return true;
      return index > 0 && messages[index - 1].role === 'user';
    });

    if (filteredMessages.length === 1 && filteredMessages[0].role === 'user') {
      const result = await model.generateContentStream(filteredMessages[0].parts);
      
      let fullResponse = '';
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        fullResponse += chunkText;
        if (onChunk) {
          onChunk(chunkText);
        }
      }
      return fullResponse;
    }

    const history = filteredMessages.slice(0, -1).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.parts }],
    }));
    
    const currentMessage = filteredMessages[filteredMessages.length - 1].parts;

    const chat = model.startChat({
      history,
    });

    const result = await chat.sendMessageStream(currentMessage);

    let fullResponse = '';
    
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      fullResponse += chunkText;
      
      if (onChunk) {
        onChunk(chunkText);
      }
    }

    return fullResponse;
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    throw new Error(error.message || 'Failed to generate response');
  }
}

export async function generateRAGResponse(
  query: string,
  documentContext: string[],
  onChunk?: (chunk: string) => void
): Promise<string> {
  try {
    const contextText = documentContext.join('\n\n---\n\n');
    
    const prompt = `You are an AI assistant named PRISM built by Neurhack. You have access to the user's Prism document library. Answer the question based ONLY on the provided context. If the context doesn't contain enough information, say so clearly. Always be accurate and cite which document section your answer comes from.

CONTEXT FROM DOCUMENTS:
${contextText}

USER QUESTION: ${query}

ANSWER:`;

    const result = await model.generateContentStream(prompt);

    let fullResponse = '';
    
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      fullResponse += chunkText;
      
      if (onChunk) {
        onChunk(chunkText);
      }
    }

    return fullResponse;
  } catch (error: any) {
    console.error('Gemini RAG Error:', error);
    throw new Error(error.message || 'Failed to generate response');
  }
}

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const embeddingModel = genAI.getGenerativeModel({
      model: 'text-embedding-004',
    });

    const result = await embeddingModel.embedContent(text);
    return result.embedding.values;
  } catch (error: any) {
    console.error('Gemini Embedding Error:', error);
    throw new Error(error.message || 'Failed to generate embedding');
  }
}

export async function batchGenerateEmbeddings(texts: string[]): Promise<number[][]> {
  try {
    const embeddingModel = genAI.getGenerativeModel({
      model: 'text-embedding-004',
    });

    const batchSize = 100;
    const results: number[][] = [];

    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      const batchPromises = batch.map((text) => embeddingModel.embedContent(text));
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults.map((r) => r.embedding.values));
    }

    return results;
  } catch (error: any) {
    console.error('Gemini Batch Embedding Error:', error);
    throw new Error(error.message || 'Failed to generate embeddings');
  }
}

export async function generateImageDescription(
  imageBuffer: Buffer,
  mimeType: string,
  maxRetries: number = 3
): Promise<string> {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const visionModel = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
      });

      const base64Image = imageBuffer.toString('base64');

      const prompt = `Analyze this image in detail and provide a comprehensive description. Include:
1. Main subjects or objects in the image
2. Actions or activities taking place
3. Setting, background, and environment
4. Colors, lighting, and visual style
5. Any text, logos, or symbols visible
6. Overall mood or purpose of the image

Provide a clear, searchable description that would help someone find this image later.`;

      const result = await visionModel.generateContent([
        prompt,
        {
          inlineData: {
            data: base64Image,
            mimeType: mimeType,
          },
        },
      ]);

      const response = await result.response;
      return response.text();
      
    } catch (error: any) {
      lastError = error;
      
      const isRetryable = error.status === 503 || error.status === 429;
      
      if (isRetryable && attempt < maxRetries) {
        const delayMs = Math.pow(2, attempt) * 1000;
        console.warn(`⚠️  Gemini Vision overloaded (attempt ${attempt}/${maxRetries}), retrying in ${delayMs/1000}s...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        continue;
      }
      
      console.error('Gemini Vision Error:', error);
      throw new Error(error.message || 'Failed to generate image description');
    }
  }
  
  throw lastError;
}

export async function generateChatTitle(messages: any[]): Promise<string> {
  try {
    const userMessages = messages
      .filter(msg => msg.role === 'user')
      .slice(0, 3)
      .map(msg => msg.content)
      .join('\n');

    if (!userMessages) {
      return 'New Chat';
    }

    const prompt = `Based on this conversation, generate a very short, descriptive title (maximum 5 words, no quotes or special characters). Just return the title text:

${userMessages}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let title = response.text().trim();
    
    title = title.replace(/['"]/g, '').slice(0, 50);
    
    return title || 'New Chat';
  } catch (error: any) {
    console.error('Error generating chat title:', error);
    return 'New Chat';
  }
}
