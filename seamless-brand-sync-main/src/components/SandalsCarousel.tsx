import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { ProductCard } from "@/components/ProductCard";

interface SandalsCarouselProps {
  products: any[];
}

export function SandalsCarousel({ products }: SandalsCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: false,
    containScroll: "trimSnaps",
  });

  const scrollPrev = () => emblaApi && emblaApi.scrollPrev();
  const scrollNext = () => emblaApi && emblaApi.scrollNext();

  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true);

  const onSelect = () => {
    if (!emblaApi) return;
    setPrevBtnDisabled(!emblaApi.canScrollPrev());
    setNextBtnDisabled(!emblaApi.canScrollNext());
  };

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, products]);

  if (products.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="relative">
        {/* Circular float controls visible dynamically on both sides of the cards */}
        <button
          type="button"
          disabled={prevBtnDisabled}
          onClick={scrollPrev}
          aria-label="Previous products"
          className="absolute left-1 xl:-left-5 top-1/2 -translate-y-1/2 z-20 hidden lg:flex h-11 w-11 items-center justify-center rounded-full border border-border/80 bg-background/95 hover:bg-background text-foreground hover:border-primary hover:text-primary transition-all duration-300 shadow-card cursor-pointer shrink-0 hover:scale-105 disabled:opacity-0 disabled:pointer-events-none"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          disabled={nextBtnDisabled}
          onClick={scrollNext}
          aria-label="Next products"
          className="absolute right-1 xl:-right-5 top-1/2 -translate-y-1/2 z-20 hidden lg:flex h-11 w-11 items-center justify-center rounded-full border border-border/80 bg-background/95 hover:bg-background text-foreground hover:border-primary hover:text-primary transition-all duration-300 shadow-card cursor-pointer shrink-0 hover:scale-105 disabled:opacity-0 disabled:pointer-events-none"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        <div className="overflow-hidden cursor-grab active:cursor-grabbing px-2 py-4" ref={emblaRef}>
          <div className="flex gap-6">
            {products.map((p, i) => (
              <div key={p.id} className="min-w-0 flex-[0_0_46%] sm:flex-[0_0_46%] lg:flex-[0_0_23.5%]">
                <ProductCard product={p} index={i} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
