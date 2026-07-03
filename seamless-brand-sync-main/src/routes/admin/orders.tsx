import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FileText, Search, Eye, Edit3, X, Truck, Check, CornerUpLeft, Clock, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";
import { getImageUrl } from "@/lib/utils";
import { AdminDropdown } from "@/components/admin/AdminShell";

export const Route = createFileRoute("/admin/orders")({
  head: () => ({
    meta: [
      { title: "Manage Orders — MOCS Admin" },
    ],
  }),
  component: AdminOrders,
});

function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [payFilter, setPayFilter] = useState("");
  const [showDeleted, setShowDeleted] = useState("false");
  const [page, setPage] = useState(1);
  const limit = 10;
  
  // Detailed modal state
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, payFilter, showDeleted, search]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await apiClient.orders.listAll(`showDeleted=${showDeleted}`);
      
      let filtered = [...res];

      if (statusFilter) {
        filtered = filtered.filter(o => {
          const s = o.status.toUpperCase();
          if (statusFilter === "CONFIRMED") return s === "CONFIRMED" || s === "PAID";
          if (statusFilter === "RETURNED") return s === "RETURNED" || s === "RETURN_REQUESTED";
          return s === statusFilter;
        });
      }

      if (payFilter) {
        filtered = filtered.filter(o => o.paymentStatus === payFilter);
      }

      if (search) {
        const query = search.toLowerCase();
        filtered = filtered.filter(o => 
          (o.razorpayOrderId && o.razorpayOrderId.toLowerCase().includes(query)) ||
          o._id.toLowerCase().includes(query) ||
          (o.user && o.user.name.toLowerCase().includes(query)) ||
          (o.user && o.user.email.toLowerCase().includes(query))
        );
      }

      setOrders(filtered);
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, payFilter, showDeleted]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders();
  };

  const openDetailModal = (order: any) => {
    setSelectedOrder(order);
    setDetailModalOpen(true);
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setUpdatingStatus(true);
    try {
      const updated = await apiClient.orders.updateStatus(orderId, newStatus);
      toast.success(`Order status updated to: ${newStatus}`);
      setSelectedOrder(updated);
      fetchOrders();
    } catch (err: any) {
      toast.error(err?.message || "Failed to update order status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSoftDelete = async (orderId: string) => {
    try {
      await apiClient.orders.delete(orderId);
      toast.success("Order archived successfully");
      setDetailModalOpen(false);
      fetchOrders();
    } catch (err: any) {
      toast.error(err?.message || "Failed to archive order");
    }
  };

  const handleRestore = async (orderId: string) => {
    try {
      await apiClient.orders.restore(orderId);
      toast.success("Order restored successfully");
      setDetailModalOpen(false);
      fetchOrders();
    } catch (err: any) {
      toast.error(err?.message || "Failed to restore order");
    }
  };

  const totalPages = Math.ceil(orders.length / limit);
  const paginatedOrders = orders.slice((page - 1) * limit, page * limit);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-foreground flex items-center gap-2">
          <FileText className="h-8 w-8 text-primary" /> Order Management
        </h1>
        <p className="text-muted-foreground text-sm">Fulfill orders, track payments, and review deliveries.</p>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by Order ID, Customer name or email..."
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
              onChange={setStatusFilter}
              options={[
                { value: "", label: "Fulfillment Status" },
                { value: "PENDING", label: "PENDING" },
                { value: "CONFIRMED", label: "CONFIRMED" },
                { value: "PROCESSING", label: "PROCESSING" },
                { value: "SHIPPED", label: "SHIPPED" },
                { value: "OUT_FOR_DELIVERY", label: "OUT_FOR_DELIVERY" },
                { value: "DELIVERED", label: "DELIVERED" },
                { value: "CANCELLED", label: "CANCELLED" },
                { value: "RETURNED", label: "RETURNED" },
              ]}
            />

            <AdminDropdown
              value={payFilter}
              onChange={setPayFilter}
              options={[
                { value: "", label: "Payment Status" },
                { value: "pending", label: "Pending" },
                { value: "paid", label: "Paid" },
                { value: "failed", label: "Failed" },
                { value: "refunded", label: "Refunded" },
              ]}
            />

            <AdminDropdown
              value={showDeleted}
              onChange={setShowDeleted}
              options={[
                { value: "false", label: "Active Orders" },
                { value: "true", label: "Archived Orders" },
                { value: "all", label: "All Orders" },
              ]}
            />
          </div>
        </form>
      </div>

      {/* Orders List Table */}
      <div className="rounded-2xl border border-border bg-card shadow-soft overflow-hidden">
        {loading ? (
          <div className="flex py-20 justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-sm">No customer orders found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted text-muted-foreground text-xs font-bold uppercase border-b border-border">
                <tr>
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Fulfillment</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4">Order Total</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedOrders.map((o) => (
                  <tr key={o._id} className={o.isDeleted ? "opacity-60 bg-muted/10" : "hover:bg-muted/10 transition"}>
                    <td className="p-4 font-mono text-xs font-bold text-foreground flex items-center gap-1.5 flex-wrap">
                      <span>{o.razorpayOrderId ? o.razorpayOrderId.slice(-8).toUpperCase() : o._id.slice(-8).toUpperCase()}</span>
                      {o.isDeleted && (
                        <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[8px] font-bold uppercase text-destructive tracking-wider">
                          archived
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-foreground">{o.user?.name || "Guest User"}</p>
                      <p className="text-xs text-muted-foreground">{o.user?.email || "—"}</p>
                    </td>
                    <td className="p-4">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        o.status.toUpperCase() === "DELIVERED"
                          ? "bg-success/10 text-success"
                          : o.status.toUpperCase() === "CANCELLED"
                            ? "bg-destructive/10 text-destructive"
                            : o.status.toUpperCase() === "SHIPPED"
                              ? "bg-blue-500/10 text-blue-500"
                              : "bg-amber-500/10 text-amber-500"
                      }`}>
                        {o.status.toUpperCase() === "PAID" ? "CONFIRMED" : o.status.toUpperCase().replace("_", " ")}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        o.paymentStatus === "paid"
                          ? "bg-success/15 text-success"
                          : o.paymentStatus === "failed"
                            ? "bg-destructive/15 text-destructive"
                            : "bg-amber-500/15 text-amber-500"
                      }`}>
                        {o.paymentStatus}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-foreground">
                      ₹{o.total}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => openDetailModal(o)}
                        className="rounded-xl border border-border p-2 text-muted-foreground transition hover:border-primary hover:text-primary flex items-center gap-1.5 ml-auto"
                      >
                        <Eye className="h-4 w-4" /> <span className="text-xs font-bold uppercase">Details</span>
                      </button>
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
              Showing page {page} of {totalPages} ({orders.length} orders total)
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

      {/* Order Details Modal Overlay */}
      {detailModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-start lg:items-center justify-center bg-secondary/60 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-3xl rounded-3xl border border-border bg-card p-6 shadow-card animate-in fade-in zoom-in-95 duration-200 my-8">
            <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
              <div>
                <h3 className="font-display text-xl font-bold">
                  Order Details: {selectedOrder.razorpayOrderId ? selectedOrder.razorpayOrderId.slice(-8).toUpperCase() : selectedOrder._id.slice(-8).toUpperCase()}
                </h3>
                <p className="text-xs text-muted-foreground">Placed on {new Date(selectedOrder.createdAt).toLocaleString()}</p>
              </div>
              <button onClick={() => setDetailModalOpen(false)} className="rounded-full p-1.5 hover:bg-accent">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Order Items Panel */}
              <div className="space-y-4">
                <h4 className="font-display text-sm font-bold uppercase tracking-wider text-primary">Purchased Items</h4>
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 no-scrollbar">
                  {selectedOrder.items.map((item: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 rounded-2xl border border-border bg-muted/10 p-3">
                      <img
                        src={getImageUrl(item.image)}
                        alt={item.name}
                        className="h-12 w-12 rounded-xl object-cover bg-muted border border-border"
                        onError={(e) => {
                          e.currentTarget.src = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=120";
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-foreground">{item.name}</p>
                        <p className="text-xs text-muted-foreground">US {item.size} · Color: {item.color} · Qty {item.qty}</p>
                      </div>
                      <span className="font-semibold text-sm text-foreground">₹{item.price * item.qty}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border pt-4 text-sm space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">₹{selectedOrder.subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium">{selectedOrder.shipping === 0 ? "Free" : `₹${selectedOrder.shipping}`}</span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-2 font-display text-lg font-bold">
                    <span>Total Amount</span>
                    <span className="text-primary">₹{selectedOrder.total}</span>
                  </div>
                </div>
              </div>

              {/* Delivery and Status Update Panel */}
              <div className="space-y-6">
                <div>
                  <h4 className="font-display text-sm font-bold uppercase tracking-wider text-primary mb-3">Customer Shipping Details</h4>
                  <div className="rounded-2xl border border-border bg-muted/10 p-4 text-sm space-y-2">
                    <p><strong>Name:</strong> {selectedOrder.user?.name || selectedOrder.shippingAddress?.fullName || "Guest User"}</p>
                    <p><strong>Email:</strong> {selectedOrder.user?.email || "—"}</p>
                    {selectedOrder.shippingAddress && (
                      <p>
                        <strong>Address:</strong><br />
                        {selectedOrder.shippingAddress.line1}, {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.postalCode}, {selectedOrder.shippingAddress.country}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-display text-sm font-bold uppercase tracking-wider text-primary mb-3">Fulfillment & Payment Status</h4>
                  <div className="rounded-2xl border border-border bg-muted/10 p-4 text-sm space-y-3">
                    <div className="flex justify-between items-center">
                      <span><strong>Fulfillment:</strong></span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        selectedOrder.status === "delivered" ? "bg-success/10 text-success" : selectedOrder.status === "cancelled" ? "bg-destructive/10 text-destructive" : "bg-amber-500/10 text-amber-500"
                      }`}>
                        {selectedOrder.status}
                      </span>
                    </div>

                    <div className="flex justify-between items-center border-t border-border/40 pt-2.5">
                      <span><strong>Payment Status:</strong></span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        selectedOrder.paymentStatus === "paid" ? "bg-success/15 text-success" : selectedOrder.paymentStatus === "failed" ? "bg-destructive/15 text-destructive" : "bg-amber-500/15 text-amber-500"
                      }`}>
                        {selectedOrder.paymentStatus}
                      </span>
                    </div>

                    {selectedOrder.razorpayPaymentId && (
                      <div className="border-t border-border/40 pt-2.5 space-y-1 font-mono text-xs">
                        <p className="truncate"><strong>Payment ID:</strong> {selectedOrder.razorpayPaymentId}</p>
                        <p className="truncate"><strong>Razorpay Order:</strong> {selectedOrder.razorpayOrderId}</p>
                      </div>
                    )}

                    {selectedOrder.cancelReason && (
                      <div className="border-t border-border/40 pt-2.5 text-xs text-destructive font-semibold">
                        <strong>Cancellation Issue:</strong> {selectedOrder.cancelReason}
                      </div>
                    )}

                    {selectedOrder.returnReason && (
                      <div className="border-t border-border/40 pt-2.5 text-xs text-primary font-semibold">
                        <strong>Return Issue / Reason:</strong> {selectedOrder.returnReason}
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Update Operations */}
                <div>
                  <h4 className="font-display text-sm font-bold uppercase tracking-wider text-primary mb-3">
                    {selectedOrder.isDeleted ? "Restore Order Account" : "Fulfillment & Archival Actions"}
                  </h4>
                  {selectedOrder.isDeleted ? (
                    <button
                      onClick={() => handleRestore(selectedOrder._id)}
                      className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500 py-3 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-emerald-600"
                    >
                      <RotateCcw className="h-4.5 w-4.5" /> Restore Archived Order
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleUpdateStatus(selectedOrder._id, "shipped")}
                          disabled={updatingStatus || selectedOrder.status === "shipped" || selectedOrder.status === "delivered" || selectedOrder.status === "cancelled"}
                          className="flex items-center gap-1.5 rounded-xl border border-border bg-background px-4 py-2.5 text-xs font-bold text-blue-500 transition hover:bg-blue-500/10 hover:border-blue-500 disabled:opacity-50"
                        >
                          <Truck className="h-4.5 w-4.5" /> Ship Order
                        </button>
                        
                        <button
                          onClick={() => handleUpdateStatus(selectedOrder._id, "delivered")}
                          disabled={updatingStatus || selectedOrder.status === "delivered" || selectedOrder.status === "cancelled"}
                          className="flex items-center gap-1.5 rounded-xl border border-border bg-background px-4 py-2.5 text-xs font-bold text-success transition hover:bg-success/10 hover:border-success disabled:opacity-50"
                        >
                          <Check className="h-4.5 w-4.5" /> Deliver Order
                        </button>

                        <button
                          onClick={() => handleUpdateStatus(selectedOrder._id, "cancelled")}
                          disabled={updatingStatus || selectedOrder.status === "delivered" || selectedOrder.status === "cancelled" || selectedOrder.status === "returned"}
                          className="flex items-center gap-1.5 rounded-xl border border-border bg-background px-4 py-2.5 text-xs font-bold text-destructive transition hover:bg-destructive/10 hover:border-destructive disabled:opacity-50"
                        >
                          <CornerUpLeft className="h-4.5 w-4.5" /> Cancel Order
                        </button>

                        <button
                          onClick={() => handleUpdateStatus(selectedOrder._id, "returned")}
                          disabled={updatingStatus || selectedOrder.status !== "return_requested"}
                          className="flex items-center gap-1.5 rounded-xl border border-border bg-background px-4 py-2.5 text-xs font-bold text-amber-500 transition hover:bg-amber-500/10 hover:border-amber-500 disabled:opacity-50"
                        >
                          <RotateCcw className="h-4.5 w-4.5" /> Approve Return
                        </button>
                      </div>
                      <button
                        onClick={() => handleSoftDelete(selectedOrder._id)}
                        className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-destructive/10 py-3 text-xs font-bold uppercase tracking-wider text-destructive transition hover:bg-destructive/20"
                      >
                        Archive / Soft Delete Order
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
