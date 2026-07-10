import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { Reveal } from "@/components/Reveal";

interface NewArrivalsProps {
  products: any[];
}

export function NewArrivals({ products }: NewArrivalsProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: false,
    containScroll: "trimSnaps",
    dragFree: true,
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
    <section className="mx-auto max-w-7xl px-4 pt-4 pb-12 sm:px-6 lg:px-8">
      <Reveal className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-[#ef4444] via-[#f97316] to-[#fdba74] p-6 sm:p-8 lg:p-10 flex flex-col md:flex-row items-center justify-start gap-4 md:gap-5 lg:gap-6 shadow-xl">
        {/* Left Column: Heading */}
        <div className="relative z-10 text-center md:text-left max-w-sm shrink-0 space-y-4">
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-5xl font-black text-white tracking-wide uppercase leading-none drop-shadow-sm">
            New <br className="hidden sm:inline" /> Arrivals
          </h2>
          <p className="text-xs uppercase tracking-widest text-white/80 font-semibold font-sans">
            Designed for your journey
          </p>
        </div>

        {/* Right Column: Sliding Cards Container */}
        <div className="relative z-10 flex-1 w-full py-4">
          {/* Navigation Controls */}
          {products.length > 1 && (
            <>
              <button
                type="button"
                disabled={prevBtnDisabled}
                onClick={scrollPrev}
                aria-label="Previous arrivals"
                className="absolute -left-3 top-1/2 -translate-y-1/2 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/40 hover:bg-black/60 text-white transition-all duration-300 shadow-md cursor-pointer shrink-0 disabled:opacity-0 disabled:pointer-events-none hover:scale-105"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                disabled={nextBtnDisabled}
                onClick={scrollNext}
                aria-label="Next arrivals"
                className="absolute -right-3 top-1/2 -translate-y-1/2 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/40 hover:bg-black/60 text-white transition-all duration-300 shadow-md cursor-pointer shrink-0 disabled:opacity-0 disabled:pointer-events-none hover:scale-105"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}

          {/* Slider Viewport using Embla */}
          <div className="overflow-hidden w-full px-1 cursor-grab active:cursor-grabbing" ref={emblaRef}>
            {/* Slider Wrapper */}
            <div className="flex gap-6">
              {products.map((product) => (
                <Link
                  key={product.id}
                  to="/product/$id"
                  params={{ id: product.id }}
                  className="shrink-0 flex flex-col justify-between hover:scale-[1.03] transition-all duration-300 relative group h-[250px] sm:h-[290px] lg:h-[290px] snap-center min-w-0 flex-[0_0_46%] sm:flex-[0_0_28%] lg:flex-[0_0_23.5%]"
                >
                  {/* Shoe Image Card (Yellow Box) */}
                  <div className="h-[180px] sm:h-[220px] lg:h-[220px] w-full overflow-hidden rounded-2xl bg-white p-3 relative z-10 flex items-center justify-center shadow-sm transition-all duration-300">
                    <img
                      src={product.image}
                      alt={product.name}
                      loading="lazy"
                      className="w-full h-full object-contain scale-[1.3] transition-transform duration-500 ease-out group-hover:scale-[1.38]"
                    />
                  </div>

                  {/* Product Name and Price Details (Green Box) */}
                  <div className="text-center z-10 w-full mt-2.5">
                    <h4 className="font-sans text-[11px] sm:text-xs font-bold text-white truncate px-1">
                      {product.name}
                    </h4>
                    <div className="mt-1">
                      <span className="text-[10px] sm:text-xs font-black text-white/95 bg-black/35 px-3 py-0.5 rounded-full inline-block">
                        ₹{product.price}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
