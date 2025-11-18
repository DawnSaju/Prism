import mammoth from 'mammoth';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

export const CODE_EXTENSIONS = [
  'js', 'jsx', 'ts', 'tsx', 'py', 'java', 'cpp', 'c', 'h', 'hpp',
  'cs', 'rb', 'go', 'rs', 'php', 'swift', 'kt', 'scala', 'r',
  'css', 'scss', 'sass', 'html', 'xml', 'json', 'yaml', 'yml',
  'sql', 'sh', 'bash', 'ps1', 'bat', 'cmake', 'dockerfile'
];

export const IMAGE_EXTENSIONS = [
  'jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'
];

export async function extractText(
  buffer: Buffer,
  fileType: string
): Promise<string> {
  try {
    const type = fileType.toLowerCase();
    
    if (CODE_EXTENSIONS.includes(type)) {
      return buffer.toString('utf-8');
    }
    
    switch (type) {
      case 'pdf':
        return await extractPdfText(buffer);
      case 'docx':
        return await extractDocxText(buffer);
      case 'md':
      case 'txt':
        return buffer.toString('utf-8');
      default:
        throw new Error(`Unsupported file type: ${fileType}`);
    }
  } catch (error: any) {
    console.error(`Text extraction failed for ${fileType}:`, error);
    throw new Error(`Failed to extract text: ${error.message}`);
  }
}

async function extractPdfText(buffer: Buffer): Promise<string> {
  const PDFParser = (await import('pdf2json')).default;
  
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();
    
    pdfParser.on('pdfParser_dataError', (errData: any) => {
      reject(new Error(errData.parserError || 'PDF parsing failed'));
    });
    
    pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
      try {
        const textContent: string[] = [];
        
        if (pdfData.Pages && Array.isArray(pdfData.Pages)) {
          for (const page of pdfData.Pages) {
            if (page.Texts && Array.isArray(page.Texts)) {
              const pageText = page.Texts
                .map((text: any) => {
                  if (text.R && Array.isArray(text.R)) {
                    return text.R
                      .map((r: any) => decodeURIComponent(r.T || ''))
                      .join(' ');
                  }
                  return '';
                })
                .filter((t: string) => t.trim().length > 0)
                .join(' ');
              
              if (pageText.trim()) {
                textContent.push(pageText);
              }
            }
          }
        }
        
        resolve(textContent.join('\n\n'));
      } catch (error: any) {
        reject(new Error(`Failed to process PDF data: ${error.message}`));
      }
    });
    
    pdfParser.parseBuffer(buffer);
  });
}

async function extractDocxText(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

export function chunkText(
  text: string,
  options: {
    maxChunkSize?: number; 
    overlap?: number;
    splitByHeaders?: boolean;
  } = {}
): string[] {
  const {
    maxChunkSize = 1000, 
    overlap = 200,
    splitByHeaders = false,
  } = options;

  const cleanText = text.replace(/\s+/g, ' ').trim();

  if (cleanText.length === 0) {
    return [];
  }

  if (cleanText.length <= maxChunkSize) {
    return [cleanText];
  }

  const chunks: string[] = [];

  if (splitByHeaders) {
    const headerRegex = /^#{1,6}\s+.+$/gm;
    const sections = cleanText.split(headerRegex);

    for (const section of sections) {
      if (section.trim().length > 0) {
        chunks.push(...splitIntoChunks(section, maxChunkSize, overlap));
      }
    }
  } else {
    chunks.push(...splitIntoChunks(cleanText, maxChunkSize, overlap));
  }

  return chunks.filter((chunk) => chunk.trim().length > 0);
}

function splitIntoChunks(
  text: string,
  maxSize: number,
  overlap: number
): string[] {
  const chunks: string[] = [];
  let start = 0;

  if (maxSize <= 0 || overlap < 0 || overlap >= maxSize) {
    console.error('Invalid chunk parameters:', { maxSize, overlap });
    return [text];
  }

  while (start < text.length) {
    let end = Math.min(start + maxSize, text.length);

    if (end < text.length) {
      const sentenceEnd = text.lastIndexOf('. ', end);
      const paragraphEnd = text.lastIndexOf('\n', end);

      const breakPoint = Math.max(sentenceEnd, paragraphEnd);
      if (breakPoint > start + overlap) {
        end = breakPoint + 1;
      }
    }

    const chunk = text.substring(start, end).trim();
    if (chunk.length > 0) {
      chunks.push(chunk);
    }

    const newStart = end - overlap;
    if (newStart <= start) {
      start = start + Math.max(1, maxSize - overlap);
    } else {
      start = newStart;
    }

    if (end >= text.length) break;
  }

  return chunks;
}

export function chunkMarkdown(markdown: string, maxChunkSize: number = 1000): string[] {
  const chunks: string[] = [];
  const lines = markdown.split('\n');

  let currentChunk = '';
  let currentHeader = '';

  for (const line of lines) {
    const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);

    if (headerMatch) {
      if (currentChunk.trim().length > 0) {
        chunks.push(currentChunk.trim());
      }

      currentHeader = line;
      currentChunk = line + '\n';
    } else {
      currentChunk += line + '\n';

      if (currentChunk.length > maxChunkSize) {
        const sentences = currentChunk.split(/\. |\n/);
        let tempChunk = currentHeader + '\n';

        for (const sentence of sentences) {
          if ((tempChunk + sentence).length > maxChunkSize) {
            chunks.push(tempChunk.trim());
            tempChunk = currentHeader + '\n' + sentence;
          } else {
            tempChunk += sentence + '. ';
          }
        }

        currentChunk = tempChunk;
      }
    }
  }

  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }

  return chunks.filter((chunk) => chunk.length > 20);
}

export function detectFileType(filename: string): string {
  const extension = filename.split('.').pop()?.toLowerCase();

  if (!extension) return 'UNKNOWN';

  if (CODE_EXTENSIONS.includes(extension)) {
    return extension.toUpperCase();
  }

  if (IMAGE_EXTENSIONS.includes(extension)) {
    return 'IMAGE';
  }

  switch (extension) {
    case 'pdf':
      return 'PDF';
    case 'doc':
    case 'docx':
      return 'DOCX';
    case 'md':
    case 'markdown':
      return 'MD';
    case 'txt':
      return 'TXT';
    default:
      return 'UNKNOWN';
  }
}

export function detectCategory(filename: string, content?: string): string {
  const lower = filename.toLowerCase();
  const extension = filename.split('.').pop()?.toLowerCase();

  if (extension && CODE_EXTENSIONS.includes(extension)) {
    return 'Code';
  }

  if (extension && IMAGE_EXTENSIONS.includes(extension)) {
    return 'Image';
  }

  if (lower.includes('resume') || lower.includes('cv')) return 'Resume';
  if (lower.includes('report')) return 'Report';
  if (lower.includes('invoice') || lower.includes('receipt')) return 'Financial';
  if (lower.includes('contract') || lower.includes('agreement')) return 'Legal';
  if (lower.includes('note')) return 'Notes';
  if (lower.includes('meeting')) return 'Meeting';
  if (lower.includes('presentation') || lower.includes('slide')) return 'Presentation';

  if (content) {
    if (content.includes('function ') || content.includes('class ') || content.includes('import ')) {
      return 'Code';
    }
    if (content.match(/^#{1,6}\s/m)) {
      return 'Documentation';
    }
  }

  return 'General';
}
