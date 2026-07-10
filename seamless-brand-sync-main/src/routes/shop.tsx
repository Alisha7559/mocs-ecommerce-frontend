import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, ChevronRight, Check, SlidersHorizontal, X, ArrowLeft } from "lucide-react";
import {
  products as mockProducts,
  sortOptions,
  type Product,
} from "@/lib/products";
import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard";
import { cn, getImageUrl } from "@/lib/utils";
import { apiClient, API_BASE_URL } from "@/lib/api";
import { useStore } from "@/lib/store";

// Styled custom dropdown that animates open/close instead of using native <select>.
function FancyDropdown<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label?: string;
  value: T;
  options: readonly T[];
  onChange: (v: T) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex w-full min-w-[160px] items-center justify-between gap-2 rounded-full border border-stone-200 bg-white px-5 py-2.5 text-sm font-bold text-stone-700 transition hover:border-primary hover:text-stone-900 cursor-pointer shadow-sm"
      >
        <span className="truncate">
          {label ? <span className="text-stone-400 font-medium">{label}: </span> : null}
          {value}
        </span>
        <ChevronDown className={cn("h-4 w-4 text-stone-450 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div 
          className="fixed inset-0 z-30 bg-transparent cursor-default" 
          onClick={() => setOpen(false)} 
        />
      )}
      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 z-35 mt-2 w-56 overflow-hidden rounded-2xl border border-stone-200 bg-white p-1.5 shadow-lift"
          >
            {options.map((opt) => (
              <li key={opt}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(opt);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-bold transition cursor-pointer",
                    value === opt
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-primary/5 text-stone-650 hover:text-primary",
                  )}
                >
                  {opt}
                  {value === opt && <Check className="h-4 w-4 text-primary" />}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

type ShopSearch = {
  category?: "Men" | "Women" | "Kids";
  collection?: string;
};

export const Route = createFileRoute("/shop")({
  validateSearch: (s: Record<string, unknown>): ShopSearch => {
    const c = s.category;
    const coll = s.collection;
    const result: ShopSearch = {};
    if (c === "Men" || c === "Women" || c === "Kids") result.category = c;
    if (typeof coll === "string") result.collection = coll;
    return result;
  },
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
      console.warn("Failed to load products from API", err);
    }
    return { products: [] };
  },
  shouldReload: true,
  head: () => ({
    meta: [
      { title: "Shop All Footwear — MOCS" },
      {
        name: "description",
        content:
          "Browse the full MOCS collection of premium footwear for Men, Women and Kids. Filter by collection, price, colour and rating.",
      },
      { property: "og:title", content: "Shop All Footwear — MOCS" },
      { property: "og:description", content: "Browse the full MOCS premium footwear collection." },
    ],
  }),
  component: Shop,
});

