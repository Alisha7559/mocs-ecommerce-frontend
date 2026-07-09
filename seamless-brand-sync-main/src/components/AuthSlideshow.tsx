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
    <div className="relative w-full md:w-[45%] h-[150px] md:h-auto overflow-hidden border-b md:border-b-0 md:border-r border-stone-150 select-none bg-stone-950">
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
          <img
            src={getImageUrl(authSlides[activeSlide]?.image)}
            alt="Auth visual"
            className="absolute inset-0 h-full w-full object-cover filter brightness-[0.7] saturate-[0.85]"
          />

          {/* Glowing Dark Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-black/60 pointer-events-none" />

          {/* Title & Description overlay on Desktop/Tablet viewports */}
          <div className="absolute bottom-8 left-8 right-8 z-10 hidden md:block">
            <motion.h2
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="font-display text-2xl font-black text-white leading-tight"
            >
              {authSlides[activeSlide]?.title}
            </motion.h2>
            <motion.p
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.25, duration: 0.4 }}
              className="mt-2 text-xs leading-relaxed text-zinc-300 max-w-[90%]"
            >
              {authSlides[activeSlide]?.subtitle}
            </motion.p>

            {/* Slideshow dot indicators */}
            <div className="mt-5 flex gap-1.5">
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
