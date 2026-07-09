import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { apiClient, API_BASE_URL } from "@/lib/api";
import { cn, getImageUrl } from "@/lib/utils";
import heroShoe from "@/assets/hero-shoe.png";

type Slide = {
  bg: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  cta: string;
  to: "/shop" | "/about" | "/contact";
  mobileFocus?: "center" | "left" | "right";
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
        const slidesArray = res && (Array.isArray(res) ? res : (res.value && Array.isArray(res.value) ? res.value : null));
        
        if (slidesArray && slidesArray.length > 0) {
          const mapped = slidesArray.map((slide: any) => ({
            eyebrow: slide.eyebrow || "",
            title: slide.title || "",
            subtitle: slide.subtitle || "",
            cta: slide.cta || "Shop Now",
            to: (slide.to || "/shop") as any,
            mobileFocus: slide.mobileFocus || "center",
            bg: getImageUrl(slide.bg) || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1920",
          }));
          setHeroSlides(mapped);
        } else {
          setHeroSlides(defaultSlides);
        }
      } catch (err) {
        console.warn("Failed to load dynamic hero slides, using fallback", err);
        setHeroSlides(defaultSlides);
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
    if (typeof title !== "string" || !title) return null;
    const lines = title.split("\n").map((line) => line.trim());
    return lines.map((line, index) => {
      const words = line.split(" ");
      if (words.length === 0 || !line) return null;
      const lastWord = words[words.length - 1];
      const rest = words.slice(0, words.length - 1).join(" ");
      return (
        <span key={index} className="block">
          {rest && <span className="block">{rest}</span>}
          <span className="block text-primary">{lastWord}</span>
        </span>
      );
    });
  };

  if (heroSlides.length === 0) {
    return (
      <section className="relative h-[50vh] min-h-[500px] w-full overflow-hidden bg-stone-950 text-white border-b border-stone-900 flex items-center justify-center">
        <div className="text-stone-500 text-sm font-medium animate-pulse uppercase tracking-widest">Loading...</div>
      </section>
    );
  }

  const current = heroSlides[active];

  return (
    <section className="relative h-[55vh] sm:h-[65vh] lg:h-[80vh] min-h-[400px] w-full overflow-hidden bg-stone-950 text-white border-b border-stone-900">
      
      {/* 1. Image Container: full absolute background, centered on footwear */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <AnimatePresence initial={false}>
          <motion.img
            key={active}
            src={current.bg}
            alt={current.title}
            initial={{ opacity: 0, scale: 1.15 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "absolute inset-0 w-full h-full object-cover select-none pointer-events-none",
              current.mobileFocus === "right"
                ? "object-right lg:object-center"
                : current.mobileFocus === "left"
                ? "object-left lg:object-center"
                : "object-center"
            )}
            style={{ 
              willChange: "transform",
              backfaceVisibility: "hidden"
            }}
          />
        </AnimatePresence>
        
        {/* Subtle dark shade overlay: bottom gradient on mobile, left gradient on desktop for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent lg:bg-gradient-to-r lg:from-black/45 lg:via-transparent lg:to-transparent z-10 pointer-events-none" />
      </div>

      {/* 2. Content Container: overlays the image on all screens, positioned downwards at bottom-left on mobile */}
      <div className="absolute inset-x-0 bottom-0 z-20 px-6 pb-6 pt-20 sm:px-12 md:pl-20 lg:inset-0 lg:pl-32 xl:pl-56 flex flex-col justify-end lg:justify-center lg:pb-0 bg-gradient-to-t from-black/40 via-transparent to-transparent lg:bg-transparent">
        <div className="max-w-xl text-left">
          <AnimatePresence mode="wait" custom={direction}>
            <div key={active}>
              {/* 1. Eyebrow */}
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="text-sm sm:text-base lg:text-3xl font-extrabold uppercase text-primary tracking-[0.25em]"
                style={{ 
                  fontFamily: "'Times New Roman', Times, serif",
                  textShadow: "0 1px 3px rgba(0, 0, 0, 0.45)"
                }}
              >
                {current.eyebrow}
              </motion.p>

              {/* 2. Title */}
              <div className="overflow-hidden py-0.5">
                <motion.h1
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: "-100%", opacity: 0 }}
                  transition={{ duration: 0.85, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                  className="mt-0.5 font-black leading-[1.1] text-white text-2xl sm:text-3xl lg:text-6xl tracking-wide uppercase"
                  style={{ 
                    fontFamily: "'Times New Roman', Times, serif",
                    textShadow: "0 2px 5px rgba(0, 0, 0, 0.55)"
                  }}
                >
                  {renderTitle(current.title)}
                </motion.h1>
              </div>

              {/* Accent Line */}
              <motion.div
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                exit={{ scaleX: 0, opacity: 0 }}
                transition={{ duration: 0.65, delay: 0.3, ease: "easeOut" }}
                className="w-8 sm:w-16 h-[2px] bg-primary my-1.5 sm:my-3 origin-left"
              />

              {/* 3. Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.7, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="hidden sm:block max-w-xl text-xs sm:text-sm lg:text-base leading-relaxed text-stone-200 italic tracking-wide"
                style={{ 
                  fontFamily: "'Times New Roman', Times, serif",
                  textShadow: "0 1px 3px rgba(0, 0, 0, 0.45)"
                }}
              >
                {current.subtitle}
              </motion.p>

              {/* 4. CTA Button */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.7, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="pt-2 sm:pt-4"
              >
                <Link
                  to={current.to as any}
                  className="group inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 sm:px-7 sm:py-3 text-[10px] sm:text-xs font-bold uppercase tracking-wide text-white transition-all hover:brightness-110 shadow-md"
                >
                  {current.cta || "Shop Now"} <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </motion.div>
            </div>
          </AnimatePresence>
        </div>
      </div>

      {/* Slide Navigation Arrows */}
      <button
        type="button"
        aria-label="Previous slide"
        onClick={() => go((active - 1 + heroSlides.length) % heroSlides.length)}
        className="absolute left-4 top-1/2 z-30 -translate-y-1/2 grid grid-cols-1 place-items-center rounded-full bg-[#1C1917]/60 border border-stone-800 p-2 sm:p-3.5 text-stone-300 shadow-sm transition hover:bg-primary hover:text-white cursor-pointer"
      >
        <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
      </button>
      <button
        type="button"
        aria-label="Next slide"
        onClick={() => go((active + 1) % heroSlides.length)}
        className="absolute right-4 top-1/2 z-30 -translate-y-1/2 grid grid-cols-1 place-items-center rounded-full bg-[#1C1917]/60 border border-stone-800 p-2 sm:p-3.5 text-stone-300 shadow-sm transition hover:bg-primary hover:text-white cursor-pointer"
      >
        <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
      </button>
    </section>
  );
}
