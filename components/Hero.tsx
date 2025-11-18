export default function Hero() {
  return (
    <section className="w-full max-w-7xl mx-auto px-4 md:px-8 lg:px-20">
      <div className="relative py-12 md:py-20 lg:py-24 flex flex-col items-center justify-center gap-8 md:gap-12">
        <div className="absolute top-8 md:top-12 left-4 md:left-8 lg:left-20 w-[10px] h-[10px]">
          <img 
            src="https://storage.googleapis.com/download/storage/v1/b/prd-shared-services.firebasestorage.app/o/h2m-assets%2F41159bd4ad0e106b717ebfe2146ffd3a6502813a.svg?generation=1763119732786221&alt=media" 
            alt=""
            className="w-full h-full" 
          />
        </div>
        <div className="absolute top-8 md:top-12 right-4 md:right-8 lg:right-20 w-[10px] h-[10px]">
          <img 
            src="https://storage.googleapis.com/download/storage/v1/b/prd-shared-services.firebasestorage.app/o/h2m-assets%2F3c43700f79be1ce5c004303cf0177555c99b65cd.svg?generation=1763119732792048&alt=media" 
            alt=""
            className="w-full h-full" 
          />
        </div>

        <p 
          className="text-[rgb(130,130,130)] text-[14px] md:text-[16px] lg:text-[18px] leading-[1.2] text-center max-w-[400px]"
          style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif' }}
        >
          Personal RAG Integrated Semantic Multimodal
        </p>

        <div className="w-[100px] md:w-[125px] h-[16px] md:h-5"></div>

        <div className="relative w-full max-w-5xl px-4 md:px-0">
          <img 
            src={"./brand.png"} 
            alt="Prisma. Connect. Chat. Learn Faster"
            className="w-full h-auto object-contain" 
          />
        </div>

        <a 
          href="/auth/login"
          className="group relative bg-[rgb(30,30,30)] border border-[rgb(50,50,50)] text-white px-10 py-4 rounded-xl text-[14px] md:text-[16px] hover:bg-[rgb(35,35,35)] hover:border-[rgb(60,60,60)] transition-all duration-300 flex items-center gap-3 overflow-hidden"
          style={{ fontFamily: '"2 TT_Firs_Neue_DemiBold Unspecified", "2 TT_Firs_Neue_DemiBold Unspecified Placeholder", sans-serif' }}
        >
          <span className="relative z-10">Get Started Free</span>
          <svg 
            className="w-4 h-4 transition-transform group-hover:translate-x-1 relative z-10" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
        </a>

        <div className="hidden md:flex absolute inset-0 items-center justify-center gap-[15px] -z-10 pointer-events-none">
          <div className="flex-1 h-full border-l border-r border-dashed border-neutral-800" />
          <div className="flex-1 h-full border-l border-r border-dashed border-neutral-800" />
          <div className="flex-1 h-full border-l border-r border-dashed border-neutral-800" />
        </div>
      </div>
    </section>
  );
}
