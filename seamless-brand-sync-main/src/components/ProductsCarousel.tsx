import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { ProductCard } from "@/components/ProductCard";
import { Reveal } from "@/components/Reveal";

interface ProductsCarouselProps {
  products: any[];
}

export function ProductsCarousel({ products }: ProductsCarouselProps) {
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
    <section className="mx-auto max-w-7xl px-4 pb-2 sm:px-6 lg:px-8">
      <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-4 text-left">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            Trending now
          </p>
          <h2 className="mt-2 font-display text-4xl font-extrabold sm:text-5xl">
            Our <span className="bg-gradient-to-r from-stone-950 to-primary bg-clip-text text-transparent">Products</span>
          </h2>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            to="/shop"
            className="group inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-foreground hover:bg-primary hover:text-white transition-all shadow-sm shrink-0"
          >
            Shop all products
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </Reveal>

      <div className="relative">
        {/* Circular float controls visible dynamically on both sides of the cards */}
        <button
          type="button"
          disabled={prevBtnDisabled}
          onClick={scrollPrev}
          aria-label="Previous products"
          className="absolute -left-6 top-1/2 -translate-y-1/2 z-20 hidden lg:flex h-11 w-11 items-center justify-center rounded-full border border-border/80 bg-background/95 hover:bg-background text-foreground hover:border-primary hover:text-primary transition-all duration-300 shadow-card cursor-pointer shrink-0 hover:scale-105 disabled:opacity-0 disabled:pointer-events-none"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          disabled={nextBtnDisabled}
          onClick={scrollNext}
          aria-label="Next products"
          className="absolute -right-6 top-1/2 -translate-y-1/2 z-20 hidden lg:flex h-11 w-11 items-center justify-center rounded-full border border-border/80 bg-background/95 hover:bg-background text-foreground hover:border-primary hover:text-primary transition-all duration-300 shadow-card cursor-pointer shrink-0 hover:scale-105 disabled:opacity-0 disabled:pointer-events-none"
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
