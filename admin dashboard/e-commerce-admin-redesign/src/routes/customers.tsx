import { createFileRoute } from "@tanstack/react-router";
import { Mail, Search } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { adminCustomers } from "@/lib/admin-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/customers")({
  head: () => ({
    meta: [
      { title: "Customers — MOCS Admin" },
      { name: "description", content: "MOCS shoppers, lifetime value and tier segmentation." },
    ],
  }),
  component: CustomersPage,
});

const tierBadge: Record<string, string> = {
  VIP: "bg-primary/15 text-primary",
  Loyal: "bg-secondary/10 text-secondary",
  New: "bg-muted text-muted-foreground",
};

function CustomersPage() {
  return (
    <AdminShell title="Customers" subtitle="The people lacing up MOCS every morning.">
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { k: "Active shoppers", v: "8,412", s: "+312 this week" },
          { k: "Avg. lifetime value", v: "$486", s: "+$24 vs Q2" },
          { k: "Repeat rate", v: "38%", s: "Trending up" },
        ].map((s) => (
          <div key={s.k} className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{s.k}</p>
            <p className="mt-2 font-display text-3xl font-extrabold">{s.v}</p>
            <p className="mt-1 text-xs text-muted-foreground">{s.s}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Search customers"
            className="h-11 w-full rounded-full border border-border bg-card pl-9 pr-4 text-sm font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <button className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-bold uppercase tracking-wider text-primary-foreground">
          <Mail className="h-4 w-4" /> Broadcast
        </button>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-soft)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-left text-[10px] uppercase tracking-widest text-muted-foreground">
              <th className="px-6 py-3 font-bold">Customer</th>
              <th className="px-3 py-3 font-bold">Orders</th>
              <th className="px-3 py-3 font-bold">Spent</th>
              <th className="px-3 py-3 font-bold">City</th>
              <th className="px-3 py-3 font-bold">Joined</th>
              <th className="px-6 py-3 font-bold">Tier</th>
            </tr>
          </thead>
          <tbody>
            {adminCustomers.map((c) => (
              <tr key={c.email} className="border-b border-border last:border-0 hover:bg-muted/30">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-secondary font-display text-xs font-bold text-secondary-foreground">
                      {c.name.split(" ").map((s) => s[0]).join("").slice(0, 2)}
                    </span>
                    <div>
                      <p className="font-bold">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-4 font-semibold">{c.orders}</td>
                <td className="px-3 py-4 font-display font-extrabold">${c.spent}</td>
                <td className="px-3 py-4 text-muted-foreground">{c.city}</td>
                <td className="px-3 py-4 text-muted-foreground">{c.joined}</td>
                <td className="px-6 py-4">
                  <span className={cn("inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider", tierBadge[c.tier])}>
                    {c.tier}
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
