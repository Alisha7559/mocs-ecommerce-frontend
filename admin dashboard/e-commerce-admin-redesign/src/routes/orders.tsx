import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Filter, Download, Search } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { adminOrders } from "@/lib/admin-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/orders")({
  head: () => ({
    meta: [
      { title: "Orders — MOCS Admin" },
      { name: "description", content: "Manage MOCS orders across web, app and retail channels." },
    ],
  }),
  component: OrdersPage,
});

const statusBadge: Record<string, string> = {
  Pending: "bg-warning/15 text-[oklch(0.55_0.16_75)]",
  Processing: "bg-primary/15 text-primary",
  Shipped: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  Delivered: "bg-success/15 text-[oklch(0.45_0.17_150)]",
  Refunded: "bg-destructive/10 text-destructive",
};

const tabs = ["All", "Pending", "Processing", "Shipped", "Delivered", "Refunded"];

function OrdersPage() {
  const [orders, setOrders] = useState<any[]>(adminOrders);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBackendOrders() {
      try {
        let token = localStorage.getItem("mocs_admin_token");
        if (!token) {
          const loginRes = await fetch("http://localhost:5000/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: "admin@mocs.com", password: "mocsadmin123" }),
          });
          if (loginRes.ok) {
            const data = await loginRes.json();
            token = data.token;
            if (token) localStorage.setItem("mocs_admin_token", token);
          }
        }

        if (token) {
          const res = await fetch("http://localhost:5000/api/orders/all", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const dbOrders = await res.json();
            const mapped = dbOrders.map((o: any) => ({
              id: `#MO-${o._id.substring(o._id.length - 5).toUpperCase()}`,
              customer: o.shippingAddress?.fullName || o.user?.name || "Guest Customer",
              email: o.user?.email || "guest@mocs.com",
              product: o.items?.[0]?.name || "Footwear",
              productImage: o.items?.[0]?.image || "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
              qty: o.items?.reduce((sum: number, item: any) => sum + item.qty, 0) || 1,
              total: o.total,
              status: o.status.charAt(0).toUpperCase() + o.status.slice(1),
              channel: o.paymentMethod === "cod" ? "Web" : "App",
              placedAt: new Date(o.createdAt).toLocaleDateString()
            }));
            setOrders(mapped);
          }
        }
      } catch (err) {
        console.error("Backend fetch error, using mockup data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchBackendOrders();
  }, []);

  return (
    <AdminShell title="Orders" subtitle="Track every pair shipped from the MOCS network.">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Search by order, customer or SKU"
            className="h-11 w-full rounded-full border border-border bg-card pl-9 pr-4 text-sm font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <button className="inline-flex h-11 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-bold">
          <Filter className="h-4 w-4" /> Filters
        </button>
        <button className="inline-flex h-11 items-center gap-2 rounded-full bg-secondary px-4 text-sm font-bold uppercase tracking-wider text-secondary-foreground">
          <Download className="h-4 w-4" /> Export
        </button>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {tabs.map((t, i) => (
          <button
            key={t}
            className={cn(
              "rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition",
              i === 0 ? "bg-primary text-primary-foreground" : "border border-border bg-card text-foreground hover:bg-muted",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-soft)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-left text-[10px] uppercase tracking-widest text-muted-foreground">
              <th className="px-6 py-3 font-bold">Order</th>
              <th className="px-3 py-3 font-bold">Customer</th>
              <th className="px-3 py-3 font-bold">Channel</th>
              <th className="px-3 py-3 font-bold">Qty</th>
              <th className="px-3 py-3 font-bold">Total</th>
              <th className="px-3 py-3 font-bold">Placed</th>
              <th className="px-6 py-3 font-bold">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-6 text-muted-foreground">Loading dashboard orders...</td>
              </tr>
            ) : orders.map((o) => (
              <tr key={o.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img src={o.productImage} alt="" className="h-12 w-12 rounded-lg object-cover" />
                    <div>
                      <p className="font-bold">{o.id}</p>
                      <p className="text-xs text-muted-foreground">{o.product}</p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-4">
                  <p className="font-semibold">{o.customer}</p>
                  <p className="text-xs text-muted-foreground">{o.email}</p>
                </td>
                <td className="px-3 py-4">
                  <span className="rounded-full border border-border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider">
                    {o.channel}
                  </span>
                </td>
                <td className="px-3 py-4 font-semibold">{o.qty}</td>
                <td className="px-3 py-4 font-display font-extrabold">₹{o.total}</td>
                <td className="px-3 py-4 text-muted-foreground">{o.placedAt}</td>
                <td className="px-6 py-4">
                  <span className={cn("inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider", statusBadge[o.status])}>
                    {o.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
