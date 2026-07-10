import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { motion } from "motion/react";
import { Reveal } from "@/components/Reveal";

interface Review {
  name: string;
  text: string;
  rating: number;
}

interface ReviewsMarqueeProps {
  reviews: Review[];
}

export function ReviewsMarquee({ reviews }: ReviewsMarqueeProps) {
  const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1024);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobileMarquee = windowWidth < 768;
  const marqueeX = isMobileMarquee ? -1096 : -1376;
  const marqueeDuration = isMobileMarquee ? 12 : 25;

  if (reviews.length === 0) return null;

  return (
    <section className="mx-auto py-12 sm:py-16 overflow-hidden w-full text-left bg-background">
      <Reveal className="mb-10 text-center px-4">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">Reviews</p>
        <h2 className="mt-2 font-display text-4xl font-extrabold sm:text-5xl">
          Loved by our <span className="bg-gradient-to-r from-stone-950 to-primary bg-clip-text text-transparent">customers</span>
        </h2>
      </Reveal>
      <div className="relative flex w-full overflow-x-hidden py-4">
        <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background via-background/60 to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background via-background/60 to-transparent z-10 pointer-events-none" />

        <motion.div
          animate={{ x: [0, marqueeX] }}
          transition={{
            repeat: Infinity,
            ease: "linear",
            duration: marqueeDuration,
          }}
          className="flex gap-6 whitespace-nowrap flex-nowrap"
        >
          {[...reviews, ...reviews, ...reviews].map((r, i) => (
            <div
              key={i}
              className="inline-block min-w-[250px] max-w-[250px] sm:min-w-[280px] sm:max-w-[280px] lg:min-w-[320px] lg:max-w-[320px] whitespace-normal rounded-2xl lg:rounded-3xl border border-border bg-card p-4 lg:p-6 shadow-soft transition hover:border-primary/20"
            >
              <div className="flex gap-0.5">
                {Array.from({ length: r.rating }).map((_, idx) => (
                  <Star key={idx} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">"{r.text}"</p>
              <div className="mt-5 flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 font-display text-sm font-bold text-primary">
                  {r.name.charAt(0)}
                </span>
                <div>
                  <p className="text-sm font-semibold">{r.name}</p>
                  <p className="text-xs text-success font-semibold">Verified purchase</p>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
