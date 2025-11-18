import React from 'react';
import { Check } from 'lucide-react';

export default function HowItWorks() {
  return (
    <section className="w-full bg-[rgb(15,15,15)] px-4 md:px-8 lg:px-20 py-16 md:py-24">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 md:mb-16">
          <h2 
            className="text-white text-[48px] md:text-[72px] lg:text-[96px] leading-[0.95] mb-4"
            style={{ fontFamily: '"1 TT_Firs_Neue_ExtraBlack Unspecified", "1 TT_Firs_Neue_ExtraBlack Unspecified Placeholder", sans-serif' }}
          >
            HOW IT
            <br />
            WORKS
          </h2>
          <p 
            className="text-[rgb(130,130,130)] text-[14px] md:text-[16px]"
            style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif' }}
          >
            Upload documents, code, and images. AI creates embeddings.
            <br />
            Search semantically, chat with context, and visualize connections.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="group relative overflow-visible rounded-2xl border border-[rgb(40,40,40)] bg-[rgb(20,20,20)] transition-colors duration-300 hover:border-[rgb(50,50,50)]">
            <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <div className="absolute -inset-px rounded-2xl bg-linear-to-br from-white/10 via-white/5 to-transparent"></div>
            </div>
            <div className="pointer-events-none absolute inset-0 rounded-2xl bg-linear-to-tr from-white/0 to-white/0 transition-colors group-hover:from-white/3 group-hover:to-white/6"></div>
            <div className="pointer-events-none absolute inset-0 hidden group-hover:block">
              <div className="absolute -left-2 -top-2 h-3 w-3 bg-white"></div>
              <div className="absolute -right-2 -top-2 h-3 w-3 bg-white"></div>
              <div className="absolute -left-2 -bottom-2 h-3 w-3 bg-white"></div>
              <div className="absolute -right-2 -bottom-2 h-3 w-3 bg-white"></div>
            </div>
            <div className="relative z-10">
            <div className="p-8 pb-32 relative min-h-[400px]">
              <div className="space-y-4 mb-8">
                {[
                  'Documents: PDF, DOCX, MD, TXT',
                  'Code: 35+ languages supported',
                  'Images: AI vision descriptions',
                  'Drag-and-drop interface'
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-[rgb(130,130,130)] shrink-0" />
                    <span 
                      className="text-[rgb(130,130,130)] text-[14px]"
                      style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif' }}
                    >
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              <button className="bg-[rgb(30,30,30)] border border-[rgb(50,50,50)] rounded-xl px-8 py-4 text-[rgb(200,200,200)] hover:bg-[rgb(35,35,35)] transition-colors group relative overflow-hidden">
                <span 
                  className="relative z-10 text-[14px]"
                  style={{ fontFamily: '"2 TT_Firs_Neue_DemiBold Unspecified", "2 TT_Firs_Neue_DemiBold Unspecified Placeholder", sans-serif' }}
                >
                  UPLOAD DOCUMENTS
                </span>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[rgb(130,130,130)] group-hover:translate-x-1 transition-transform">
                  →
                </div>
              </button>
            </div>
            </div>
          </div>

          <div className="group relative overflow-visible rounded-2xl border border-[rgb(40,40,40)] bg-[rgb(20,20,20)] transition-colors duration-300 hover:border-[rgb(50,50,50)]">
            <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <div className="absolute -inset-px rounded-2xl bg-linear-to-br from-white/10 via-white/5 to-transparent"></div>
            </div>
            <div className="pointer-events-none absolute inset-0 rounded-2xl bg-linear-to-tr from-white/0 to-white/0 transition-colors group-hover:from-white/3 group-hover:to-white/6"></div>
            <div className="pointer-events-none absolute inset-0 hidden group-hover:block">
              <div className="absolute -left-2 -top-2 h-3 w-3 bg-white"></div>
              <div className="absolute -right-2 -top-2 h-3 w-3 bg-white"></div>
              <div className="absolute -left-2 -bottom-2 h-3 w-3 bg-white"></div>
              <div className="absolute -right-2 -bottom-2 h-3 w-3 bg-white"></div>
            </div>
            <div className="relative z-10">
            <div className="p-8 relative min-h-[400px] flex flex-col items-center justify-center">
              <div className="relative w-full h-48 mb-8">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 text-[rgb(167,125,255)]">
                  <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M30 5L35 20L50 15L40 30L55 35L35 40L40 55L30 45L20 55L25 40L5 35L20 30L10 15L25 20L30 5Z" fill="currentColor"/>
                  </svg>
                </div>

                <div className="absolute top-20 left-1/2 -translate-x-1/2 w-full max-w-60">
                  <div className="bg-[rgb(25,25,25)] border border-[rgb(45,45,45)] rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between text-[10px] text-[rgb(100,100,100)]">
                      <span>FILES</span>
                      <span>LOGOS</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-[rgb(100,100,100)]">
                      <span>MEDIA</span>
                      <span>PACKAGING</span>
                    </div>
                    <div className="h-12 bg-[rgb(30,30,30)] rounded flex items-center justify-center">
                      <svg width="40" height="20" viewBox="0 0 40 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 10L10 5L15 15L20 8L25 12L30 6L35 10" stroke="#ff4466" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="bg-[rgb(30,30,30)] rounded px-3 py-2">
                      <div className="text-[9px] text-[rgb(100,100,100)]">YOUR TASK DETAILS</div>
                      <div className="flex gap-2 mt-1">
                        <div className="w-2 h-2 bg-[rgb(60,60,60)] rounded-full"></div>
                        <div className="w-2 h-2 bg-[rgb(60,60,60)] rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 bg-[rgb(15,15,15)] border-t border-[rgb(40,40,40)] p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-[rgb(30,30,30)] border border-[rgb(50,50,50)] rounded flex items-center justify-center">
                  <div className="w-3 h-3 grid grid-cols-2 gap-0.5">
                    <div className="w-1 h-1 bg-[rgb(100,100,100)] rounded-sm"></div>
                    <div className="w-1 h-1 bg-[rgb(100,100,100)] rounded-sm"></div>
                    <div className="w-1 h-1 bg-[rgb(100,100,100)] rounded-sm"></div>
                    <div className="w-1 h-1 bg-[rgb(100,100,100)] rounded-sm"></div>
                  </div>
                </div>
                <h3 
                  className="text-white text-[16px]"
                  style={{ fontFamily: '"2 TT_Firs_Neue_DemiBold Unspecified", "2 TT_Firs_Neue_DemiBold Unspecified Placeholder", sans-serif' }}
                >
                  AI PROCESSING
                </h3>
              </div>
              <p 
                className="text-[rgb(130,130,130)] text-[13px] leading-normal"
                style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif' }}
              >
                Gemini generates 768D embeddings. Qdrant stores vectors with payload indexing. Images get AI-generated descriptions.
              </p>
            </div>
            </div>
          </div>

          <div className="group relative overflow-visible rounded-2xl border border-[rgb(40,40,40)] bg-[rgb(20,20,20)] transition-colors duration-300 hover:border-[rgb(50,50,50)]">
            <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <div className="absolute -inset-px rounded-2xl bg-linear-to-br from-white/10 via-white/5 to-transparent"></div>
            </div>
            <div className="pointer-events-none absolute inset-0 rounded-2xl bg-linear-to-tr from-white/0 to-white/0 transition-colors group-hover:from-white/3 group-hover:to-white/6"></div>
            <div className="pointer-events-none absolute inset-0 hidden group-hover:block">
              <div className="absolute -left-2 -top-2 h-3 w-3 bg-white"></div>
              <div className="absolute -right-2 -top-2 h-3 w-3 bg-white"></div>
              <div className="absolute -left-2 -bottom-2 h-3 w-3 bg-white"></div>
              <div className="absolute -right-2 -bottom-2 h-3 w-3 bg-white"></div>
            </div>
            <div className="relative z-10">
            <div className="p-8 relative min-h-[400px] flex items-center justify-center">
              <div className="relative w-full perspective-1000">
                <div className="relative">
                  <div className="absolute top-0 left-4 w-[calc(100%-2rem)] h-40 bg-linear-to-br from-[rgb(35,35,35)] to-[rgb(25,25,25)] border border-[rgb(50,50,50)] rounded-lg transform rotate-[-8deg] translate-y-2"></div>
                  
                  <div className="absolute top-0 left-2 w-[calc(100%-1rem)] h-40 bg-linear-to-br from-[rgb(40,40,40)] to-[rgb(30,30,30)] border border-[rgb(55,55,55)] rounded-lg transform rotate-[-4deg] translate-y-1"></div>
                  
                  <div className="relative w-full h-40 bg-linear-to-br from-[rgb(45,45,45)] to-[rgb(35,35,35)] border border-[rgb(60,60,60)] rounded-lg p-4 space-y-2">
                    <div className="h-2 w-20 bg-[rgb(80,80,80)] rounded"></div>
                    <div className="h-2 w-full bg-[rgb(70,70,70)] rounded"></div>
                    <div className="h-2 w-full bg-[rgb(70,70,70)] rounded"></div>
                    <div className="h-2 w-3/4 bg-[rgb(70,70,70)] rounded"></div>
                    <div className="flex gap-2 mt-4">
                      <div className="h-6 w-6 bg-[rgb(80,80,80)] rounded"></div>
                      <div className="h-6 w-6 bg-[rgb(80,80,80)] rounded"></div>
                      <div className="h-6 w-6 bg-[rgb(80,80,80)] rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 bg-[rgb(15,15,15)] border-t border-[rgb(40,40,40)] p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-[rgb(30,30,30)] border border-[rgb(50,50,50)] rounded flex items-center justify-center">
                  <div className="w-3 h-3 grid grid-cols-2 gap-0.5">
                    <div className="w-1 h-1 bg-[rgb(100,100,100)] rounded-sm"></div>
                    <div className="w-1 h-1 bg-[rgb(100,100,100)] rounded-sm"></div>
                    <div className="w-1 h-1 bg-[rgb(100,100,100)] rounded-sm"></div>
                    <div className="w-1 h-1 bg-[rgb(100,100,100)] rounded-sm"></div>
                  </div>
                </div>
                <h3 
                  className="text-white text-[16px]"
                  style={{ fontFamily: '"2 TT_Firs_Neue_DemiBold Unspecified", "2 TT_Firs_Neue_DemiBold Unspecified Placeholder", sans-serif' }}
                >
                  GET INSIGHTS
                </h3>
              </div>
              <p 
                className="text-[rgb(130,130,130)] text-[13px] leading-normal"
                style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif' }}
              >
                Semantic search, RAG chat with markdown responses, vector visualization, and smart recommendations across all file types.
              </p>
            </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}