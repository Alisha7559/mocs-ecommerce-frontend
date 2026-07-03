import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CreditCard, Search, DollarSign, CheckCircle2, AlertCircle, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";
import { AdminDropdown } from "@/components/admin/AdminShell";

export const Route = createFileRoute("/admin/payments")({
  head: () => ({
    meta: [
      { title: "Payments Log — MOCS Admin" },
    ],
  }),
  component: AdminPayments,
});

function AdminPayments() {
  const [payments, setPayments] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      
      // Fetch audit stats
      const statsRes = await apiClient.payments.getStats().catch(() => null);
      if (statsRes) {
        setStats(statsRes.analytics);
      }

      // Fetch payment transactions list
      const queryStr = `search=${encodeURIComponent(search)}&status=${statusFilter}&page=${page}&limit=10`;
      const res = await apiClient.payments.list(queryStr);
      setPayments(res.items);
      setTotalPages(res.pages);
      setTotalItems(res.total);
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to load payments history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [page, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchPayments();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-foreground flex items-center gap-2">
          <CreditCard className="h-8 w-8 text-primary" /> Payment Audit Log
        </h1>
        <p className="text-muted-foreground text-sm">Audit online checkout transactions, Razorpay IDs, and paid orders.</p>
      </div>

      {/* Audit Stats Panel */}
      {stats && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Settled Revenue</span>
            <p className="font-display text-2xl font-extrabold text-emerald-500 mt-2">₹{stats.totalRevenue.toLocaleString()}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Successful Checkouts</span>
            <p className="font-display text-2xl font-extrabold text-foreground mt-2">{stats.totalOrders - stats.pendingPayments - stats.failedPayments} paid</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Unpaid / Abandoned</span>
            <p className="font-display text-2xl font-extrabold text-amber-500 mt-2">{stats.pendingPayments} orders</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Failed Payments</span>
            <p className="font-display text-2xl font-extrabold text-destructive mt-2">{stats.failedPayments} payments</p>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by customer email, Razorpay order ID, or payment ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <button type="submit" className="rounded-full bg-primary px-5 py-2.5 text-sm font-bold uppercase tracking-wider text-primary-foreground hover:bg-primary-glow">
            Search
          </button>

          <div className="flex gap-2">
            <AdminDropdown
              value={statusFilter}
              onChange={(val) => {
                setStatusFilter(val);
                setPage(1);
              }}
              options={[
                { value: "", label: "All Transactions" },
                { value: "pending", label: "Pending" },
                { value: "paid", label: "Paid" },
                { value: "failed", label: "Failed" },
                { value: "refunded", label: "Refunded" },
              ]}
            />
          </div>
        </form>
      </div>

      {/* Audit Data Table */}
      <div className="rounded-2xl border border-border bg-card shadow-soft overflow-hidden">
        {loading ? (
          <div className="flex py-20 justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-sm">No transaction records found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted text-muted-foreground text-xs font-bold uppercase border-b border-border">
                <tr>
                  <th className="p-4">Customer Details</th>
                  <th className="p-4">Razorpay IDs</th>
                  <th className="p-4">Date & Time</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Settled Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {payments.map((o) => (
                  <tr key={o._id} className="hover:bg-muted/10 transition">
                    <td className="p-4">
                      <p className="font-semibold text-foreground">{o.user?.name || "Guest User"}</p>
                      <p className="text-xs text-muted-foreground">{o.user?.email || "—"}</p>
                    </td>
                    <td className="p-4 font-mono text-xs text-foreground space-y-1">
                      <p className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold uppercase text-muted-foreground bg-muted px-1.5 py-0.5 rounded">Rzp Order</span>
                        <span>{o.razorpayOrderId || "—"}</span>
                      </p>
                      {o.razorpayPaymentId && (
                        <p className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold uppercase text-muted-foreground bg-muted px-1.5 py-0.5 rounded">Rzp PayID</span>
                          <span>{o.razorpayPaymentId}</span>
                        </p>
                      )}
                    </td>
                    <td className="p-4 text-xs font-semibold text-muted-foreground">
                      {new Date(o.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        o.paymentStatus === "paid"
                          ? "bg-success/10 text-success"
                          : o.paymentStatus === "failed"
                            ? "bg-destructive/10 text-destructive"
                            : "bg-amber-500/10 text-amber-500"
                      }`}>
                        {o.paymentStatus}
                      </span>
                    </td>
                    <td className="p-4 text-right font-display font-bold text-foreground">
                      ₹{o.total}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border p-4 bg-muted/5">
            <span className="text-xs text-muted-foreground font-semibold">
              Showing page {page} of {totalPages} ({totalItems} transactions total)
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-xl border border-border bg-background px-4 py-2 text-xs font-bold transition hover:bg-accent disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-xl border border-border bg-background px-4 py-2 text-xs font-bold transition hover:bg-accent disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
