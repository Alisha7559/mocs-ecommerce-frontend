import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { AdminShell } from "@/components/admin/AdminShell";
import { salesByDay as mockSalesByDay } from "@/lib/admin-data";
import { apiClient } from "@/lib/api";

export const Route = createFileRoute("/admin/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — MOCS Admin" },
      { name: "description", content: "Deep dive into MOCS conversion, traffic and category performance." },
    ],
  }),
  component: AnalyticsPage,
});

const defaultCategoryRevenue = [
  { name: "Men", value: 28400 },
  { name: "Women", value: 19200 },
  { name: "Kids", value: 4170 },
];

const conversion = [
  { d: "W1", v: 2.4 },
  { d: "W2", v: 2.7 },
  { d: "W3", v: 3.1 },
  { d: "W4", v: 3.4 },
  { d: "W5", v: 3.2 },
  { d: "W6", v: 3.8 },
  { d: "W7", v: 4.1 },
];

function AnalyticsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await apiClient.payments.getStats();
        setStats(res.analytics);
      } catch (err) {
        console.error("Failed to load analytics data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const categoryRevenue = stats?.categoryRevenue && stats.categoryRevenue.reduce((sum: number, item: any) => sum + item.value, 0) > 0
    ? stats.categoryRevenue
    : defaultCategoryRevenue;

  const salesByDay = stats?.salesByDay && stats.salesByDay.reduce((sum: number, item: any) => sum + item.orders, 0) > 0
    ? stats.salesByDay
    : mockSalesByDay;

  return (
    <AdminShell title="Analytics" subtitle="The numbers behind the MOCS momentum.">
      {loading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)] text-left">
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">By category</p>
              <h3 className="font-display text-2xl font-extrabold text-foreground">Revenue split</h3>
              <div className="mt-4 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryRevenue} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                    <CartesianGrid stroke="oklch(0.92 0.002 286)" strokeDasharray="4 4" vertical={false} />
                    <XAxis dataKey="name" stroke="oklch(0.50 0.006 286)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="oklch(0.50 0.006 286)" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.92 0.002 286)", backgroundColor: "var(--color-card)", color: "var(--color-foreground)" }} />
                    <Bar dataKey="value" fill="oklch(0.702 0.21 47)" radius={[10, 10, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)] text-left">
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Conversion</p>
              <h3 className="font-display text-2xl font-extrabold text-foreground">Last 7 weeks</h3>
              <div className="mt-4 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={conversion} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid stroke="oklch(0.92 0.002 286)" strokeDasharray="4 4" vertical={false} />
                    <XAxis dataKey="d" stroke="oklch(0.50 0.006 286)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="oklch(0.50 0.006 286)" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.92 0.002 286)", backgroundColor: "var(--color-card)", color: "var(--color-foreground)" }} />
                    <Line type="monotone" dataKey="v" stroke="oklch(0.18 0.004 286)" strokeWidth={3} dot={{ r: 5, fill: "oklch(0.702 0.21 47)" }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)] text-left">
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Daily orders</p>
            <h3 className="font-display text-2xl font-extrabold text-foreground">Order volume</h3>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesByDay} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="oklch(0.92 0.002 286)" strokeDasharray="4 4" vertical={false} />
                  <XAxis dataKey="d" stroke="oklch(0.50 0.006 286)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="oklch(0.50 0.006 286)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.92 0.002 286)", backgroundColor: "var(--color-card)", color: "var(--color-foreground)" }} />
                  <Bar dataKey="orders" fill="oklch(0.18 0.004 286)" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
