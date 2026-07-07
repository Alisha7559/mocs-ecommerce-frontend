import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState, useMemo } from "react";
import { ArrowRight, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { Reveal, Stagger } from "@/components/Reveal";
import { apiClient, API_BASE_URL } from "@/lib/api";
import useEmblaCarousel from "embla-carousel-react";
import { cn, getImageUrl } from "@/lib/utils";
// Extracted Components
import { Hero } from "@/components/Hero";
import { QualityPromise } from "@/components/QualityPromise";

export const Route = createFileRoute("/")({
  loader: async () => {
    try {
      const res = await apiClient.products.list("limit=100");
      if (res && res.items) {
        const apiProducts = res.items.map((p: any) => ({
          id: p._id,
          artNumber: p.artNumber || "",
          name: p.name,
          category: (p.category?.name || p.category || "Men") as any,
          collection: (p.collection || "Casual") as any,
          type: "Running",
          price: p.price,
          oldPrice: p.oldPrice,
          rating: p.rating || 5,
          reviews: p.reviewCount || 0,
          stock: p.stock || 0,
          image: getImageUrl(p.coverImage),
          colors: p.colors && p.colors.length > 0
            ? p.colors.map((c: any) => ({ name: c.name, hex: c.hex }))
            : [{ name: "Default", hex: "#000000" }],
          sizes: p.sizes || [7, 8, 9, 10, 11, 12],
          description: p.description,
          isNew: p.isNew,
          isTrending: p.isTrending,
          views: p.additionalImages && p.additionalImages.length > 0
            ? [
              { label: "Front", src: getImageUrl(p.coverImage) },
              ...p.additionalImages.map((img: any) => ({
                label: img.label || "Side",
                src: getImageUrl(img.url)
              }))
            ]
            : [{ label: "Front", src: getImageUrl(p.coverImage) }]
        }));
        return { products: apiProducts };
      }
    } catch (err) {
      console.warn("Failed to load products for homepage", err);
    }
    return { products: [] };
  },
  shouldReload: true,
  head: () => ({
    meta: [
      { title: "MOCS — Premium Footwear" },
      {
        name: "description",
        content:
          "MOCS — premium footwear for Men, Women and Kids. Engineered for performance, crafted for everyday style.",
      },
      { property: "og:title", content: "MOCS — Premium Footwear" },
      {
        property: "og:description",
        content: "Premium footwear engineered for performance.",
      },
    ],
  }),
  component: Home,
});

const reviews = [
  {
    name: "Gokul Nair",
    text: "Best footwear our boutique has stocked. Customers love them, returns are negligible.",
    rating: 5,
  },
  {
    name: "Anjali Kurup",
    text: "MOCS handled a custom run for our brand and delivered on time, on spec, on budget.",
    rating: 5,
  },
  {
    name: "Mathew Joseph",
    text: "Comfortable from the first wear. Build quality you don't expect at this price.",
    rating: 5,
  },
  {
    name: "Hiba",
    text: "Good and comfortable to wear.",
    rating: 5,
  },
];

function TrendingProducts({ products }: { products: any[] }) {
  if (products.length === 0) return null;

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: false,
    containScroll: "trimSnaps",
  });

  const scrollPrev = () => emblaApi && emblaApi.scrollPrev();
  const scrollNext = () => emblaApi && emblaApi.scrollNext();

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Reveal className="mb-10 text-left">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h2 className="mt-2 font-display text-4xl font-extrabold sm:text-5xl">
              Trending <span className="bg-gradient-to-r from-stone-950 to-primary bg-clip-text text-transparent">Products</span>
            </h2>
            <p className="text-muted-foreground text-sm mt-1.5 font-medium">
              Our absolute best sellers of this season, selected for you.
            </p>
          </div>

          {products.length > 4 && (
            <div className="hidden lg:flex gap-2 shrink-0">
              <button
                type="button"
                onClick={scrollPrev}
                aria-label="Previous trending products"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-border/80 bg-background/95 hover:bg-background text-foreground hover:border-primary hover:text-primary transition shadow-card cursor-pointer hover:scale-105"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={scrollNext}
                aria-label="Next trending products"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-border/80 bg-background/95 hover:bg-background text-foreground hover:border-primary hover:text-primary transition shadow-card cursor-pointer hover:scale-105"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </Reveal>

      <div className="relative">
        <div className="overflow-hidden cursor-grab active:cursor-grabbing px-2 py-4" ref={emblaRef}>
          <div className="flex gap-6">
            {products.map((product, i) => (
              <div key={product.id} className="min-w-0 flex-[0_0_80%] sm:flex-[0_0_46%] lg:flex-[0_0_23.5%]">
                <ProductCard product={product} index={i} variant="simple" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

interface CategoryCardProps {
  name: string;
  defaultImg: string;
  products: any[];
  linkSearch: any;
}

function CategoryCard({ name, defaultImg, products, linkSearch }: CategoryCardProps) {
  const [imgIndex, setImgIndex] = useState(0);

  const images = useMemo(() => {
    const latest = products.slice(0, 3);
    if (latest.length === 0) return [defaultImg];
    return latest.map((p) => p.image);
  }, [products, defaultImg]);

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setImgIndex((prev) => (prev + 1) % images.length);
    }, 7000 + Math.random() * 3000);
    return () => clearInterval(interval);
  }, [images]);

  return (
    <Link
      to="/shop"
      search={linkSearch}
      className="group relative block h-72 overflow-hidden rounded-3xl bg-muted shadow-soft transition-all duration-500 hover:-translate-y-1.5 hover:shadow-lift"
    >
      <div className="absolute inset-0 h-full w-full">
        <AnimatePresence mode="wait">
          <motion.img
            key={images[imgIndex]}
            src={images[imgIndex]}
            alt={name}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 1.6 }}
            loading="lazy"
            className={cn(
              "h-full w-full object-cover",
              name === "Kids" ? "scale-110 object-center" : ""
            )}
          />
        </AnimatePresence>
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-secondary/85 via-secondary/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-5 text-secondary-foreground text-left">
        <p className="text-xs font-medium uppercase tracking-wide text-secondary-foreground/80">
          {products.length} {products.length === 1 ? "style" : "styles"}
        </p>
        <h3 className="font-display text-2xl font-extrabold">{name}</h3>
        <span className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
          Shop now <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

function ScrollBrandReveal({ collections }: { collections: any[] }) {
  const [showAll, setShowAll] = useState(false);
  const visibleCollections = showAll ? collections : collections.slice(0, 5);

  const renderCard = (item: any, idx: number, isFlex: boolean) => {
    const targetTo = item.to || "/shop";
    const itemTitle = item.title || "";
    const searchVal = item.search && (item.search.collection || item.search.category)
      ? item.search
      : { collection: itemTitle ? (itemTitle.charAt(0).toUpperCase() + itemTitle.slice(1).toLowerCase()) : "Sports" };

    const bgImg = item.bg || "";
    const getOptimizedUrl = (url: string) => {
      if (!url) return "";
      let finalUrl = getImageUrl(url);
      if (finalUrl.includes("unsplash.com")) {
        if (finalUrl.includes("w=")) {
          finalUrl = finalUrl.replace(/w=\d+/, "w=400").replace(/q=\d+/, "q=70");
        } else {
          finalUrl = `${finalUrl}${finalUrl.includes("?") ? "&" : "?"}w=400&q=70`;
        }
      }
      return finalUrl;
    };
    const bgUrl = getOptimizedUrl(bgImg);

    return (
      <Reveal
        key={item.key || item.title}
        delay={0.05 * (idx + 1)}
        className={isFlex ? "w-full sm:w-[calc(20%-19.2px)] min-w-[200px]" : undefined}
      >
        <Link
          to={targetTo}
          search={searchVal as any}
          className="group block relative h-40 w-full rounded-3xl overflow-hidden shadow-soft transition-all duration-500 hover:scale-105 hover:-translate-y-2 hover:shadow-xl border border-black/5 bg-stone-900"
        >
          {/* Background Image */}
          {bgUrl ? (
            <img
              src={bgUrl}
              alt={item.title}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          ) : null}
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/45 transition-colors duration-500 group-hover:bg-black/55" />

          {/* Centered Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 z-10">
            <h3 className="font-display text-xs sm:text-sm font-black text-white tracking-widest uppercase drop-shadow-md text-center px-1 leading-snug">
              {item.title}
            </h3>
          </div>
        </Link>
      </Reveal>
    );
  };

  // Helper to render a row of cards
  const renderRow = (rowItems: any[], startIdx: number) => {
    const isFullRow = rowItems.length === 5;

    if (isFullRow) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {rowItems.map((item, index) => renderCard(item, startIdx + index, false))}
        </div>
      );
    } else {
      return (
        <div className="flex flex-wrap justify-center gap-6">
          {rowItems.map((item, index) => renderCard(item, startIdx + index, true))}
        </div>
      );
    }
  };

  // Split visible collections into rows of up to 5 items
  const rows: any[][] = [];
  for (let i = 0; i < visibleCollections.length; i += 5) {
    rows.push(visibleCollections.slice(i, i + 5));
  }

  return (
    <section className="mx-auto max-w-7xl px-4 pt-16 pb-4 sm:px-6 lg:px-8 overflow-hidden font-sans">
      <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
        <Reveal>
          <span className="rounded-full bg-primary/10 px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-primary">
            MOCS Collections
          </span>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="font-display text-4xl sm:text-5xl font-black uppercase tracking-tight text-stone-900">
            Shop by <span className="bg-gradient-to-r from-stone-950 to-primary bg-clip-text text-transparent">Collection</span>
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed font-medium">
            Find your perfect pair from our diverse style collections. Whether you're looking for active sports, everyday casuals, or elegant formals, we have you covered.
          </p>
        </Reveal>
      </div>

      {/* Grid / Centered rows of collections */}
      <div className="space-y-6">
        {rows.map((rowItems, idx) => (
          <div key={idx}>
            {renderRow(rowItems, idx * 5)}
          </div>
        ))}
      </div>

      {collections.length > 5 && (
        <Reveal delay={0.1} className="mt-12 flex justify-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="group inline-flex items-center gap-2 rounded-full border border-border bg-card px-8 py-3.5 text-xs font-bold uppercase tracking-widest transition-all shadow-sm cursor-pointer hover:scale-105"
          >
            <span className="bg-gradient-to-r from-stone-950 to-primary bg-clip-text text-transparent">
              {showAll ? "View Less" : "View More"}
            </span>
          </button>
        </Reveal>
      )}
    </section>
  );
}

function Home() {
  const { products } = Route.useLoaderData();
  const [allProducts, setAllProducts] = useState<any[]>(products);
  const [categoriesBanners, setCategoriesBanners] = useState<any[]>([
    {
      key: "main",
      title: "We Are MOCS",
      desc: "Awesome, clean & creative footwear collections engineered for everyday agility, comfort, and style.",
      cta: "Purchase Now!",
      to: "/shop",
      bg: ""
    },
    {
      key: "women",
      title: "Women",
      desc: "Best Footwear For Women",
      cta: "Discover More",
      to: "/shop",
      search: { category: "Women" },
      bg: ""
    },
    {
      key: "men",
      title: "Men",
      desc: "Best Collections For Men",
      cta: "Discover More",
      to: "/shop",
      search: { category: "Men" },
      bg: ""
    },
    {
      key: "kids",
      title: "Kids",
      desc: "Best Shoes For Kids",
      cta: "Discover More",
      to: "/shop",
      search: { category: "Kids" },
      bg: ""
    },
    {
      key: "trending",
      title: "Trending",
      desc: "Best Trend Collections",
      cta: "Discover More",
      to: "/shop",
      search: { collection: "Trending" },
      bg: ""
    }
  ]);

  const [collectionsBanners, setCollectionsBanners] = useState<any[]>([
    { key: "sports", title: "SPORTS", bg: "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=70&auto=format&fit=crop&w=400", to: "/shop", search: { collection: "Sports" } },
    { key: "casual", title: "CASUAL", bg: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=70&auto=format&fit=crop&w=400", to: "/shop", search: { collection: "Casual" } },
    { key: "formal", title: "FORMAL", bg: "https://images.unsplash.com/photo-1486308512493-ae6a625e368a?q=70&auto=format&fit=crop&w=400", to: "/shop", search: { collection: "Formal" } }
  ]);

  const [promiseCollage, setPromiseCollage] = useState<any[]>([]);

  useEffect(() => {
    const fetchBannersSettings = async () => {
      try {
        const res = await apiClient.settings.get("categories_banners");
        if (res && res.value && Array.isArray(res.value) && res.value.length === 5) {
          setCategoriesBanners(res.value);
        }
      } catch (err) {
        console.warn("Failed to load categories banners settings", err);
      }
    };
    const fetchCollectionsSettings = async () => {
      try {
        const res = await apiClient.settings.get("collections_banners");
        if (res && res.value && Array.isArray(res.value) && res.value.length > 0) {
          setCollectionsBanners(res.value);
        }
      } catch (err) {
        console.warn("Failed to load collections banners settings", err);
      }
    };
    const fetchPromiseSettings = async () => {
      try {
        const res = await apiClient.settings.get("promise_collage");
        if (res && res.value && Array.isArray(res.value) && res.value.length > 0) {
          setPromiseCollage(res.value);
        }
      } catch (err) {
        console.warn("Failed to load  collage settings", err);
      }
    };
    fetchBannersSettings();
    fetchCollectionsSettings();
    fetchPromiseSettings();
  }, []);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: false,
    containScroll: "trimSnaps",
  });

  const scrollPrev = () => emblaApi && emblaApi.scrollPrev();
  const scrollNext = () => emblaApi && emblaApi.scrollNext();

  useEffect(() => {
    setAllProducts(products);
  }, [products]);

  const trendingProducts = useMemo(() => {
    const list = allProducts.filter((p: any) => p.isTrending);
    const seen = new Set();
    return list.filter((p: any) => {
      const key = p.artNumber || p.name;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [allProducts]);

  const processedProducts = useMemo(() => {
    const newProducts = allProducts.filter((p: any) => p.isNew);
    const regularProducts = allProducts.filter((p: any) => !p.isNew);
    const shuffled = [...regularProducts].sort(() => Math.random() - 0.5);
    const combined = [...newProducts, ...shuffled];
    const seen = new Set();
    return combined.filter((p: any) => {
      const key = p.artNumber || p.name;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [allProducts]);

  const newArrivals = useMemo(() => {
    const list = allProducts.filter((p: any) => p.isNew);
    const seen = new Set();
    return list.filter((p: any) => {
      const key = p.artNumber || p.name;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [allProducts]);

  const [newArrivalIdx, setNewArrivalIdx] = useState(0);
  const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1024);
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const cardsPerViewBanner = windowWidth >= 1024 ? 3 : windowWidth >= 768 ? 2 : 1;
  const isMobileMarquee = windowWidth < 768;
  const marqueeX = isMobileMarquee ? -1096 : -1376;
  const marqueeDuration = isMobileMarquee ? 12 : 25;

  return (
    <>
      <Hero />

      <TrendingProducts products={trendingProducts} />

      {/* Dynamic New Arrivals Ad Banner Section */}
      {newArrivals.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pt-4 pb-12 sm:px-6 lg:px-8">
          <Reveal className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-[#ef4444] via-[#f97316] to-[#fdba74] p-6 sm:p-8 lg:p-10 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">


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
              {/* Conditional Navigation Controls (Only shown if more products are there) */}
              {newArrivals.length > cardsPerViewBanner && (
                <>
                  <button
                    type="button"
                    onClick={() => setNewArrivalIdx((prev) => Math.max(0, prev - 1))}
                    disabled={newArrivalIdx === 0}
                    className="absolute -left-5 top-1/2 -translate-y-1/2 z-30 hidden lg:flex h-11 w-11 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-850 hover:bg-stone-50 transition shadow-md disabled:opacity-30 disabled:pointer-events-none cursor-pointer hover:scale-105"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewArrivalIdx((prev) => Math.min(newArrivals.length - cardsPerViewBanner, prev + 1))}
                    disabled={newArrivalIdx >= newArrivals.length - cardsPerViewBanner}
                    className="absolute -right-5 top-1/2 -translate-y-1/2 z-30 hidden lg:flex h-11 w-11 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-850 hover:bg-stone-50 transition shadow-md disabled:opacity-30 disabled:pointer-events-none cursor-pointer hover:scale-105"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}

              {/* Slider Viewport (prevents clipping the navigation arrows) */}
              <div className="overflow-x-auto lg:overflow-hidden w-full px-1 no-scrollbar scroll-smooth snap-x snap-mandatory">
                {/* Slider Wrapper */}
                <div 
                  className="flex gap-6 transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]"
                  style={windowWidth >= 1024 ? {
                    transform: `translateX(calc(-${newArrivalIdx} * (100% / ${cardsPerViewBanner}) - ${newArrivalIdx * 24 / cardsPerViewBanner}px))`
                  } : undefined}
                >
                  {newArrivals.map((product) => (
                    <Link
                      key={product.id}
                      to="/product/$id"
                      params={{ id: product.id }}
                      className={cn(
                        "shrink-0 bg-black/10 hover:bg-black/20 rounded-3xl p-4 flex flex-col justify-between hover:scale-[1.03] transition-all duration-300 relative group h-[320px] sm:h-[350px] lg:h-[280px] snap-center",
                        cardsPerViewBanner === 3
                          ? "w-[calc(33.33%-16px)]"
                          : cardsPerViewBanner === 2
                            ? "w-[calc(70%-12px)] sm:w-[calc(50%-12px)]"
                            : "w-[85%] sm:w-[calc(50%-12px)]"
                      )}
                    >
                      {/* Shoe Image */}
                      <div className="h-52 sm:h-60 lg:h-44 w-full overflow-hidden rounded-2xl relative z-10 bg-transparent flex items-center justify-center">
                        <img
                          src={product.image}
                          alt={product.name}
                          loading="lazy"
                          className="w-full h-full object-contain scale-[1.25] mix-blend-multiply transition-transform duration-500 ease-out group-hover:scale-[1.32]"
                        />
                      </div>

                      {/* Product Name and Price Details */}
                      <div className="text-center z-10 w-full mt-2">
                        <h4 className="font-sans text-sm sm:text-base font-bold text-white truncate px-1">
                          {product.name}
                        </h4>
                        <div className="mt-1">
                          <span className="text-xs sm:text-sm font-black text-white/95 bg-black/35 px-3.5 py-1 rounded-full inline-block">
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
      )}
      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-4 text-left">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">
              Shop by category
            </p>
            <h2 className="mt-2 font-display text-4xl font-extrabold sm:text-5xl">
              Built for <span className="bg-gradient-to-r from-stone-950 to-primary bg-clip-text text-transparent">everyone</span>
            </h2>
          </div>
        </Reveal>
        <Stagger className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

          {/* Left Large Column (Hexashop style banner) */}
          <motion.div
            variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } }}
            className="lg:col-span-6 relative group overflow-hidden rounded-none bg-stone-900 shadow-soft min-h-[420px] lg:min-h-full h-full flex flex-col justify-end text-left border border-border/10"
          >
            <div className="absolute inset-0 h-full w-full">
              {categoriesBanners[0]?.bg ? (
                <img
                  src={getImageUrl(categoriesBanners[0].bg)}
                  alt={categoriesBanners[0].title}
                  className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center text-zinc-500 text-xs font-mono uppercase tracking-widest">
                  No Image Configured
                </div>
              )}
              <div className="absolute inset-0 bg-black/60 transition-colors duration-500 group-hover:bg-black/65" />
            </div>

            <div className="relative z-10 p-8 md:p-12 text-white space-y-4">
              <h3 className="font-display text-4xl sm:text-5xl font-extrabold leading-[1.1]">
                {categoriesBanners[0]?.title}
              </h3>
              <p className="text-sm text-stone-300 leading-relaxed max-w-sm font-medium font-sans">
                {categoriesBanners[0]?.desc}
              </p>
              <div className="pt-2">
                <Link
                  to={categoriesBanners[0]?.to || "/shop"}
                  className="inline-block rounded-none border-2 border-white px-8 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-white hover:text-stone-900 transition-colors"
                >
                  {categoriesBanners[0]?.cta || "Purchase Now!"}
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Right Column: 2x2 Grid of categories */}
          <motion.div
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.1 } }
            }}
            className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-6"
          >
            {categoriesBanners.slice(1).map((cat) => {
              return (
                <motion.div
                  key={cat.title}
                  variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="relative group aspect-square overflow-hidden rounded-none bg-muted shadow-soft flex items-center justify-center border border-border/10"
                >
                  {cat.bg ? (
                    <img
                      src={getImageUrl(cat.bg)}
                      alt={cat.title}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center text-zinc-500 text-xs font-mono uppercase tracking-widest">
                      No Image Configured
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 transition-colors duration-500 group-hover:bg-black/55" />

                  {/* Default Header Text Overlay (shown when NOT hovered) */}
                  <div className="absolute inset-x-0 bottom-6 text-center text-white transition-all duration-300 group-hover:opacity-0 group-hover:translate-y-4 z-10 px-4">
                    <h3 className="font-display text-2xl font-extrabold">{cat.title}</h3>
                    <p className="text-xs text-stone-300 mt-1 font-medium font-sans">{cat.desc}</p>
                  </div>

                  {/* Hover details (fades in as a clean dark square overlay in the center) */}
                  <div className="absolute inset-0 flex items-center justify-center p-5 z-20">
                    <div className="w-full h-full border border-white/10 bg-stone-950/90 backdrop-blur-xs p-6 flex flex-col items-center justify-center text-center rounded-none opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-350 select-none">
                      <h4 className="font-display text-2xl font-extrabold text-white">{cat.title}</h4>
                      <p className="text-[11px] text-stone-400 mt-2 max-w-[150px] leading-relaxed font-medium font-sans">
                        Discover premium comfort and style details with {cat.title} collection.
                      </p>
                      <Link
                        to={cat.to || "/shop"}
                        search={cat.search as any}
                        className="mt-5 bg-white text-stone-900 text-[10px] font-black uppercase tracking-wider py-2.5 px-6 hover:bg-primary hover:text-white transition-all shadow-md"
                      >
                        {cat.cta || "Discover More"}
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

        </Stagger>
      </section>



      {/* Products list */}
      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
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
          {/* Circular float controls always visible on both sides of the cards */}
          <button
            type="button"
            onClick={scrollPrev}
            aria-label="Previous products"
            className="absolute -left-6 top-1/2 -translate-y-1/2 z-20 hidden lg:flex h-11 w-11 items-center justify-center rounded-full border border-border/80 bg-background/95 hover:bg-background text-foreground hover:border-primary hover:text-primary transition shadow-card cursor-pointer shrink-0 hover:scale-105"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={scrollNext}
            aria-label="Next products"
            className="absolute -right-6 top-1/2 -translate-y-1/2 z-20 hidden lg:flex h-11 w-11 items-center justify-center rounded-full border border-border/80 bg-background/95 hover:bg-background text-foreground hover:border-primary hover:text-primary transition shadow-card cursor-pointer shrink-0 hover:scale-105"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="overflow-hidden cursor-grab active:cursor-grabbing px-2 py-4" ref={emblaRef}>
            <div className="flex gap-6">
              {processedProducts.map((p, i) => (
                <div key={p.id} className="min-w-0 flex-[0_0_46%] sm:flex-[0_0_46%] lg:flex-[0_0_23.5%]">
                  <ProductCard product={p} index={i} />
                </div>
              ))}
              {allProducts.length === 0 && (
                <div className="w-full text-center py-12 text-sm text-muted-foreground">
                  No products found in the catalog.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="mb-4 sm:mb-6 lg:mb-8">
        <ScrollBrandReveal collections={collectionsBanners} />
      </div>



      <QualityPromise collage={promiseCollage} />

      {/* Reviews */}
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
    </>
  );
}
