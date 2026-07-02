import { createFileRoute } from "@tanstack/react-router";
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
import { salesByDay } from "@/lib/admin-data";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — MOCS Admin" },
      { name: "description", content: "Deep dive into MOCS conversion, traffic and category performance." },
    ],
  }),
  component: AnalyticsPage,
});

const categoryRevenue = [
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
  return (
    <AdminShell title="Analytics" subtitle="The numbers behind the MOCS momentum.">
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { k: "Sessions", v: "184,205", s: "+18.2%" },
          { k: "Conversion", v: "4.1%", s: "+0.6pt" },
          { k: "Cart abandon", v: "62.4%", s: "-3.1pt" },
          { k: "Returns", v: "0.8%", s: "Healthy" },
        ].map((s) => (
          <div key={s.k} className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{s.k}</p>
            <p className="mt-2 font-display text-3xl font-extrabold">{s.v}</p>
            <p className="mt-1 text-xs font-semibold text-primary">{s.s}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">By category</p>
          <h3 className="font-display text-2xl font-extrabold">Revenue split</h3>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryRevenue} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                <CartesianGrid stroke="oklch(0.92 0.002 286)" strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="name" stroke="oklch(0.50 0.006 286)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.50 0.006 286)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.92 0.002 286)" }} />
                <Bar dataKey="value" fill="oklch(0.702 0.21 47)" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Conversion</p>
          <h3 className="font-display text-2xl font-extrabold">Last 7 weeks</h3>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={conversion} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="oklch(0.92 0.002 286)" strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="d" stroke="oklch(0.50 0.006 286)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.50 0.006 286)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.92 0.002 286)" }} />
                <Line type="monotone" dataKey="v" stroke="oklch(0.18 0.004 286)" strokeWidth={3} dot={{ r: 5, fill: "oklch(0.702 0.21 47)" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Daily orders</p>
        <h3 className="font-display text-2xl font-extrabold">Order volume</h3>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={salesByDay} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="oklch(0.92 0.002 286)" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="d" stroke="oklch(0.50 0.006 286)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="oklch(0.50 0.006 286)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.92 0.002 286)" }} />
              <Bar dataKey="orders" fill="oklch(0.18 0.004 286)" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </AdminShell>
  );
}
