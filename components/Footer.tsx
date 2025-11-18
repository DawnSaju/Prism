import React from "react";

export default  function Footer() {
  return (
    <footer className="relative w-full max-w-7xl mx-auto px-4 md:px-8 lg:px-20 py-12 md:py-16 lg:py-20 border-l border-r border-b border-dashed border-neutral-800 overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <h2
          className="text-[#292929] text-[60px] sm:text-[80px] md:text-[100px] lg:text-[120px] xl:text-[170px] uppercase whitespace-nowrap select-none not-italic"
          style={{
            textShadow: '#393939 0px -5px 1px',
            color: "#292929",
            fontFamily:
              '"1 TT_Firs_Neue_ExtraBlack Unspecified", "1 TT_Firs_Neue_ExtraBlack Unspecified Placeholder", sans-serif',
          }}
        >
          PRISM APP
        </h2>
      </div>

      <div className="relative z-10">
        <div className="absolute -top-4 left-0 w-3 h-3 md:w-4 md:h-4">
          <svg
            viewBox="0 0 16 16"
            fill="none"
            className="w-full h-full"
          >
            <path
              d="M8 0L8.5 7.5L16 8L8.5 8.5L8 16L7.5 8.5L0 8L7.5 7.5L8 0Z"
              fill="rgb(170,170,170)"
              fillOpacity="0.3"
            />
          </svg>
        </div>
        <div className="absolute -top-4 right-0 w-3 h-3 md:w-4 md:h-4">
          <svg
            viewBox="0 0 16 16"
            fill="none"
            className="w-full h-full"
          >
            <path
              d="M8 0L8.5 7.5L16 8L8.5 8.5L8 16L7.5 8.5L0 8L7.5 7.5L8 0Z"
              fill="rgb(170,170,170)"
              fillOpacity="0.3"
            />
          </svg>
        </div>

        <div className="flex flex-col items-center md:items-start gap-2 pt-8 md:pt-12"></div>

        <div className="absolute -bottom-4 left-0 w-3 h-3 md:w-4 md:h-4">
          <svg
            viewBox="0 0 16 16"
            fill="none"
            className="w-full h-full"
          >
            <path
              d="M8 0L8.5 7.5L16 8L8.5 8.5L8 16L7.5 8.5L0 8L7.5 7.5L8 0Z"
              fill="rgb(170,170,170)"
              fillOpacity="0.3"
            />
          </svg>
        </div>
        <div className="absolute -bottom-4 right-0 w-3 h-3 md:w-4 md:h-4">
          <svg
            viewBox="0 0 16 16"
            fill="none"
            className="w-full h-full"
          >
            <path
              d="M8 0L8.5 7.5L16 8L8.5 8.5L8 16L7.5 8.5L0 8L7.5 7.5L8 0Z"
              fill="rgb(170,170,170)"
              fillOpacity="0.3"
            />
          </svg>
        </div>
      </div>
    </footer>
  );
}
