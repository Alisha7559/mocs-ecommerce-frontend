import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { apiClient, API_BASE_URL } from "@/lib/api";
import { cn } from "@/lib/utils";
import heroShoe from "@/assets/hero-shoe.png";

type Slide = {
  bg: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  cta: string;
  to: "/shop" | "/about" | "/contact";
};

const defaultSlides: Slide[] = [];

export function Hero() {
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState(1);
  const [heroSlides, setHeroSlides] = useState<Slide[]>(defaultSlides);

  // Fetch dynamic hero slides from backend settings
  useEffect(() => {
    const fetchHeroSettings = async () => {
      try {
        const res = await apiClient.settings.get("hero_slides");
        if (res && res.value && Array.isArray(res.value) && res.value.length > 0) {
          const mapped = res.value.map((slide: any) => ({
            ...slide,
            bg: slide.bg.startsWith("/") ? `${API_BASE_URL}${slide.bg}` : slide.bg,
          }));
          setHeroSlides(mapped);
        }
      } catch (err) {
        console.warn("Failed to load dynamic hero slides, using fallback", err);
      }
    };
    fetchHeroSettings();
  }, []);

  // Preload dynamic slides
  useEffect(() => {
    heroSlides.forEach((slide) => {
      const img = new Image();
      img.src = slide.bg;
    });
  }, [heroSlides]);

  useEffect(() => {
    if (heroSlides.length === 0) return;
    const t = setInterval(() => {
      setDirection(1);
      setActive((a) => (a + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(t);
  }, [heroSlides.length]);

  const go = (i: number) => {
    setDirection(i > active ? 1 : -1);
    setActive(i);
  };

  const renderTitle = (title: string) => {
    const lines = title.split("\n").map((line) => line.trim());
    return lines.map((line, index) => {
      const words = line.split(" ");
      if (words.length === 0 || !line) return null;
      const lastWord = words[words.length - 1];
      const rest = words.slice(0, words.length - 1).join(" ");
      return (
        <span key={index} className="block">
          {rest} {rest ? " " : ""}<span className="text-primary">{lastWord}</span>
        </span>
      );
    });
  };

  if (heroSlides.length === 0) {
    return (
      <section className="relative h-[70vh] min-h-[500px] w-full overflow-hidden bg-stone-950 text-white border-b border-stone-900 flex items-center justify-center">
        <div className="text-stone-500 text-sm font-medium animate-pulse uppercase tracking-widest">Loading...</div>
      </section>
    );
  }

  const current = heroSlides[active];

  return (
    <section className="relative h-[35vh] min-h-[250px] sm:h-[40vh] sm:min-h-[280px] lg:h-[45vh] lg:min-h-[320px] w-full overflow-hidden bg-stone-950 text-white border-b border-stone-900">
      
      {/* 1. Image Container: full absolute background, centered on footwear */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <AnimatePresence initial={false}>
          <motion.img
            key={active}
            src={current.bg}
            alt={current.title}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            className="w-full h-full object-cover object-center select-none pointer-events-none"
            style={{ 
              willChange: "transform",
              backfaceVisibility: "hidden"
            }}
          />
        </AnimatePresence>
        {/* Responsive overlay: Solid dark tint on mobile/tablet, side gradient on desktop */}
        <div className="absolute inset-0 bg-black/50 lg:bg-gradient-to-r lg:from-black/80 lg:via-black/50 lg:to-transparent z-10 pointer-events-none" />
      </div>

      {/* 2. Content Container: overlays the image, centered vertically */}
      <div className="absolute inset-0 z-20 px-6 sm:px-12 md:pl-20 lg:pl-32 xl:pl-56 flex flex-col justify-center">
        <div className="max-w-xl text-left">
          <AnimatePresence mode="wait" custom={direction}>
            <div key={active}>
              {/* 1. Eyebrow: Times New Roman eyebrow */}
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="text-sm sm:text-base md:text-lg font-extrabold uppercase text-primary tracking-[0.25em]"
                style={{ 
                  textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                  fontFamily: "'Times New Roman', Times, serif"
                }}
              >
                {current.eyebrow}
              </motion.p>

              {/* 2. Title: Times New Roman Font with elegant slide-up mask */}
              <div className="overflow-hidden py-1">
                <motion.h1
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: "-100%", opacity: 0 }}
                  transition={{ duration: 0.85, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                  className="mt-1.5 font-bold leading-[1.1] text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl tracking-wide uppercase"
                  style={{ 
                    textShadow: "0 4px 15px rgba(0,0,0,0.5)",
                    fontFamily: "'Times New Roman', Times, serif"
                  }}
                >
                  {renderTitle(current.title)}
                </motion.h1>
              </div>

              {/* Elegant decorative horizontal accent line (thick centered pill style) */}
              <motion.div
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                exit={{ scaleX: 0, opacity: 0 }}
                transition={{ duration: 0.65, delay: 0.3, ease: "easeOut" }}
                className="w-12 sm:w-16 h-[2px] bg-primary my-2.5 sm:my-3 origin-left"
              />

              {/* 3. Subtitle: Fade and slide up in Times New Roman */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.7, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-xl text-sm sm:text-base md:text-lg leading-relaxed text-stone-200 italic tracking-wide"
                style={{ 
                  textShadow: "0 2px 8px rgba(0,0,0,0.4)",
                  fontFamily: "'Times New Roman', Times, serif"
                }}
              >
                {current.subtitle}
              </motion.p>
            </div>
          </AnimatePresence>
        </div>
      </div>

      {/* Slide Navigation Arrows */}
      <button
        type="button"
        aria-label="Previous slide"
        onClick={() => go((active - 1 + heroSlides.length) % heroSlides.length)}
        className="absolute left-5 top-1/2 z-30 hidden -translate-y-1/2 grid-cols-1 place-items-center rounded-full bg-[#1C1917]/70 border border-stone-800 p-3.5 text-stone-300 shadow-sm transition hover:bg-primary hover:text-white sm:grid cursor-pointer"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        aria-label="Next slide"
        onClick={() => go((active + 1) % heroSlides.length)}
        className="absolute right-5 top-1/2 z-30 hidden -translate-y-1/2 grid-cols-1 place-items-center rounded-full bg-[#1C1917]/70 border border-stone-800 p-3.5 text-stone-300 shadow-sm transition hover:bg-primary hover:text-white sm:grid cursor-pointer"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </section>
  );
}
