import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  ArrowUpRight,
  MoreHorizontal,
  Plus,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { AdminShell } from "@/components/admin/AdminShell";
import { adminOrders, adminProducts, salesByDay, channelSplit } from "@/lib/admin-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — MOCS Admin" },
      { name: "description", content: "Daily revenue, orders, inventory and customer pulse for MOCS premium footwear." },
    ],
  }),
  component: Dashboard,
});

const orderStatusBadge: Record<string, string> = {
  Pending: "bg-warning/15 text-[oklch(0.55_0.16_75)]",
  Processing: "bg-primary/15 text-primary",
  Shipped: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  Delivered: "bg-success/15 text-[oklch(0.45_0.17_150)]",
  Refunded: "bg-destructive/10 text-destructive",
};

function Dashboard() {
  const [analytics, setAnalytics] = useState<any>({
    totalUsers: 1284,
    totalProducts: 6,
    totalOrders: 405,
    totalRevenue: 51770,
    pendingOrders: 121,
    completedOrders: 284,
    pendingPayments: 121,
    failedPayments: 15
  });
  const [recentOrders, setRecentOrders] = useState<any[]>(adminOrders.slice(0, 5));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
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
          const res = await fetch("http://localhost:5000/api/payments/stats", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const statsData = await res.json();
            if (statsData.analytics) {
              setAnalytics(statsData.analytics);
            }
            if (statsData.recentOrders && statsData.recentOrders.length > 0) {
              const mappedRecent = statsData.recentOrders.map((o: any) => ({
                id: `#MO-${o._id.substring(o._id.length - 5).toUpperCase()}`,
                customer: o.shippingAddress?.fullName || o.user?.name || "Guest Customer",
                placedAt: new Date(o.createdAt).toLocaleDateString(),
                product: o.items?.[0]?.name || "Footwear",
                productImage: o.items?.[0]?.image || "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
                total: o.total,
                status: o.status.charAt(0).toUpperCase() + o.status.slice(1)
              }));
              setRecentOrders(mappedRecent);
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch dashboard stats, using mock:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  const dynamicStats = [
    { label: "Revenue", value: `₹${analytics.totalRevenue.toLocaleString()}`, delta: "+12.4%", up: true, sub: "vs last 7 days", icon: DollarSign },
    { label: "Orders", value: String(analytics.totalOrders), delta: "+8.1%", up: true, sub: `${analytics.completedOrders} fulfilled`, icon: ShoppingBag },
    { label: "New Customers", value: String(analytics.totalUsers), delta: "+24%", up: true, sub: "first-time buyers", icon: Users },
    { label: "Avg. Order Value", value: `₹${analytics.totalOrders > 0 ? Math.round(analytics.totalRevenue / analytics.totalOrders) : 0}`, delta: "-2.1%", up: false, sub: "calculated average", icon: Package },
  ];

  return (
    <AdminShell title="Good morning, Aarav" subtitle="Here is how MOCS is performing today.">
      {/* Hero banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-secondary via-secondary to-[oklch(0.28_0.012_286)] p-6 text-secondary-foreground sm:p-8">
        <div className="absolute -right-10 -top-10 h-56 w-56 rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute -bottom-12 left-1/3 h-40 w-40 rounded-full bg-primary-glow/30 blur-3xl" />
        <div className="relative grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary-foreground/70">
              New Season · 2026 Drop
            </p>
            <h2 className="mt-3 max-w-xl font-display text-3xl font-black leading-tight sm:text-4xl">
              The Velocity Pro is trending. <span className="text-gradient">312 pairs sold</span> in the last 48 hours.
            </h2>
            <p className="mt-3 max-w-lg text-sm text-secondary-foreground/70">
              Re-stock the Solar Orange colorway before the weekend push. Three retail partners are awaiting allocation.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-primary-foreground transition hover:opacity-90">
                <Plus className="h-4 w-4" /> Reorder stock
              </button>
              <button className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-secondary-foreground backdrop-blur transition hover:bg-white/10">
                View product <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="grid grid-cols-2 gap-3">
              {[{ k: "Stock left", v: "12" }, { k: "Wishlisted", v: "2.4k" }, { k: "Returns", v: "0.8%" }, { k: "5★ Reviews", v: "98%" }].map((s) => (
                <div key={s.k} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-secondary-foreground/60">{s.k}</p>
                  <p className="mt-1 font-display text-2xl font-extrabold">{s.v}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dynamicStats.map(({ label, value, delta, up, sub, icon: Icon }) => (
          <div key={label} className="group rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)] transition hover:shadow-[var(--shadow-card)]">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-3 font-display text-3xl font-extrabold tracking-tight">{value}</p>
            <div className="mt-2 flex items-center gap-2 text-xs">
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-bold",
                  up ? "bg-success/15 text-[oklch(0.45_0.17_150)]" : "bg-destructive/10 text-destructive",
                )}
              >
                {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />} {delta}
              </span>
              <span className="text-muted-foreground">{sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Chart + Channel */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)] lg:col-span-2">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Revenue</p>
              <h3 className="mt-1 font-display text-2xl font-extrabold">Weekly Performance</h3>
            </div>
            <div className="flex gap-1 rounded-full bg-muted p-1 text-xs font-bold">
              {["7d", "30d", "90d", "YTD"].map((t, i) => (
                <button
                  key={t}
                  className={cn(
                    "rounded-full px-3 py-1.5 transition",
                    i === 0 ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesByDay} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.702 0.21 47)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="oklch(0.702 0.21 47)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="oklch(0.92 0.002 286)" strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="d" stroke="oklch(0.50 0.006 286)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.50 0.006 286)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.92 0.002 286)", boxShadow: "0 10px 40px -18px oklch(0 0 0 / 0.18)" }}
                  labelStyle={{ fontWeight: 700 }}
                />
                <Area type="monotone" dataKey="revenue" stroke="oklch(0.702 0.21 47)" strokeWidth={3} fill="url(#rev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Sales Channel</p>
          <h3 className="mt-1 font-display text-2xl font-extrabold">Where MOCS sells</h3>
          <div className="mt-4 h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={channelSplit} dataKey="value" innerRadius={48} outerRadius={70} paddingAngle={3}>
                  {channelSplit.map((c) => (
                    <Cell key={c.name} fill={c.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-2 space-y-2">
            {channelSplit.map((c) => (
              <li key={c.name} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: c.color }} />
                  <span className="font-semibold">{c.name}</span>
                </span>
                <span className="font-display font-extrabold">{c.value}%</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Orders + top products */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card shadow-[var(--shadow-soft)] lg:col-span-2">
          <div className="flex items-center justify-between p-6 pb-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Recent</p>
              <h3 className="font-display text-2xl font-extrabold">Latest orders</h3>
            </div>
            <a href="/orders" className="text-xs font-bold uppercase tracking-wider text-primary hover:underline">
              View all →
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-y border-border bg-muted/40 text-left text-[10px] uppercase tracking-widest text-muted-foreground">
                  <th className="px-6 py-3 font-bold">Order</th>
                  <th className="px-3 py-3 font-bold">Customer</th>
                  <th className="px-3 py-3 font-bold">Total</th>
                  <th className="px-6 py-3 font-bold">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <img src={o.productImage} alt="" className="h-10 w-10 rounded-lg object-cover" />
                        <div className="min-w-0">
                          <p className="font-bold">{o.id}</p>
                          <p className="truncate text-xs text-muted-foreground">{o.product}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <p className="font-semibold">{o.customer}</p>
                      <p className="text-xs text-muted-foreground">{o.placedAt}</p>
                    </td>
                    <td className="px-3 py-3 font-display font-extrabold">₹{o.total}</td>
                    <td className="px-6 py-3">
                      <span className={cn("inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider", orderStatusBadge[o.status])}>
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Best sellers</p>
              <h3 className="font-display text-2xl font-extrabold">Top this week</h3>
            </div>
            <button className="grid h-8 w-8 place-items-center rounded-full hover:bg-muted">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
          <ul className="mt-4 space-y-3">
            {adminProducts.slice(0, 5).map((p, i) => (
              <li key={p.id} className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-muted/40">
                <span className="w-5 font-display text-sm font-extrabold text-muted-foreground">0{i + 1}</span>
                <img src={p.image} alt="" className="h-12 w-12 rounded-xl object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.sold} sold · {p.category}</p>
                </div>
                <p className="font-display font-extrabold">${p.price}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </AdminShell>
  );
}
