import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { isAuthed } from "@/lib/auth";
import { motion, AnimatePresence } from "motion/react";
import {
  Star,
  Heart,
  ShoppingBag,
  Truck,
  RotateCcw,
  ShieldCheck,
  Minus,
  Plus,
  Check,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import {
  getProduct,
  getRelated,
  getReviews,
  products as mockProducts,
  type Product,
  type ProductView,
} from "@/lib/products";
import { useStore } from "@/lib/store";
import { ProductCard } from "@/components/ProductCard";
import { Reveal, Stagger } from "@/components/Reveal";
import { cn, getImageUrl } from "@/lib/utils";
import { apiClient, API_BASE_URL } from "@/lib/api";

export const Route = createFileRoute("/product/$id")({
  shouldReload: true,
  loader: async ({ params }) => {
    // Try to load product from API first
    try {
      const p = await apiClient.products.get(params.id);
      if (p) {
        const mappedProduct: Product = {
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
          views: p.additionalImages && p.additionalImages.length > 0
            ? [
                { label: "Front", src: getImageUrl(p.coverImage) },
                ...p.additionalImages.map((img: any) => ({
                  label: img.label || "Side",
                  src: getImageUrl(img.url)
                }))
              ]
            : [{ label: "Front", src: getImageUrl(p.coverImage) }]
        };
        return { product: mappedProduct };
      }
    } catch (err) {
      console.warn("Product not found on backend MERN server, loading fallback mock data...", err);
    }

    const product = getProduct(params.id);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    const p = loaderData?.product;
    return {
      meta: [
        { title: p ? `${p.name} — MOCS` : "Product — MOCS" },
        {
          name: "description",
          content: p?.description ?? "Premium MOCS footwear.",
        },
        { property: "og:title", content: p ? `${p.name} — MOCS` : "MOCS" },
        { property: "og:description", content: p?.description ?? "Premium MOCS footwear." },
        ...(p ? [{ property: "og:image", content: p.image }] : []),
      ],
    };
  },
  component: ProductDetail,
  notFoundComponent: () => (
    <div className="grid min-h-[60vh] place-items-center px-4 text-center">
      <div>
        <h1 className="font-display text-3xl font-bold">Product not found</h1>
        <Link to="/shop" className="mt-4 inline-block font-semibold text-primary">
          Back to shop
        </Link>
      </div>
    </div>
  ),
});

function ProductDetail() {
  const { product }: { product: Product } = Route.useLoaderData();
  const {
    addToCart,
    toggleWishlist,
    isWishlisted,
    setCartOpen,
    pushRecentlyViewed,
    recentlyViewed,
  } = useStore();

  const [allVariants, setAllVariants] = useState<Product[]>([]);
  const [allBackendProducts, setAllBackendProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchVariants = async () => {
      if (!product.artNumber) return;
      try {
        const res = await apiClient.products.list(`artNumber=${encodeURIComponent(product.artNumber)}&limit=50`);
        if (res && res.items) {
          const apiVariants = res.items
            .filter((p: any) => p.artNumber === product.artNumber)
            .map((p: any) => ({
              id: p._id,
              artNumber: p.artNumber || "",
              name: p.name,
              category: p.category?.name || p.category || "Men",
              collection: p.collection || "Casual",
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
            }));
          setAllVariants(apiVariants);
        }
      } catch (err) {
        console.warn("Failed to fetch variants for art number", err);
      }
    };

    const loadAllProducts = async () => {
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
          }));
          setAllBackendProducts(apiProducts);
        }
      } catch (err) {
        console.warn("Failed to load products for detail page fallback", err);
      }
    };

    fetchVariants();
    loadAllProducts();
  }, [product.artNumber]);

  const colorOptions = useMemo(() => {
    if (allVariants.length > 0) {
      const options: { name: string; hex: string; productId: string }[] = [];
      allVariants.forEach((v) => {
        v.colors.forEach((c) => {
          if (!options.some((opt) => opt.name === c.name)) {
            options.push({ name: c.name, hex: c.hex, productId: v.id });
          }
        });
      });
      return options;
    } else {
      return product.colors.map((c) => ({ name: c.name, hex: c.hex, productId: product.id }));
    }
  }, [allVariants, product]);

  // Multi-view gallery: front / side / back / top / sole / lifestyle
  const gallery: ProductView[] = useMemo(() => {
    if (product.views && product.views.length > 0) return product.views;
    return [
      { label: "Front", src: product.image },
      ...allBackendProducts
        .filter((p) => p.id !== product.id)
        .slice(0, 3)
        .map<ProductView>((p) => ({ label: "Side", src: p.image })),
    ];
  }, [product, allBackendProducts]);

  const [active, setActive] = useState(0);
  const [size, setSize] = useState<number | null>(null);
  const [color, setColor] = useState(product.colors[0]?.name || "Default");
  const [qty, setQty] = useState(1);
  const [zoom, setZoom] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  // Responsive window resize state for slides per page in carousels
  const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1024);
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const cardsPerView = windowWidth >= 1024 ? 4.2 : windowWidth >= 768 ? 2.2 : 1.2;

  // Offset indices for carousels
  const [relatedIdx, setRelatedIdx] = useState(0);
  const [recentIdx, setRecentIdx] = useState(0);
  const [promoTexts, setPromoTexts] = useState<string[]>([
    (product as any).promo1 || "Easy shipping",
    (product as any).promo2 || "3-day returns",
    (product as any).promo3 || "3-months warranty"
  ]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  useEffect(() => {
    setPromoTexts([
      (product as any).promo1 || "Easy shipping",
      (product as any).promo2 || "3-day returns",
      (product as any).promo3 || "3-months warranty"
    ]);
  }, [product]);
  const [userReviews, setUserReviews] = useState<
    {
      name: string;
      rating: number;
      text: string;
      days: number;
      color: string;
      verified: boolean;
      size?: number | null;
    }[]
  >([]);
  const [rvName, setRvName] = useState("");
  const [rvText, setRvText] = useState("");
  const [rvRating, setRvRating] = useState(5);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);

  useEffect(() => {
    pushRecentlyViewed(product.id);
    setColor(product.colors[0]?.name || "Default");
    setSize(null);
    setQty(1);
    setActive(0);
    setZoom(false);
    setCurrentReviewIndex(0);

    const fetchReviews = async () => {
      try {
        const res = await apiClient.reviews.list(product.id);
        if (res) {
          const mapped = res.map((r: any) => ({
            name: r.user?.name || r.name || "Anonymous",
            rating: r.rating,
            text: r.comment || r.text || "",
            days: Math.round((Date.now() - new Date(r.createdAt).getTime()) / (1000 * 60 * 60 * 24)) || 0,
            color: r.color || "Default",
            verified: r.isVerifiedPurchase || false,
            size: r.size || null
          }));
          setUserReviews(mapped);
        }
      } catch (err) {
        console.warn("Failed to load reviews from API", err);
      }
    };
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);

  const reviews = [
    ...userReviews,
  ];

  useEffect(() => {
    setCurrentReviewIndex(0);
  }, [reviews.length]);

  const nextReview = () => {
    if (reviews.length <= 1) return;
    setCurrentReviewIndex((prev) => (prev + 1) % reviews.length);
  };

  const prevReview = () => {
    if (reviews.length <= 1) return;
    setCurrentReviewIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const recentProducts = recentlyViewed
    .filter((id) => id !== product.id)
    .map((id) => allBackendProducts.find((p) => p.id === id))
    .filter((p): p is Product => !!p)
    .slice(0, 10);

  const relatedProducts = useMemo(() => {
    const current = product;
    const same = allBackendProducts.filter((p) => p.id !== current.id && p.category === current.category);
    const others = allBackendProducts.filter((p) => p.id !== current.id && p.category !== current.category);
    return [...same, ...others].slice(0, 12);
  }, [allBackendProducts, product]);

  const wished = isWishlisted(product.id);
  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  const navigate = useNavigate();
  const handleColorClick = (opt: { name: string; hex: string; productId: string }) => {
    if (opt.productId !== product.id) {
      navigate({ to: "/product/$id", params: { id: opt.productId } });
    } else {
      setColor(opt.name);
    }
  };

  const handleAdd = (buyNow = false) => {
    if (!isAuthed()) {
      navigate({ to: "/auth", search: { redirect: `/product/${product.id}` } });
      return;
    }
    addToCart(product, size ?? product.sizes[2], color, qty);
    if (buyNow) setCartOpen(true);
  };

  return (
    <div key={product.id} className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-foreground">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link to="/shop" className="hover:text-foreground">Shop</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link to="/shop" className="hover:text-foreground">{product.category}</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div
            className="relative max-w-[450px] mx-auto aspect-square overflow-hidden rounded-3xl bg-muted border border-border/80 transition-all hover:border-primary/40 hover:shadow-lift"
            onMouseEnter={() => setZoom(true)}
            onMouseLeave={() => setZoom(false)}
            onMouseMove={handleMouseMove}
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={active}
                src={getImageUrl(gallery[active].src)}
                alt={`${product.name} — ${gallery[active].label}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{ transformOrigin: zoom ? `${mousePos.x}% ${mousePos.y}%` : "center" }}
                className={cn(
                  "h-full w-full object-cover transition-transform duration-200",
                  zoom && "scale-[2.5] cursor-zoom-in",
                )}
              />
            </AnimatePresence>
            {discount > 0 && (
              <span className="absolute left-4 top-4 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
                -{discount}%
              </span>
            )}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-6 max-w-[450px] mx-auto">
            {gallery.map((view, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActive(i)}
                onMouseEnter={() => setActive(i)}
                aria-label={view.label}
                className={cn(
                  "group relative aspect-square overflow-hidden rounded-xl border-2 bg-muted transition cursor-pointer",
                  active === i ? "border-primary" : "border-transparent hover:border-border",
                )}
              >
                <img
                  src={getImageUrl(view.src)}
                  alt={view.label}
                  className="h-full w-full object-cover"
                />
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/90 to-transparent py-1 text-center text-[10px] font-semibold uppercase tracking-wide">
                  {view.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            {product.collection} · {product.category}
          </p>
          <h1 className="mt-2 font-display text-4xl font-extrabold sm:text-5xl">{product.name}</h1>

          <div className="mt-3 flex items-center gap-3">
            <span className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-4 w-4",
                    i < Math.round(product.rating)
                      ? "fill-primary text-primary"
                      : "text-muted-foreground",
                  )}
                />
              ))}
            </span>
            <span className="text-sm font-medium">{product.rating}</span>
            <span className="text-sm text-muted-foreground">({product.reviews} reviews)</span>
          </div>

          <div className="mt-5 flex items-baseline gap-3">
            <span className="font-display text-3xl font-bold">₹{product.price}</span>
            {product.oldPrice && (
              <span className="text-lg text-muted-foreground line-through">₹{product.oldPrice}</span>
            )}
            {discount > 0 && (
              <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                Save ₹{product.oldPrice! - product.price}
              </span>
            )}
          </div>

          <p className="mt-5 leading-relaxed text-muted-foreground">{product.description}</p>

          {product.stock <= 6 && (
            <p className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-sm font-semibold text-primary">
              🔥 Only {product.stock} left in stock — order soon
            </p>
          )}

          <div className="mt-7">
            <p className="mb-3 text-sm font-bold uppercase tracking-wide">Colour: {color}</p>
            <div className="flex gap-3">
              {colorOptions.map((opt) => (
                <button
                  key={opt.name}
                  type="button"
                  onClick={() => handleColorClick(opt)}
                  aria-label={opt.name}
                  title={opt.name}
                  className={cn(
                    "h-10 w-10 rounded-full border-2 transition cursor-pointer",
                    color === opt.name
                      ? "border-primary ring-2 ring-primary/30"
                      : "border-border hover:border-primary",
                  )}
                  style={{ backgroundColor: opt.hex }}
                />
              ))}
            </div>
          </div>

          <div className="mt-7">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-bold uppercase tracking-wide">Select size </p>
              <button className="text-xs font-medium text-primary">Size guide</button>
            </div>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSize(s)}
                  className={cn(
                    "grid h-12 place-items-center rounded-xl border-2 text-sm font-semibold transition hover:border-primary",
                    size === s
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border",
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-7 flex items-center gap-4">
            <div className="flex items-center rounded-full border border-border">
              <button
                type="button"
                aria-label="Decrease"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="grid h-12 w-12 place-items-center"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center font-bold">{qty}</span>
              <button
                type="button"
                aria-label="Increase"
                onClick={() => setQty((q) => q + 1)}
                className="grid h-12 w-12 place-items-center"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <button
              type="button"
              onClick={() => toggleWishlist(product)}
              aria-label="Wishlist"
              className="grid h-12 w-12 place-items-center rounded-full border border-border transition hover:border-primary hover:text-primary"
            >
              <Heart className={cn("h-5 w-5", wished && "fill-primary text-primary")} />
            </button>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => handleAdd(false)}
              className="group flex flex-1 items-center justify-center gap-2 rounded-full bg-primary py-4 text-sm font-bold uppercase tracking-wide text-primary-foreground transition-all hover:-translate-y-0.5 hover:bg-primary-glow hover:shadow-lift"
            >
              <ShoppingBag className="h-4 w-4" /> Add to Cart
            </button>
            <button
              type="button"
              onClick={() => handleAdd(true)}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-secondary py-4 text-sm font-bold uppercase tracking-wide text-secondary-foreground transition-all hover:-translate-y-0.5"
            >
              Buy Now
            </button>
          </div>

          <div className="mt-7 grid grid-cols-3 gap-3 border-t border-border pt-6 text-center">
            {[
              { icon: Truck, t: promoTexts[0] },
              { icon: RotateCcw, t: promoTexts[1] },
              { icon: ShieldCheck, t: promoTexts[2] },
            ].map((f, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <f.icon className="h-5 w-5 text-primary" />
                <span className="text-xs font-medium text-muted-foreground">{f.t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="mt-20 text-left">
        <Reveal className="mb-8 flex items-end justify-between">
          <h2 className="font-display text-3xl font-extrabold">Customer Reviews</h2>
          <div className="flex items-center gap-2">
            <Star className="h-6 w-6 fill-primary text-primary" />
            <span className="font-display text-2xl font-bold">{product.rating}</span>
            <span className="text-muted-foreground">/ 5</span>
          </div>
        </Reveal>

        {reviews.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">No reviews yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl py-4 text-left">
            {reviews.map((review, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-border bg-card p-5 shadow-soft w-full text-left flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-0.5">
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-primary text-primary" />
                      ))}
                    </div>
                    {review.verified && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-semibold text-success">
                        <Check className="h-3 w-3" /> Verified
                      </span>
                    )}
                  </div>
                  <p className="mt-3 text-sm text-stone-600 font-medium">"{review.text}"</p>
                </div>
                <div className="mt-4 pt-3 border-t border-stone-100">
                  <p className="text-xs font-bold text-stone-900">{review.name}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {review.days} days ago {review.color ? `· ${review.color}` : ""}{review.size ? ` · Size ${review.size}` : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {relatedProducts.length > 0 && (
        <section className="mt-20 text-left">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display text-3xl font-extrabold">You May Also Like</h2>
            {relatedProducts.length > cardsPerView && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setRelatedIdx((prev) => Math.max(0, prev - 1))}
                  disabled={relatedIdx === 0}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-600 hover:border-primary hover:text-primary transition disabled:opacity-30 disabled:pointer-events-none cursor-pointer shadow-sm"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setRelatedIdx((prev) => Math.min(relatedProducts.length - cardsPerView, prev + 1))}
                  disabled={relatedIdx >= relatedProducts.length - cardsPerView}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-600 hover:border-primary hover:text-primary transition disabled:opacity-30 disabled:pointer-events-none cursor-pointer shadow-sm"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          <div className="relative -mx-4 px-4 overflow-hidden pt-4 pb-6">
            <div 
              className="flex gap-6 transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]"
              style={{
                transform: `translateX(calc(-${relatedIdx} * (100% / ${cardsPerView}) - ${relatedIdx * 24 / cardsPerView}px))`
              }}
            >
              {relatedProducts.map((p, i) => (
                <div 
                  key={p.id} 
                  className={cn(
                    "shrink-0",
                    cardsPerView === 4.2 
                      ? "w-[calc(23.8%-18px)]" 
                      : cardsPerView === 2.2 
                        ? "w-[calc(45.45%-14px)]" 
                        : "w-[calc(83.33%-10px)]"
                  )}
                >
                  <ProductCard product={p} index={i} variant="simple" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {recentProducts.length > 0 && (
        <section className="mt-20 text-left">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display text-3xl font-extrabold">Recently Viewed</h2>
            {recentProducts.length > cardsPerView && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setRecentIdx((prev) => Math.max(0, prev - 1))}
                  disabled={recentIdx === 0}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-600 hover:border-primary hover:text-primary transition disabled:opacity-30 disabled:pointer-events-none cursor-pointer shadow-sm"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setRecentIdx((prev) => Math.min(recentProducts.length - cardsPerView, prev + 1))}
                  disabled={recentIdx >= recentProducts.length - cardsPerView}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-600 hover:border-primary hover:text-primary transition disabled:opacity-30 disabled:pointer-events-none cursor-pointer shadow-sm"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          <div className="relative -mx-4 px-4 overflow-hidden pt-4 pb-6">
            <div 
              className="flex gap-6 transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]"
              style={{
                transform: `translateX(calc(-${recentIdx} * (100% / ${cardsPerView}) - ${recentIdx * 24 / cardsPerView}px))`
              }}
            >
              {recentProducts.map((p, i) => (
                <div 
                  key={p.id} 
                  className={cn(
                    "shrink-0",
                    cardsPerView === 4.2 
                      ? "w-[calc(23.8%-18px)]" 
                      : cardsPerView === 2.2 
                        ? "w-[calc(45.45%-14px)]" 
                        : "w-[calc(83.33%-10px)]"
                  )}
                >
                  <ProductCard product={p} index={i} variant="simple" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}


    </div>
  );
}
