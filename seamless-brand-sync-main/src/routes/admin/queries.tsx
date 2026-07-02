import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Inbox, Search, Eye, X, CheckCircle, HelpCircle, AlertCircle, Trash2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";
import { AdminDropdown } from "@/components/admin/AdminShell";

export const Route = createFileRoute("/admin/queries")({
  head: () => ({
    meta: [
      { title: "Support Inbox — MOCS Admin" },
    ],
  }),
  component: AdminQueries,
});

function AdminQueries() {
  const [queries, setQueries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showDeleted, setShowDeleted] = useState("false");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Detail / edit notes state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedQuery, setSelectedQuery] = useState<any>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [queryStatus, setQueryStatus] = useState("pending");
  const [saving, setSaving] = useState(false);

  const fetchQueries = async () => {
    try {
      setLoading(true);
      const queryStr = `search=${encodeURIComponent(search)}&status=${statusFilter}&showDeleted=${showDeleted}&page=${page}&limit=10`;
      const res = await apiClient.queries.list(queryStr);
      setQueries(res.items);
      setTotalPages(res.pages);
      setTotalItems(res.total);
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to load customer queries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueries();
  }, [page, statusFilter, showDeleted]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchQueries();
  };

  const openQueryDetail = (q: any) => {
    setSelectedQuery(q);
    setAdminNotes(q.adminNotes || "");
    setQueryStatus(q.status);
    setModalOpen(true);
  };

  const handleSaveNotes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuery) return;
    
    setSaving(true);
    try {
      const updated = await apiClient.queries.update(selectedQuery._id, {
        status: queryStatus,
        adminNotes,
      });
      toast.success("Query updated successfully");
      setModalOpen(false);
      fetchQueries();
    } catch (err: any) {
      toast.error(err?.message || "Failed to update query notes");
    } finally {
      setSaving(false);
    }
  };

  const handleSoftDelete = async (q: any) => {
    try {
      await apiClient.queries.delete(q._id);
      toast.success("Query soft-deleted");
      if (modalOpen) setModalOpen(false);
      fetchQueries();
    } catch (err: any) {
      toast.error("Failed to delete support query");
    }
  };

  const handleRestoreQuery = async (q: any) => {
    try {
      await apiClient.queries.restore(q._id);
      toast.success("Query restored successfully");
      if (modalOpen) setModalOpen(false);
      fetchQueries();
    } catch (err: any) {
      toast.error(err?.message || "Failed to restore support query");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-foreground flex items-center gap-2">
          <Inbox className="h-8 w-8 text-primary" /> Support Inbox
        </h1>
        <p className="text-muted-foreground text-sm">Respond to customer feedback, queries, and store inquiries.</p>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by customer name, email or message text..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <button type="submit" className="rounded-full bg-primary px-5 py-2.5 text-sm font-bold uppercase tracking-wider text-primary-foreground hover:bg-primary-glow">
            Search
          </button>

          <div className="flex flex-wrap gap-2 items-center">
            <AdminDropdown
              value={statusFilter}
              onChange={(val) => {
                setStatusFilter(val);
                setPage(1);
              }}
              options={[
                { value: "", label: "All Statuses" },
                { value: "pending", label: "Pending" },
                { value: "resolved", label: "Resolved" },
                { value: "ignored", label: "Ignored" },
              ]}
            />

            <AdminDropdown
              value={showDeleted}
              onChange={(val) => {
                setShowDeleted(val);
                setPage(1);
              }}
              options={[
                { value: "false", label: "Active Queries" },
                { value: "true", label: "Deleted Queries" },
                { value: "all", label: "All Queries" },
              ]}
            />
          </div>
        </form>
      </div>

      {/* Inquiries Table */}
      <div className="rounded-2xl border border-border bg-card shadow-soft overflow-hidden">
        {loading ? (
          <div className="flex py-20 justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : queries.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-sm">No support queries found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted text-muted-foreground text-xs font-bold uppercase border-b border-border">
                <tr>
                  <th className="p-4">Customer Details</th>
                  <th className="p-4">Subject</th>
                  <th className="p-4">Created Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {queries.map((q) => (
                  <tr key={q._id} className={q.isDeleted ? "opacity-60 bg-muted/10" : "hover:bg-muted/10 transition"}>
                    <td className="p-4">
                      <p className="font-semibold text-foreground flex items-center gap-1.5">
                        {q.name}
                        {q.isDeleted && (
                          <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[8px] font-bold uppercase text-destructive tracking-wider">
                            deleted
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">{q.email}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-medium text-foreground truncate max-w-[200px]">{q.subject}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[240px]">{q.message}</p>
                    </td>
                    <td className="p-4 text-xs font-semibold text-muted-foreground">
                      {new Date(q.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        q.status === "resolved"
                          ? "bg-success/10 text-success"
                          : q.status === "ignored"
                            ? "bg-muted text-muted-foreground"
                            : "bg-amber-500/10 text-amber-500 animate-pulse"
                      }`}>
                        {q.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex gap-1.5 justify-end">
                        <button
                          onClick={() => openQueryDetail(q)}
                          className="rounded-xl border border-border p-2 text-muted-foreground transition hover:border-primary hover:text-primary flex items-center gap-1"
                          title="View In Detail"
                        >
                          <Eye className="h-4 w-4" /> <span className="text-xs font-bold uppercase">View</span>
                        </button>
                        {q.isDeleted ? (
                          <button
                            onClick={() => handleRestoreQuery(q)}
                            className="rounded-xl border border-border p-2 text-emerald-500 transition hover:bg-emerald-500/10 hover:border-emerald-500"
                            title="Restore Query"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleSoftDelete(q)}
                            className="rounded-xl border border-border p-2 text-destructive transition hover:bg-destructive/10 hover:border-destructive"
                            title="Delete Inquiry"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
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
              Showing page {page} of {totalPages} ({totalItems} support queries total)
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

      {/* Query Detail Modal */}
      {modalOpen && selectedQuery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-secondary/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-card animate-in fade-in zoom-in-95 duration-200">
            <div className="mb-4 flex items-center justify-between border-b border-border pb-4">
              <div>
                <h3 className="font-display text-lg font-bold">Inquiry Details</h3>
                <p className="text-xs text-muted-foreground">From {selectedQuery.name} ({selectedQuery.email})</p>
              </div>
              <button onClick={() => setModalOpen(false)} className="rounded-full p-1.5 hover:bg-accent">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Subject</span>
                <p className="font-bold text-foreground mt-0.5">{selectedQuery.subject}</p>
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Message Body</span>
                <div className="mt-1 rounded-2xl bg-muted/30 border border-border p-4 text-sm text-foreground overflow-y-auto max-h-[160px] whitespace-pre-wrap">
                  {selectedQuery.message}
                </div>
              </div>

              <form onSubmit={handleSaveNotes} className="space-y-4 pt-4 border-t border-border">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</label>
                    <AdminDropdown
                      disabled={selectedQuery.isDeleted}
                      value={queryStatus}
                      onChange={setQueryStatus}
                      className="w-full"
                      options={[
                        { value: "pending", label: "Pending" },
                        { value: "resolved", label: "Resolved" },
                        { value: "ignored", label: "Ignored" },
                      ]}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Admin Response Notes</label>
                  <textarea
                    disabled={selectedQuery.isDeleted}
                    rows={3}
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className="input-field resize-none disabled:opacity-75"
                    placeholder="Write a response log, call notes, or follow up details here..."
                  />
                </div>

                <div className="flex gap-2.5 pt-2">
                  {selectedQuery.isDeleted ? (
                    <button
                      type="button"
                      onClick={() => handleRestoreQuery(selectedQuery)}
                      className="w-full rounded-full bg-emerald-500 py-3.5 text-sm font-bold uppercase tracking-wider text-white transition hover:bg-emerald-600"
                    >
                      Restore Inquiry
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => handleSoftDelete(selectedQuery)}
                        className="rounded-full bg-destructive/10 px-5 text-sm font-bold uppercase tracking-wider text-destructive transition hover:bg-destructive/20"
                      >
                        Delete Inquiry
                      </button>
                      
                      <button
                        type="submit"
                        disabled={saving}
                        className="flex-1 rounded-full bg-primary py-3.5 text-sm font-bold uppercase tracking-wider text-primary-foreground transition hover:bg-primary-glow disabled:opacity-60"
                      >
                        {saving ? "Saving..." : "Update Inquiry log"}
                      </button>
                    </>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
