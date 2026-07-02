import { Edit2, RotateCcw, Trash2, Eye } from "lucide-react";

interface ProductTableProps {
  products: any[];
  onEdit: (product: any) => void;
  onRestore: (product: any) => void;
  onSoftDelete: (product: any) => void;
  getImageUrl: (url: string) => string;
  page: number;
  totalPages: number;
  totalItems: number;
  setPage: (p: number | ((prev: number) => number)) => void;
}

export function ProductTable({
  products,
  onEdit,
  onRestore,
  onSoftDelete,
  getImageUrl,
  page,
  totalPages,
  totalItems,
  setPage,
}: ProductTableProps) {
  return (
    <div className="space-y-4">
      {/* Top Pagination and Total Counter */}
      <div className="flex flex-wrap items-center justify-between border border-border rounded-2xl p-4 bg-card shadow-soft gap-4">
        <span className="text-xs text-muted-foreground font-semibold">
          Showing page {page} of {totalPages || 1} ({totalItems} products total)
        </span>
        {totalPages > 1 && (
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-bold transition hover:bg-accent disabled:opacity-50 cursor-pointer"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-bold transition hover:bg-accent disabled:opacity-50 cursor-pointer"
            >
              Next
            </button>
          </div>
        )}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-soft">
        <table className="w-full border-collapse text-left text-sm text-muted-foreground">
          <thead className="bg-muted/10 font-display text-xs font-bold uppercase tracking-wider text-foreground">
            <tr>
              <th className="p-4">Shoe</th>
              <th className="p-4">Art Num / Category</th>
              <th className="p-4">Color Shade</th>
              <th className="p-4">Stock</th>
              <th className="p-4">Price</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {products.map((p) => {
              const colorOpt = p.colors?.[0] || { name: "Default", hex: "#0" };
              return (
                <tr
                  key={p._id}
                  className={`transition hover:bg-muted/5 ${
                    p.isDeleted ? "bg-destructive/5 opacity-80" : ""
                  }`}
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={getImageUrl(p.coverImage)}
                        alt={p.name}
                        className="h-11 w-11 rounded-xl object-cover bg-muted border border-border"
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground truncate max-w-[200px]">
                          {p.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                          {p.collection}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-foreground text-xs font-mono">
                      {p.artNumber || "—"}
                    </p>
                    <p className="text-xs text-muted-foreground">{p.category?.name || "—"}</p>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-4 w-4 rounded-full border border-border/80"
                        style={{ backgroundColor: colorOpt.hex }}
                      />
                      <span className="text-xs font-medium text-foreground">{colorOpt.name}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span
                      className={`font-semibold ${
                        p.stock === 0 ? "text-destructive" : "text-foreground"
                      }`}
                    >
                      {p.stock}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="font-semibold text-foreground">₹{p.price}</span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => onEdit(p)}
                        className="rounded-xl border border-border p-2 text-muted-foreground transition hover:bg-accent hover:text-foreground"
                        title="Edit Product"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>

                      {p.isDeleted ? (
                        <button
                          onClick={() => onRestore(p)}
                          className="rounded-xl border border-border p-2 text-emerald-500 transition hover:bg-emerald-500/10 hover:border-emerald-500"
                          title="Restore Product"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => onSoftDelete(p)}
                          className="rounded-xl border border-border p-2 text-destructive transition hover:bg-destructive/10 hover:border-destructive"
                          title="Soft Delete Product"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-xs text-muted-foreground">
                  No catalog products found matching filter settings.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Bottom Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border/50 pt-4 px-2">
          <span className="text-xs text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-bold transition hover:bg-accent disabled:opacity-50 cursor-pointer"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-bold transition hover:bg-accent disabled:opacity-50 cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
