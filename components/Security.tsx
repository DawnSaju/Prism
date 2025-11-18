import React from 'react';

export default function Security() {
  return (
    <section id="ben" className="w-full max-w-7xl mx-auto px-4 md:px-8 lg:px-20 py-12 md:py-20 border-l border-r border-dashed border-neutral-800">
      <h2 
        className="text-[rgb(236,236,236)] text-[32px] md:text-[48px] mb-12 md:mb-16 text-center uppercase"
        style={{ fontFamily: '"2 TT_Firs_Neue_DemiBold Unspecified", "2 TT_Firs_Neue_DemiBold Unspecified Placeholder", sans-serif' }}
      >
        Security & Privacy
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        {[
          { title: 'End-to-End Encryption', description: 'All documents encrypted in transit and at rest. Appwrite secure storage with user isolation.' },
          { title: 'No Training on Your Data', description: 'Your documents are never used to train AI models. Private forever with userId filtering.' },
          { title: 'Qdrant Vector Database', description: '768D embeddings with cosine similarity. Payload indexing for fast, secure retrieval.' },
          { title: 'Chat History Persistence', description: 'Save conversations with AI-generated titles. Auto-save, rename, and delete chat sessions.' },
          { title: 'Gemini AI Powered', description: 'text-embedding-004 for embeddings. gemini-2.5-flash for chat and vision with markdown support.' },
          { title: 'Interactive Visualization', description: 'Force-directed graph with UMAP projection. Discover connections across your knowledge base.' }
        ].map((benefit, index) => (
          <div 
            key={index}
            className="flex gap-4 bg-gradient-to-b from-neutral-900/50 to-neutral-900/20 backdrop-blur-sm rounded-2xl p-6 border border-neutral-800/50"
          >
            <div className="flex-shrink-0 w-[18px] h-[18px] mt-1">
              <img 
                src="./elements/star.svg" 
                alt=""
                className="w-full h-full" 
              />
            </div>
            <div className="flex-1">
              <h3 
                className="text-[rgb(236,236,236)] text-[18px] md:text-[20px] mb-2"
                style={{ fontFamily: '"2 TT_Firs_Neue_DemiBold Unspecified", "2 TT_Firs_Neue_DemiBold Unspecified Placeholder", sans-serif' }}
              >
                {benefit.title}
              </h3>
              <p 
                className="text-[rgb(170,170,170)] text-[14px] md:text-[16px] leading-[1.4]"
                style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif' }}
              >
                {benefit.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