function Shop() {
  const { products } = Route.useLoaderData();
  const search = Route.useSearch();
  const [loading, setLoading] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>(products);
  const [cat, setCat] = useState<string>(search.category ?? "All");
  const [coll, setColl] = useState<string>(search.collection ?? "All");
  const [colorFilter, setColorFilter] = useState<string | null>(null);
  const [maxPrice, setMaxPrice] = useState(5000);
  const [sort, setSort] = useState<(typeof sortOptions)[number]>("Top Trending");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setAllProducts(products);
  }, [products]);

  useEffect(() => {
    setCat(search.category ?? "All");
  }, [search.category]);

  useEffect(() => {
    setColl(search.collection ?? "All");
  }, [search.collection]);

  const availableCategories = useMemo(() => {
    const list = new Set<string>(["All"]);
    allProducts.forEach(p => { if (p.category) list.add(p.category); });
    return Array.from(list);
  }, [allProducts]);

  const { collections } = useStore();

  const availableCollections = useMemo(() => {
    const list = new Set<string>(["All", "Sandals", "Sports", "Casual", "Formal", "Trending", "New Arrival"]);
    collections.forEach((c: any) => list.add(c.name));
    return Array.from(list);
  }, [collections]);

  const availableColors = useMemo(() => {
    const map = new Map<string, string>();
    allProducts
      .filter((p) => {
        const matchesCategory = (cat === "All" || p.category === cat);
        const matchesCollection = (coll === "All" ||
          p.collection?.toLowerCase() === coll.toLowerCase() ||
          (coll === "Casual" && p.collection?.toLowerCase()?.startsWith("casual")) ||
          (coll === "Sandals" && p.collection?.toLowerCase()?.startsWith("sandal")) ||
          (coll === "New Arrival" && (p.isNew || p.collection?.toLowerCase()?.includes("new"))) ||
          (coll === "Trending" && (p.rating >= 4.8 || p.collection?.toLowerCase()?.includes("trend"))));
        return matchesCategory && matchesCollection;
      })
      .forEach((p) => p.colors.forEach((c) => map.set(c.name, c.hex)));
    return Array.from(map, ([name, hex]) => ({ name, hex }));
  }, [allProducts, cat, coll]);

  const filtered = useMemo(() => {
    let list = allProducts.filter(
      (p) => {
        const matchesCategory = (cat === "All" || p.category === cat);
        const matchesCollection = (coll === "All" ||
          p.collection?.toLowerCase() === coll.toLowerCase() ||
          (coll === "Casual" && p.collection?.toLowerCase()?.startsWith("casual")) ||
          (coll === "Sandals" && p.collection?.toLowerCase()?.startsWith("sandal")) ||
          (coll === "New Arrival" && (p.isNew || p.collection?.toLowerCase()?.includes("new"))) ||
          (coll === "Trending" && (p.rating >= 4.8 || p.collection?.toLowerCase()?.includes("trend"))));
        const matchesPrice = p.price <= maxPrice;
        const matchesColor = (!colorFilter || p.colors.some((c) => c.name.toLowerCase() === colorFilter.toLowerCase()));

        return matchesCategory && matchesCollection && matchesPrice && matchesColor;
      }
    );
    if (sort === "Price: Low to High") list = [...list].sort((a, b) => a.price - b.price);
    else if (sort === "Price: High to Low") list = [...list].sort((a, b) => b.price - a.price);
    else if (sort === "Top Trending")
      list = [...list].sort((a, b) => Number(b.trending ?? 0) - Number(a.trending ?? 0));
    else if (sort === "Newest")
      list = [...list].sort((a, b) => Number(b.isNew ?? 0) - Number(a.isNew ?? 0));
    else if (sort === "Best Selling")
      list = [...list].sort((a, b) => Number(b.bestSelling ?? 0) - Number(a.bestSelling ?? 0));
    return list;
  }, [allProducts, cat, coll, colorFilter, maxPrice, sort]);

  const Filters = (
    <div className="space-y-8">
      <div>
        <h3 className="mb-3 font-display text-sm font-bold uppercase tracking-wide">Category</h3>
        <div className="flex flex-wrap gap-2">
          {availableCategories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCat(c)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-bold transition cursor-pointer",
                cat === c
                  ? "border-primary bg-primary text-white shadow-sm"
                  : "border-stone-200 bg-white text-stone-600 hover:border-primary hover:text-primary hover:bg-primary/5",
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 font-display text-sm font-bold uppercase tracking-wide">Collection</h3>
        <FancyDropdown
          value={coll}
          options={availableCollections}
          onChange={(v) => setColl(v)}
        />
      </div>

      <div>
        <h3 className="mb-3 font-display text-sm font-bold uppercase tracking-wide">
          Max price: <span className="text-primary">₹{maxPrice}</span>
        </h3>
        <input
          type="range"
          min={10}
          max={3000}
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-primary cursor-pointer"
        />
      </div>

      <div>
        <h3 className="mb-3 font-display text-sm font-bold uppercase tracking-wide">Colour</h3>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setColorFilter(null)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-bold transition cursor-pointer",
              !colorFilter
                ? "border-primary bg-primary text-white shadow-sm"
                : "border-stone-200 bg-white text-stone-600 hover:border-primary hover:text-primary hover:bg-primary/5",
            )}
          >
            All
          </button>
          {availableColors.map((c) => (
            <button
              key={c.name}
              type="button"
              onClick={() => setColorFilter(c.name)}
              aria-label={c.name}
              title={c.name}
              className={cn(
                "h-8 w-8 rounded-full border-2 transition cursor-pointer",
                colorFilter === c.name
                  ? "border-primary ring-2 ring-primary/30"
                  : "border-border hover:border-primary",
              )}
              style={{ backgroundColor: c.hex }}
            />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 pb-6 pt-1 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3 mb-2 text-left">
        <Link to="/" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition hover:border-primary hover:text-primary">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link to="/" className="transition hover:text-foreground">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link to="/shop" className="transition hover:text-foreground">Shop</Link>
          {cat !== "All" && (
            <>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="font-medium text-foreground">{cat}</span>
            </>
          )}
        </nav>
      </div>

      <div className="grid gap-8 lg:grid-cols-[260px_1fr] mt-6">
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-2xl border border-border bg-card p-6 shadow-soft">
            {Filters}
          </div>
        </aside>

        <div>
          <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-stone-100 pb-5">
            <div className="text-left">
              <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-stone-900 leading-tight">
                Shop {cat === "All" ? "All" : cat}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground font-medium">
                {loading ? "Loading..." : `${filtered.length} products`}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setShowFilters(true)}
                className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium lg:hidden hover:border-primary hover:text-primary transition bg-white cursor-pointer"
              >
                <SlidersHorizontal className="h-4 w-4" /> Filters
              </button>
              <FancyDropdown label="Sort" value={sort} options={sortOptions} onChange={(v) => setSort(v)} />
            </div>
          </div>

          <motion.div
            layout
            className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4"
          >
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : filtered.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </motion.div>

          {!loading && filtered.length === 0 && (
            <p className="py-20 text-center text-muted-foreground">
              No products match your filters.
            </p>
          )}
        </div>
      </div>

      {showFilters && (
        <div
          className="fixed inset-0 z-[60] bg-secondary/60 backdrop-blur-sm lg:hidden"
          onClick={() => setShowFilters(false)}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-background p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold">Filters</h2>
              <button type="button" onClick={() => setShowFilters(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            {Filters}
          </motion.div>
        </div>
      )}
    </div>
  );
}
