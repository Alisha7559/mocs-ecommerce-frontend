import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { cn, getImageUrl } from "@/lib/utils";

interface AdCarouselProps {
  advertisements: string[];
}

export function AdCarousel({ advertisements }: AdCarouselProps) {
  const [activeAd, setActiveAd] = useState(0);

  useEffect(() => {
    if (advertisements.length <= 1) return;
    const interval = setInterval(() => {
      setActiveAd((prev) => (prev + 1) % advertisements.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [advertisements.length]);

  if (advertisements.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 overflow-hidden">
      <div className="relative w-full flex items-center justify-center h-[180px] sm:h-[300px] lg:h-[70vh] select-none">
        {advertisements.length === 1 ? (
          // Single image: static center card
          <div className="w-[90%] sm:w-[85%] lg:w-[80%] h-full rounded-[1.5rem] sm:rounded-[2.5rem] overflow-hidden bg-stone-950 shadow-soft">
            <img
              src={getImageUrl(advertisements[0])}
              alt="Advertisement Banner"
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          // Multiple images: Centered slide with left and right previews
          <div className="relative w-full h-full flex items-center justify-center overflow-visible">
            {(() => {
              const len = advertisements.length;
              const prevIdx = (activeAd - 1 + len) % len;
              const nextIdx = (activeAd + 1) % len;

              const slides = [
                { idx: prevIdx, position: "left" },
                { idx: activeAd, position: "center" },
                { idx: nextIdx, position: "right" }
              ];

              return slides.map((slide) => {
                const isCenter = slide.position === "center";
                const isLeft = slide.position === "left";
                const isRight = slide.position === "right";

                // Prevent double rendering if length is 2
                if (len === 2 && isLeft && isRight) return null;

                return (
                  <motion.div
                    key={`${slide.idx}-${slide.position}`}
                    onClick={() => {
                      if (isLeft) setActiveAd(prevIdx);
                      if (isRight) setActiveAd(nextIdx);
                    }}
                    initial={false}
                    animate={{
                      x: isCenter
                        ? "0%"
                        : isLeft
                        ? "-46%"
                        : "46%",
                      scale: isCenter ? 1.05 : 0.72,
                      opacity: isCenter ? 1 : 0.38,
                      filter: isCenter ? "blur(0px)" : "blur(1.5px)",
                      zIndex: isCenter ? 10 : 1,
                    }}
                    transition={{
                      duration: 0.85,
                      ease: [0.16, 1, 0.3, 1]
                    }}
                    className={cn(
                      "absolute h-full rounded-[1.5rem] sm:rounded-[2.5rem] overflow-hidden bg-stone-950 cursor-pointer w-[90%] sm:w-[80%] lg:w-[72%] border-0 outline-none",
                      isCenter ? "pointer-events-auto shadow-[0_20px_50px_rgba(0,0,0,0.35)]" : "pointer-events-auto shadow-none hover:opacity-60"
                    )}
                  >
                    <img
                      src={getImageUrl(advertisements[slide.idx])}
                      alt={`Advertisement Banner #${slide.idx + 1}`}
                      className="w-full h-full object-cover pointer-events-none"
                    />
                  </motion.div>
                );
              });
            })()}
          </div>
        )}
      </div>

      {/* Dot Indicators */}
      {advertisements.length > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          {advertisements.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveAd(idx)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300 cursor-pointer border-0 p-0",
                activeAd === idx ? "w-6 bg-primary" : "w-1.5 bg-stone-400"
              )}
              aria-label={`Go to ad slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
