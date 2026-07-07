import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { Search, X, TrendingUp } from "lucide-react";
import { useStore } from "@/lib/store";
import { getImageUrl } from "@/lib/utils";
import type { Product } from "@/lib/products";
import { apiClient, API_BASE_URL } from "@/lib/api";

const trending = ["Men", "Women", "Kids", "Velocity Pro", "Trending"];

export function SearchModal() {
  const { searchOpen, setSearchOpen } = useStore();
  const [query, setQuery] = useState("");
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (!searchOpen) {
      setQuery("");
    } else {
      const loadSearchProducts = async () => {
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
            setAllProducts(apiProducts);
          }
        } catch (err) {
          console.warn("Failed to fetch search products", err);
        }
      };
      loadSearchProducts();
    }
  }, [searchOpen]);

  const q = query.trim().toLowerCase();
  const results = q
    ? allProducts.filter((p) => {
      const haystack = [
        p.name,
        p.category,
        p.collection,
        p.type,
        p.description,
        ...p.colors.map((c) => c.name),
      ]
        .join(" ")
        .toLowerCase();
      return q.split(/\s+/).every((token) => haystack.includes(token));
    })
    : [];

  return (
    <AnimatePresence>
      {searchOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] bg-secondary/60 backdrop-blur-sm"
          onClick={() => setSearchOpen(false)}
        >
          <motion.div
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -40, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="mx-auto mt-0 w-full bg-background p-5 shadow-card sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto max-w-3xl">
              <div className="flex items-center gap-3 border-b-2 border-foreground pb-3">
                <Search className="h-5 w-5 text-primary" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for sneakers, collections..."
                  className="flex-1 bg-transparent text-lg outline-none placeholder:text-muted-foreground"
                />
                <button type="button" aria-label="Close search" onClick={() => setSearchOpen(false)}>
                  <X className="h-5 w-5" />
                </button>
              </div>

              {!query && (
                <div className="mt-5">
                  <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <TrendingUp className="h-4 w-4" /> Trending
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {trending.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setQuery(t)}
                        className="rounded-full bg-accent px-4 py-2 text-sm font-medium transition hover:bg-primary hover:text-primary-foreground"
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {query && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-5 max-h-[60vh] space-y-2 overflow-y-auto"
                >
                  {results.length === 0 && (
                    <p className="py-8 text-center text-muted-foreground">
                      No results for "{query}"
                    </p>
                  )}
                  {results.map((p) => (
                    <Link
                      key={p.id}
                      to="/product/$id"
                      params={{ id: p.id }}
                      onClick={() => setSearchOpen(false)}
                      className="flex items-center gap-4 rounded-xl p-2 transition hover:bg-accent"
                    >
                      <img src={getImageUrl(p.image)} alt={p.name} className="h-14 w-14 rounded-lg object-cover" />
                      <div className="flex-1">
                        <p className="font-semibold">{p.name}</p>
                        <p className="text-sm text-muted-foreground">{p.category}</p>
                      </div>
                      <span className="font-bold">₹{p.price}</span>
                    </Link>
                  ))}
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
