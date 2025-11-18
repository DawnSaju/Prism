import React from "react";

const logos = [
  { type: "image", src: "./qdrant.svg", alt: "Qdrant", width: 106, height: 30 },
  { type: "dot", color: "bg-[rgb(163,254,196)]" },
  { type: "image", src: "./function1.svg", alt: "Function1", width: 136, height: 30 },
  { type: "dot", color: "bg-[rgb(255,108,122)]" },
  { type: "image", src: "./googledeepmind.svg", alt: "Google Deep Mind", width: 129, height: 30 },
  { type: "dot", color: "bg-[rgb(73,236,255)]" },
  { type: "image", src: "./googleaistudio2.svg", alt: "Google AI Studio", width: 154, height: 30 },
  { type: "dot", color: "bg-[rgb(163,254,196)]" },
];

export default function LogoSlider() {
  const duplicatedLogos = [...logos, ...logos, ...logos, ...logos];

  return (
    <section className="w-full max-w-7xl mx-auto px-4 md:px-8 lg:px-20">
      <div className="flex flex-col gap-6 md:gap-[30px] py-6 md:py-0">
        <div className="flex items-center justify-between w-full">
          <img src="./elements/element1.svg" alt="" className="w-[10px] h-[10px]" />
          <img src="./elements/element1.svg" alt="" className="w-[10px] h-[10px]" />
        </div>

        <div className="relative w-full h-[60px] md:h-[89px] overflow-hidden">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'url("./bg.avif")',
              backgroundSize: "22px",
            }}
          />

          <div className="relative w-full h-full flex items-center overflow-hidden">
            <div className="flex items-center gap-6 md:gap-[40px] animate-marquee">
              {duplicatedLogos.map((logo, index) => (
                <div key={index} className="flex-shrink-0">
                  {logo.type === "dot" ? (
                    <div className={`w-[6px] h-[6px] rounded-[1px] ${logo.color}`} />
                  ) : (
                    <div
                      className="relative flex items-center justify-center"
                      style={{
                        width: `${Math.min((logo.width ?? 0) * 1.2, logo.width ?? 0)}px`,
                        height: `${Math.min((logo.height ?? 0) * 2, logo.height ?? 0)}px`,
                      }}
                    >
                      <img
                        src={logo.src}
                        alt={logo.alt}
                        className="w-full h-full object-contain opacity-80 hover:opacity-100 transition-opacity"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="absolute left-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-r from-[rgb(15,15,15)] to-transparent pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-l from-[rgb(15,15,15)] to-transparent pointer-events-none" />
        </div>
      </div>
    </section>
  );
}
