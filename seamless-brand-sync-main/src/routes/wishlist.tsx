import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import type { Product } from "@/lib/products";
import { useStore } from "@/lib/store";
import { ProductCard } from "@/components/ProductCard";
import { Stagger } from "@/components/Reveal";
import { getImageUrl } from "@/lib/utils";
import { apiClient, API_BASE_URL } from "@/lib/api";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [
      { title: "Your Wishlist — MOCS" },
      { name: "description", content: "Your saved MOCS sneakers, ready when you are." },
    ],
  }),
  component: Wishlist,
});

function Wishlist() {
  const { wishlist } = useStore();
  const [saved, setSaved] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWishlist = async () => {
      try {
        setLoading(true);
        const res = await apiClient.products.list("limit=100");
        if (res && res.items) {
          const apiProducts: Product[] = res.items.map((p: any) => ({
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
          setSaved(apiProducts.filter((p) => wishlist.includes(p.id)));
        }
      } catch (err) {
        console.warn("Failed to load wishlist products", err);
      } finally {
        setLoading(false);
      }
    };
    loadWishlist();
  }, [wishlist]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-display text-4xl font-extrabold sm:text-5xl">Your Wishlist</h1>
      <p className="mt-2 text-muted-foreground">
        {saved.length} {saved.length === 1 ? "item" : "items"} saved
      </p>

      {loading ? (
        <div className="mt-16 flex flex-col items-center justify-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading your wishlist...</p>
        </div>
      ) : saved.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-4 text-center">
          <span className="grid h-20 w-20 place-items-center rounded-full bg-accent">
            <Heart className="h-9 w-9 text-muted-foreground" />
          </span>
          <p className="text-muted-foreground">You haven't saved anything yet.</p>
          <Link
            to="/shop"
            className="rounded-full bg-primary px-7 py-3 text-sm font-bold uppercase tracking-wide text-primary-foreground transition hover:bg-primary-glow"
          >
            Discover footwear
          </Link>
        </div>
      ) : (
        <Stagger className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {saved.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </Stagger>
      )}
    </div>
  );
}
