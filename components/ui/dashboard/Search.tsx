"use client";

import React, { useState } from 'react';
import { Search as SearchIcon, FileText, Sparkles, Filter, X } from 'lucide-react';

interface SearchResult {
  id: string;
  score: number;
  documentId: string;
  documentName: string;
  documentType: string;
  category: string;
  chunkText: string;
  chunkIndex: number;
}

interface GroupedDocument {
  documentId: string;
  documentName: string;
  documentType: string;
  category: string;
  maxScore: number;
  chunks: Array<{
    chunkIndex: number;
    chunkText: string;
    score: number;
  }>;
}

export default function Search({ userId }: { userId: string }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [documents, setDocuments] = useState<GroupedDocument[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch('/api/search/semantic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query.trim(),
          userId,
          documentType: filterType === 'ALL' ? undefined : [filterType],
          limit: 20,
          scoreThreshold: 0.6,
        }),
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setResults(data.results || []);
      setDocuments(data.documents || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      PDF: 'rgb(255,108,122)',
      DOCX: 'rgb(108,156,255)',
      MD: 'rgb(163,254,196)',
      TXT: 'rgb(255,199,108)',
    };
    return colors[type.toUpperCase()] || 'rgb(200,200,200)';
  };

  const getCategoryBadge = (category: string) => {
    const badges: Record<string, string> = {
      Resume: '👤',
      Report: '📊',
      Article: '📰',
      Code: '💻',
      Research: '🔬',
      Legal: '⚖️',
      Financial: '💰',
    };
    return badges[category] || '📄';
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-[rgb(30,30,30)] border border-[rgb(50,50,50)] flex items-center justify-center">
            {/* <Sparkles className="w-6 h-6 text-[rgb(163,254,196)]" /> */}
            <Sparkles className="w-6 h-6 text-[rgb(255,255,255)]" />
          </div>
          <div>
            <h2 
              className="text-[rgb(236,236,236)] text-[24px]"
              style={{ fontFamily: '"2 TT_Firs_Neue_DemiBold Unspecified", "2 TT_Firs_Neue_DemiBold Unspecified Placeholder", sans-serif' }}
            >
              Semantic Search
            </h2>
            <p 
              className="text-[rgb(130,130,130)] text-[14px]"
              style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif' }}
            >
              Find documents by meaning, not just keywords
            </p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="relative">
          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgb(130,130,130)]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask a question or describe what you're looking for..."
              className="w-full pl-12 pr-32 py-4 bg-[rgb(20,20,20)] border border-[rgb(40,40,40)] rounded-xl text-[rgb(236,236,236)] placeholder-[rgb(100,100,100)] focus:outline-none focus:border-[rgb(60,60,60)]"
              style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif' }}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="px-3 py-2 bg-[rgb(30,30,30)] border border-[rgb(50,50,50)] text-[rgb(200,200,200)] rounded-lg hover:bg-[rgb(35,35,35)] transition-colors"
              >
                <Filter className="size-4" />
              </button>
              <button
                type="submit"
                disabled={isSearching || !query.trim()}
                className="px-6 py-2 bg-white text-[rgb(15,15,15)] rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif' }}
              >
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="mt-3 p-4 bg-[rgb(20,20,20)] border border-[rgb(40,40,40)] rounded-xl">
              <p 
                className="text-[rgb(200,200,200)] text-[12px] mb-3"
                style={{ fontFamily: "'Geist Mono', ui-monospace" }}
              >
                DOCUMENT TYPE
              </p>
              <div className="flex gap-2">
                {['ALL', 'PDF', 'DOCX', 'MD', 'TXT'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFilterType(type)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      filterType === type
                        ? 'bg-white text-[rgb(15,15,15)]'
                        : 'bg-[rgb(30,30,30)] border border-[rgb(50,50,50)] text-[rgb(200,200,200)] hover:bg-[rgb(35,35,35)]'
                    }`}
                    style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif' }}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          )}
        </form>
      </div>

      {documents.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p 
              className="text-[rgb(200,200,200)] text-[14px]"
              style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif' }}
            >
              Found {documents.length} relevant {documents.length === 1 ? 'document' : 'documents'}
            </p>
            <button
              onClick={() => {
                setQuery('');
                setResults([]);
                setDocuments([]);
              }}
              className="text-[rgb(130,130,130)] hover:text-[rgb(200,200,200)] transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="space-y-4 max-h-[calc(100vh-400px)] overflow-y-auto pr-2 custom-scrollbar">
            {documents.map((doc) => (
              <div
                key={doc.documentId}
                className="bg-[rgb(20,20,20)] border border-[rgb(40,40,40)] rounded-xl p-6 hover:border-[rgb(60,60,60)] transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-10 h-10 rounded-xl bg-[rgb(30,30,30)] border border-[rgb(50,50,50)] flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-[rgb(230,230,230)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 
                        className="text-[rgb(236,236,236)] text-[16px] mb-2 truncate"
                        style={{ fontFamily: '"2 TT_Firs_Neue_DemiBold Unspecified", "2 TT_Firs_Neue_DemiBold Unspecified Placeholder", sans-serif' }}
                      >
                        {doc.documentName}
                      </h3>
                      <div className="flex gap-2">
                        <span
                          className="px-2 py-1 rounded text-[11px]"
                          style={{
                            fontFamily: "'Geist Mono', ui-monospace",
                            backgroundColor: `${getTypeColor(doc.documentType)}20`,
                            color: getTypeColor(doc.documentType),
                          }}
                        >
                          {doc.documentType.toUpperCase()}
                        </span>
                        <span
                          className="px-2 py-1 rounded text-[11px] bg-[rgb(30,30,30)] text-[rgb(200,200,200)]"
                          style={{ fontFamily: "'Geist Mono', ui-monospace" }}
                        >
                          {getCategoryBadge(doc.category)} {doc.category}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div 
                      className="text-[rgb(163,254,196)] text-[20px]"
                      style={{ fontFamily: '"2 TT_Firs_Neue_DemiBold Unspecified", "2 TT_Firs_Neue_DemiBold Unspecified Placeholder", sans-serif' }}
                    >
                      {Math.round(doc.maxScore * 100)}%
                    </div>
                    <p 
                      className="text-[rgb(130,130,130)] text-[11px]"
                      style={{ fontFamily: "'Geist Mono', ui-monospace" }}
                    >
                      RELEVANCE
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {doc.chunks.slice(0, 2).map((chunk, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-[rgb(25,25,25)] border border-[rgb(35,35,35)] rounded-lg"
                    >
                      <p 
                        className="text-[rgb(200,200,200)] text-[14px] leading-relaxed line-clamp-3"
                        style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif' }}
                      >
                        {chunk.chunkText}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span 
                          className="text-[rgb(100,100,100)] text-[11px]"
                          style={{ fontFamily: "'Geist Mono', ui-monospace" }}
                        >
                          Chunk {chunk.chunkIndex + 1}
                        </span>
                        <span 
                          className="text-[rgb(130,130,130)] text-[11px]"
                          style={{ fontFamily: "'Geist Mono', ui-monospace" }}
                        >
                          {Math.round(chunk.score * 100)}% match
                        </span>
                      </div>
                    </div>
                  ))}
                  {doc.chunks.length > 2 && (
                    <p 
                      className="text-[rgb(130,130,130)] text-[12px] text-center"
                      style={{ fontFamily: "'Geist Mono', ui-monospace" }}
                    >
                      +{doc.chunks.length - 2} more matching sections
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!isSearching && documents.length === 0 && query && (
        <div className="text-center py-16">
          <div className="size-16 rounded-full bg-[rgb(30,30,30)] border border-[rgb(50,50,50)] flex items-center justify-center mx-auto mb-4">
            <SearchIcon className="size-8 text-[rgb(130,130,130)]" />
          </div>
          <p 
            className="text-[rgb(200,200,200)] text-[16px] mb-2"
            style={{ fontFamily: '"2 TT_Firs_Neue_DemiBold Unspecified", "2 TT_Firs_Neue_DemiBold Unspecified Placeholder", sans-serif' }}
          >
            No results found
          </p>
          <p 
            className="text-[rgb(130,130,130)] text-[14px]"
            style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif' }}
          >
            Try adjusting your search query or filters
          </p>
        </div>
      )}

      {!query && documents.length === 0 && (
        <div className="text-center py-16">
          <div className="size-16 rounded-full bg-[rgb(30,30,30)] border border-[rgb(50,50,50)] flex items-center justify-center mx-auto mb-4">
            {/* <Sparkles className="size-8 text-[rgb(163,254,196)]" /> */}
            <Sparkles className="size-8 text-[rgb(255,255,255)]" />
          </div>
          <p 
            className="text-[rgb(200,200,200)] text-[16px] mb-2"
            style={{ fontFamily: '"2 TT_Firs_Neue_DemiBold Unspecified", "2 TT_Firs_Neue_DemiBold Unspecified Placeholder", sans-serif' }}
          >
            Start searching semantically
          </p>
          <p 
            className="text-[rgb(130,130,130)] text-[14px]"
            style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif' }}
          >
            Ask questions in natural language
          </p>
        </div>
      )}
    </div>
  );
}
