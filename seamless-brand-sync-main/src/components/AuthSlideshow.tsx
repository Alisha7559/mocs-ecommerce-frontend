import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn, getImageUrl } from "@/lib/utils";
import logo from "@/assets/mocs-logo.png";

interface AuthSlideshowProps {
  authSlides: Array<{
    image: string;
    title: string;
    subtitle: string;
  }>;
}

const slideVariants = {
  enter: {
    x: 80,
    opacity: 0,
  },
  center: {
    x: 0,
    opacity: 1,
  },
  exit: {
    x: -80,
    opacity: 0,
  },
};

export function AuthSlideshow({ authSlides }: AuthSlideshowProps) {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    if (!authSlides || authSlides.length === 0) return;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % authSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [authSlides]);

  if (!authSlides || authSlides.length === 0) return null;

  return (
    <div className="relative w-full md:w-[45%] h-[150px] md:h-auto overflow-hidden border-b md:border-b-0 md:border-r border-stone-150 select-none bg-stone-950 rounded-t-[22px] md:rounded-tr-none md:rounded-l-[22px]">
      <AnimatePresence initial={false}>
        <motion.div
          key={activeSlide}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 h-full w-full"
        >
          {/* Cover Background Image */}
          {(() => {
            const fallbackImages = [
              "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800",
              "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800",
              "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=800"
            ];
            const slideImg = authSlides[activeSlide]?.image;
            const imgSrc = slideImg && slideImg.trim() !== "" ? getImageUrl(slideImg) : fallbackImages[activeSlide % fallbackImages.length];
            return (
              <img
                src={imgSrc}
                alt="Auth visual"
                className="absolute inset-0 h-full w-full object-cover object-bottom rounded-t-[22px] md:rounded-tr-none md:rounded-l-[22px]"
                onError={(e) => {
                  e.currentTarget.src = fallbackImages[activeSlide % fallbackImages.length];
                }}
              />
            );
          })()}

          {/* Slideshow dot indicators overlay */}
          <div className="absolute bottom-6 left-6 z-10 hidden md:block bg-stone-950/80 backdrop-blur-md border border-white/10 rounded-full px-3 py-2.5 shadow-lg">
            <div className="flex gap-1.5">
              {authSlides.map((_, idx) => (
                <span
                  key={idx}
                  className={cn(
                    "h-1 rounded-full transition-all duration-300",
                    activeSlide === idx ? "w-6 bg-primary" : "w-2 bg-neutral-600"
                  )}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Logo Brand Overlay */}
      <div className="absolute top-6 left-6 z-20 flex items-center gap-2 drop-shadow-md">
        <img src={logo} alt="MOCS" className="h-6.5 w-auto" />
      </div>
    </div>
  );
}
