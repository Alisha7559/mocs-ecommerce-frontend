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
    <section className="relative h-[65vh] sm:h-[70vh] lg:h-[80vh] min-h-[450px] w-full overflow-hidden bg-stone-950 text-white border-b border-stone-900">
      
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent lg:bg-gradient-to-r lg:from-black/70 lg:via-black/20 lg:to-transparent z-10 pointer-events-none" />
      </div>

      {/* 2. Content Container: overlays the image on all screens, positioned downwards on mobile */}
      <div className="absolute inset-0 z-20 px-6 sm:px-12 md:pl-20 lg:pl-32 xl:pl-56 flex flex-col justify-end pb-12 sm:pb-16 lg:justify-center lg:pb-0 bg-transparent drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]">
        <div className="max-w-xl text-left">
          <AnimatePresence mode="wait" custom={direction}>
            <div key={active}>
              {/* 1. Eyebrow: Times New Roman eyebrow */}
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
  className="text-2xl sm:text-2xl md:text-2xl lg:text-3xl font-extrabold uppercase text-primary tracking-[0.25em]"
                style={{ 
                  fontFamily: "'Times New Roman', Times, serif",
                  textShadow: "0 2px 4px rgba(218, 27, 27, 0.5)"
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
className="mt-1.5 font-black leading-[1.1] text-white text-4xl sm:text-5xl md:text-5xl lg:text-6xl xl:text-6xl tracking-wide uppercase"                  style={{ 
                    fontFamily: "'Times New Roman', Times, serif",
                    textShadow: "0 2px 8px rgba(0,0,0,0.6)"
                  }}
                >
                  {renderTitle(current.title)}
                </motion.h1>
              </div>

              {/* Elegant decorative horizontal accent line */}
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
                className="hidden lg:block max-w-xl text-sm sm:text-base md:text-lg leading-relaxed text-stone-200 italic tracking-wide"
                style={{ 
                  fontFamily: "'Times New Roman', Times, serif",
                  textShadow: "0 2px 6px rgba(192, 147, 147, 0.5)"
                }}
              >
                {current.subtitle}
              </motion.p>

              {/* 4. CTA Button (Desktop only) */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.7, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="hidden lg:block pt-3"
              >
                <Link
                  to={current.to as any}
                  className="group inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-xs font-bold uppercase tracking-wide text-white transition-all hover:-translate-y-0.5 hover:brightness-110 shadow-md hover:shadow-orange-500/20"
                >
                  {current.cta || "Shop Now"} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
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
        className="absolute left-5 top-1/2 z-30 -translate-y-1/2 grid grid-cols-1 place-items-center rounded-full bg-[#1C1917]/70 border border-stone-800 p-3.5 text-stone-300 shadow-sm transition hover:bg-primary hover:text-white cursor-pointer animate-fade-in"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        aria-label="Next slide"
        onClick={() => go((active + 1) % heroSlides.length)}
        className="absolute right-5 top-1/2 z-30 -translate-y-1/2 grid grid-cols-1 place-items-center rounded-full bg-[#1C1917]/70 border border-stone-800 p-3.5 text-stone-300 shadow-sm transition hover:bg-primary hover:text-white cursor-pointer animate-fade-in"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </section>
  );
}
