import { createFileRoute } from "@tanstack/react-router";
import { Plus, Search, Filter } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { adminProducts } from "@/lib/admin-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/products")({
  head: () => ({
    meta: [
      { title: "Products — MOCS Admin" },
      { name: "description", content: "Manage the MOCS footwear catalogue across Men, Women and Kids." },
    ],
  }),
  component: ProductsPage,
});

const statusBadge: Record<string, string> = {
  Live: "bg-success/15 text-[oklch(0.45_0.17_150)]",
  "Low Stock": "bg-warning/15 text-[oklch(0.55_0.16_75)]",
  Draft: "bg-muted text-muted-foreground",
};

function ProductsPage() {
  return (
    <AdminShell title="Products" subtitle="Every silhouette in the MOCS lineup.">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Search products or SKUs"
            className="h-11 w-full rounded-full border border-border bg-card pl-9 pr-4 text-sm font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <button className="inline-flex h-11 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-bold">
          <Filter className="h-4 w-4" /> Category
        </button>
        <button className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-bold uppercase tracking-wider text-primary-foreground">
          <Plus className="h-4 w-4" /> New product
        </button>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {adminProducts.map((p) => (
          <article
            key={p.id}
            className="group overflow-hidden rounded-3xl border border-border bg-card shadow-[var(--shadow-soft)] transition hover:-translate-y-1 hover:shadow-[var(--shadow-card)]"
          >
            <div className="relative aspect-[5/4] overflow-hidden bg-muted">
              <img src={p.image} alt={p.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
              <span className={cn("absolute left-4 top-4 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider", statusBadge[p.status])}>
                {p.status}
              </span>
              <span className="absolute right-4 top-4 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-secondary backdrop-blur">
                {p.category}
              </span>
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{p.sku}</p>
                  <h3 className="mt-1 truncate font-display text-lg font-extrabold">{p.name}</h3>
                </div>
                <p className="font-display text-xl font-extrabold">${p.price}</p>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-muted/60 py-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Stock</p>
                  <p className="font-display text-sm font-extrabold">{p.stock}</p>
                </div>
                <div className="rounded-xl bg-muted/60 py-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Sold</p>
                  <p className="font-display text-sm font-extrabold">{p.sold}</p>
                </div>
                <div className="rounded-xl bg-muted/60 py-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Line</p>
                  <p className="font-display text-sm font-extrabold">{p.collection}</p>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button className="flex-1 rounded-full bg-secondary py-2 text-xs font-bold uppercase tracking-wider text-secondary-foreground">
                  Edit
                </button>
                <button className="flex-1 rounded-full border border-border py-2 text-xs font-bold uppercase tracking-wider">
                  View
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </AdminShell>
  );
}
