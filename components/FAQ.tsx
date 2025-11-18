import React from 'react';

export default function FAQ() {
  return (
    <section id="faq" className="w-full max-w-7xl mx-auto px-4 md:px-8 lg:px-20 py-12 md:py-20 border-l border-r border-dashed border-neutral-800">
      <h2 
        className="text-[rgb(236,236,236)] text-[32px] md:text-[48px] mb-12 md:mb-16 text-center uppercase"
        style={{ fontFamily: '"2 TT_Firs_Neue_DemiBold Unspecified", "2 TT_Firs_Neue_DemiBold Unspecified Placeholder", sans-serif' }}
      >
        FAQs
      </h2>

      <div className="max-w-3xl mx-auto space-y-4">
        {[
          {
            q: "What file types can I upload?",
            a: "PRISM supports 46+ file types across three modalities: Documents (PDF, DOCX, MD, TXT), Code (35+ languages including JavaScript, Python, Java, C++, Go, Rust, and more), and Images (JPG, PNG, GIF, WebP, BMP, SVG with AI vision descriptions)."
          },
          {
            q: "How does the chat history feature work?",
            a: "Chat sessions are automatically saved with AI-generated titles based on conversation context. You can rename sessions, load previous conversations, and delete old chats. All history persists across refreshes using Appwrite Databases."
          },
          {
            q: "What is the vector visualization showing?",
            a: "The Insights view displays a force-directed graph of your document embeddings. Using UMAP dimensionality reduction, 768D vectors are projected to 2D space. Color-coded nodes represent documents, and connections show semantic relationships discovered by the AI."
          },
          {
            q: "How does code preview work?",
            a: "When you upload code files, PRISM provides an editor-like preview with line numbers and monospace font. You can view the code, download it, or open it directly in chat for AI-powered explanations and discussions. Supports 35+ programming languages."
          }
        ].map((faq, index) => (
          <details 
            key={index}
            className="group bg-gradient-to-b from-neutral-900/50 to-neutral-900/20 backdrop-blur-sm rounded-2xl border border-neutral-800/50 overflow-hidden"
          >
            <summary 
              className="cursor-pointer p-6 flex items-center justify-between list-none"
            >
              <span 
                className="text-[rgb(160,160,160)] text-[14px] md:text-[16px] group-open:text-[rgb(236,236,236)] transition-colors"
                style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif' }}
              >
                {faq.q}
              </span>
              <div className="w-[14px] h-[14px] flex-shrink-0 ml-4 transition-transform group-open:rotate-180">
                <svg viewBox="0 0 14 14" fill="none" className="w-full h-full">
                  <path d="M7 1L7 13M1 7L13 7" stroke="currentColor" strokeWidth="2" className="text-[rgb(160,160,160)]"/>
                </svg>
              </div>
            </summary>
            <div className="px-6 pb-6">
              <p 
                className="text-[rgb(130,130,130)] text-[14px] md:text-[16px] leading-[1.5]"
                style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif' }}
              >
                {faq.a}
              </p>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
