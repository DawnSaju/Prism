import React from "react";
import {
  Search,
  Brain,
  Camera,
  Plug,
  Braces,
  Image,
} from "lucide-react";

export default function Features() {
  return (
    <section className="w-full bg-[rgb(15,15,15)] px-4 md:px-8 lg:px-20 py-16 md:py-24">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 md:mb-16">
          <h2 
            className="text-white text-[48px] md:text-[72px] lg:text-[96px] leading-[0.95] mb-4"
            style={{ fontFamily: '"1 TT_Firs_Neue_ExtraBlack Unspecified", "1 TT_Firs_Neue_ExtraBlack Unspecified Placeholder", sans-serif' }}
          >
            FEATURES
          </h2>
          <p 
            className="text-[rgb(130,130,130)] text-[14px] md:text-[16px]"
            style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif' }}
          >
            Multimodal AI-powered document management with vector search.
            <br />
            Upload documents, code, and images. Get instant insights with RAG.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="group relative overflow-visible rounded-lg border border-zinc-800 bg-[rgb(20,20,20)] p-0 text-card-foreground shadow-sm transition-colors duration-300 hover:border-zinc-700">
              <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-br from-white/10 via-white/5 to-transparent"></div>
              </div>
              <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-tr from-white/0 to-white/0 transition-colors group-hover:from-white/[0.03] group-hover:to-white/[0.06]"></div>
              <div className="pointer-events-none absolute inset-0 hidden group-hover:block">
                <div className="absolute -left-2 -top-2 h-3 w-3 bg-white"></div>
                <div className="absolute -right-2 -top-2 h-3 w-3 bg-white"></div>
                <div className="absolute -left-2 -bottom-2 h-3 w-3 bg-white"></div>
                <div className="absolute -right-2 -bottom-2 h-3 w-3 bg-white"></div>
              </div>
              <div className="relative z-10 flex flex-row items-start gap-3 space-y-1.5 p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900/70 text-zinc-200">
                  <Brain
                    className="h-5 w-5 text-zinc-200"
                    aria-hidden="true"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-medium tracking-tight text-zinc-100">
                      RAG Chat
                    </h3>
                  </div>
                </div>
              </div>
              <div className="relative z-10 p-6 px-6 pb-6 pt-0 text-sm text-zinc-400">
                Chat with your documents using AI. Get context-aware answers with source citations. Save chat history with AI-generated titles.
              </div>
              <div
                className="pointer-events-none absolute inset-0 rounded-xl ring-0 ring-white/0"
                style={{ opacity: 0 }}
              ></div>
            </div>

            <div className="group relative overflow-visible rounded-lg border border-zinc-800 bg-[rgb(20,20,20)] p-0 text-card-foreground shadow-sm transition-colors duration-300 hover:border-zinc-700">
              <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-br from-white/10 via-white/5 to-transparent"></div>
              </div>
              <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-tr from-white/0 to-white/0 transition-colors group-hover:from-white/[0.03] group-hover:to-white/[0.06]"></div>
              <div className="pointer-events-none absolute inset-0 hidden group-hover:block">
                <div className="absolute -left-2 -top-2 h-3 w-3 bg-white"></div>
                <div className="absolute -right-2 -top-2 h-3 w-3 bg-white"></div>
                <div className="absolute -left-2 -bottom-2 h-3 w-3 bg-white"></div>
                <div className="absolute -right-2 -bottom-2 h-3 w-3 bg-white"></div>
              </div>
              <div className="relative z-10 flex flex-row items-start gap-3 space-y-1.5 p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900/70 text-zinc-200">
                  <Camera
                    className="h-5 w-5 text-zinc-200"
                    aria-hidden="true"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-medium tracking-tight text-zinc-100">
                      Multimodal
                    </h3>
                  </div>
                </div>
              </div>
              <div className="relative z-10 p-6 px-6 pb-6 pt-0 text-sm text-zinc-400">
                Support for documents (PDF, DOCX, MD, TXT), 35+ code languages, and images. AI vision generates descriptions for semantic image search.
              </div>
              <div
                className="pointer-events-none absolute inset-0 rounded-xl ring-0 ring-white/0"
                style={{ opacity: 0 }}
              ></div>
            </div>

            <div className="group relative overflow-visible rounded-lg border border-zinc-800 bg-[rgb(20,20,20)] p-0 text-card-foreground shadow-sm transition-colors duration-300 hover:border-zinc-700">
              <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-br from-white/10 via-white/5 to-transparent"></div>
              </div>
              <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-tr from-white/0 to-white/0 transition-colors group-hover:from-white/[0.03] group-hover:to-white/[0.06]"></div>
              <div className="pointer-events-none absolute inset-0 hidden group-hover:block">
                <div className="absolute -left-2 -top-2 h-3 w-3 bg-white"></div>
                <div className="absolute -right-2 -top-2 h-3 w-3 bg-white"></div>
                <div className="absolute -left-2 -bottom-2 h-3 w-3 bg-white"></div>
                <div className="absolute -right-2 -bottom-2 h-3 w-3 bg-white"></div>
              </div>
              <div className="relative z-10 flex flex-row items-start gap-3 space-y-1.5 p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900/70 text-zinc-200">
                  <Plug
                    className="h-5 w-5 text-zinc-200"
                    aria-hidden="true"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-medium tracking-tight text-zinc-100">
                      Code Preview
                    </h3>
                  </div>
                </div>
              </div>
              <div className="relative z-10 p-6 px-6 pb-6 pt-0 text-sm text-zinc-400">
                Editor-like UI with line numbers for code files. Preview 35+ languages with syntax highlighting. Download or chat with code directly.
              </div>
              <div
                className="pointer-events-none absolute inset-0 rounded-xl ring-0 ring-white/0"
                style={{ opacity: 0 }}
              ></div>
            </div>

            <div className="group relative overflow-visible rounded-lg border border-zinc-800 bg-[rgb(20,20,20)] p-0 text-card-foreground shadow-sm transition-colors duration-300 hover:border-zinc-700">
              <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-br from-white/10 via-white/5 to-transparent"></div>
              </div>
              <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-tr from-white/0 to-white/0 transition-colors group-hover:from-white/[0.03] group-hover:to-white/[0.06]"></div>
              <div className="pointer-events-none absolute inset-0 hidden group-hover:block">
                <div className="absolute -left-2 -top-2 h-3 w-3 bg-white"></div>
                <div className="absolute -right-2 -top-2 h-3 w-3 bg-white"></div>
                <div className="absolute -left-2 -bottom-2 h-3 w-3 bg-white"></div>
                <div className="absolute -right-2 -bottom-2 h-3 w-3 bg-white"></div>
              </div>
              <div className="relative z-10 flex flex-row items-start gap-3 space-y-1.5 p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900/70 text-zinc-200">
                  <Braces
                    className="h-5 w-5 text-zinc-200"
                    aria-hidden="true"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-medium tracking-tight text-zinc-100">
                      Vector Insights
                    </h3>
                  </div>
                </div>
              </div>
              <div className="relative z-10 p-6 px-6 pb-6 pt-0 text-sm text-zinc-400">
                Interactive force-directed graph showing document relationships. UMAP projection of 768D vectors to 2D space with color-coded nodes.
              </div>
              <div
                className="pointer-events-none absolute inset-0 rounded-xl ring-0 ring-white/0"
                style={{ opacity: 0 }}
              ></div>
            </div>

            <div className="group relative overflow-visible rounded-lg border border-zinc-800 bg-[rgb(20,20,20)] p-0 text-card-foreground shadow-sm transition-colors duration-300 hover:border-zinc-700">
              <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-br from-white/10 via-white/5 to-transparent"></div>
              </div>
              <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-tr from-white/0 to-white/0 transition-colors group-hover:from-white/[0.03] group-hover:to-white/[0.06]"></div>
              <div className="pointer-events-none absolute inset-0 hidden group-hover:block">
                <div className="absolute -left-2 -top-2 h-3 w-3 bg-white"></div>
                <div className="absolute -right-2 -top-2 h-3 w-3 bg-white"></div>
                <div className="absolute -left-2 -bottom-2 h-3 w-3 bg-white"></div>
                <div className="absolute -right-2 -bottom-2 h-3 w-3 bg-white"></div>
              </div>
              <div className="relative z-10 flex flex-row items-start gap-3 space-y-1.5 p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900/70 text-zinc-200">
                  <Image
                    className="h-5 w-5 text-zinc-200"
                    aria-hidden="true"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-medium tracking-tight text-zinc-100">
                      Smart Recommendations
                    </h3>
                  </div>
                </div>
              </div>
              <div className="relative z-10 p-6 px-6 pb-6 pt-0 text-sm text-zinc-400">
                Discover related documents using vector similarity. Cross-modal recommendations between docs, code, and images with 70% threshold.
              </div>
              <div
                className="pointer-events-none absolute inset-0 rounded-xl ring-0 ring-white/0"
                style={{ opacity: 0 }}
              ></div>
            </div>

            <div className="group relative overflow-visible rounded-lg border border-zinc-800 bg-[rgb(20,20,20)] p-0 text-card-foreground shadow-sm transition-colors duration-300 hover:border-zinc-700">
              <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-br from-white/10 via-white/5 to-transparent"></div>
              </div>
              <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-tr from-white/0 to-white/0 transition-colors group-hover:from-white/[0.03] group-hover:to-white/[0.06]"></div>
              <div className="pointer-events-none absolute inset-0 hidden group-hover:block">
                <div className="absolute -left-2 -top-2 h-3 w-3 bg-white"></div>
                <div className="absolute -right-2 -top-2 h-3 w-3 bg-white"></div>
                <div className="absolute -left-2 -bottom-2 h-3 w-3 bg-white"></div>
                <div className="absolute -right-2 -bottom-2 h-3 w-3 bg-white"></div>
              </div>
              <div className="relative z-10 flex flex-row items-start gap-3 space-y-1.5 p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900/70 text-zinc-200">
                  <Search
                    className="h-5 w-5 text-zinc-200"
                    aria-hidden="true"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-medium tracking-tight text-zinc-100">
                      Semantic Search
                    </h3>
                    <span className="rounded-full border border-zinc-600 px-2 py-0.5 text-[10px] leading-none text-zinc-300">
                      Qdrant
                    </span>
                  </div>
                </div>
              </div>
              <div className="relative z-10 p-6 px-6 pb-6 pt-0 text-sm text-zinc-400">
                Vector search powered by Qdrant and Gemini embeddings. Find documents by meaning, not just keywords. Advanced filters by type and date.
              </div>
              <div
                className="pointer-events-none absolute inset-0 rounded-xl ring-0 ring-white/0"
                style={{ opacity: 0 }}
              ></div>
            </div>
        </div>
      </div>
    </section>
  );
}