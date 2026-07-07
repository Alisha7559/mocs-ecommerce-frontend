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
  const [methodFilter, setMethodFilter] = useState("");
  const [showDeleted, setShowDeleted] = useState("false");
  const [page, setPage] = useState(1);
  const limit = 10;
  
  // Detailed modal state
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, payFilter, methodFilter, showDeleted, search]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await apiClient.orders.listAll(`showDeleted=${showDeleted}`);
      
      let filtered = [...res];

      if (statusFilter) {
        filtered = filtered.filter(o => (o.orderStatus || o.status || "").toLowerCase() === statusFilter.toLowerCase());
      }

      if (payFilter) {
        filtered = filtered.filter(o => (o.paymentStatus || "").toLowerCase() === payFilter.toLowerCase());
      }

      if (methodFilter) {
        filtered = filtered.filter(o => (o.paymentMethod || "").toLowerCase() === methodFilter.toLowerCase());
      }

      if (search) {
        const query = search.toLowerCase();
        filtered = filtered.filter(o => 
          (o.razorpayOrderId && o.razorpayOrderId.toLowerCase().includes(query)) ||
          o._id.toLowerCase().includes(query) ||
          (o.user && o.user.name.toLowerCase().includes(query)) ||
          (o.user && o.user.email.toLowerCase().includes(query)) ||
          (o.shippingAddress && o.shippingAddress.name && o.shippingAddress.name.toLowerCase().includes(query))
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
  }, [statusFilter, payFilter, methodFilter, showDeleted]);

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

  const handleUpdatePaymentStatus = async (orderId: string, newPayStatus: string) => {
    setUpdatingStatus(true);
    try {
      const updated = await apiClient.orders.updatePaymentStatus(orderId, newPayStatus);
      toast.success(`Payment status updated to: ${newPayStatus}`);
      setSelectedOrder(updated);
      fetchOrders();
    } catch (err: any) {
      toast.error(err?.message || "Failed to update payment status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSoftDelete = async (orderId: string) => {
    if (!window.confirm("Are you sure you want to archive/soft-delete this order?")) return;
    try {
      await apiClient.orders.delete(orderId);
      toast.success("Order archived successfully");
      setDetailModalOpen(false);
      fetchOrders();
    } catch (err) {
      toast.error("Failed to delete order");
    }
  };

  const handleRestore = async (orderId: string) => {
    try {
      await apiClient.orders.restore(orderId);
      toast.success("Order restored successfully");
      setDetailModalOpen(false);
      fetchOrders();
    } catch (err) {
      toast.error("Failed to restore order");
    }
  };

  // Pagination index slices
  const totalPages = Math.ceil(orders.length / limit);
  const paginatedOrders = orders.slice((page - 1) * limit, page * limit);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-foreground flex items-center gap-2">
          <FileText className="h-8 w-8 text-primary" /> Manage Orders
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
                { value: "Placed", label: "Placed" },
                { value: "Confirmed", label: "Confirmed" },
                { value: "Processing", label: "Processing" },
                { value: "Shipped", label: "Shipped" },
                { value: "Out for Delivery", label: "Out for Delivery" },
                { value: "Delivered", label: "Delivered" },
                { value: "Cancelled", label: "Cancelled" },
                { value: "Returned", label: "Returned" },
              ]}
            />

            <AdminDropdown
              value={payFilter}
              onChange={setPayFilter}
              options={[
                { value: "", label: "Payment Status" },
                { value: "Pending", label: "Pending" },
                { value: "Paid", label: "Paid" },
                { value: "Failed", label: "Failed" },
                { value: "Refunded", label: "Refunded" },
              ]}
            />

            <AdminDropdown
              value={methodFilter}
              onChange={setMethodFilter}
              options={[
                { value: "", label: "Payment Method" },
                { value: "COD", label: "COD" },
                { value: "Online", label: "Online" },
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
                    <td className="p-4">
                      <p className="font-semibold text-foreground">
                        {o.razorpayOrderId ? o.razorpayOrderId.slice(-8).toUpperCase() : o._id.slice(-8).toUpperCase()}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{new Date(o.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-foreground">{o.shippingAddress?.name || o.user?.name || "Guest User"}</p>
                      <p className="text-xs text-muted-foreground">{o.shippingAddress?.phone || "—"}</p>
                    </td>
                    <td className="p-4">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                        o.orderStatus === "Delivered" || o.status === "delivered" ? "bg-emerald-500/10 text-emerald-500" : o.orderStatus === "Cancelled" || o.status === "cancelled" ? "bg-destructive/10 text-destructive" : "bg-amber-500/10 text-amber-500 animate-pulse"
                      }`}>
                        {o.orderStatus || o.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-0.5">
                        <span className={`inline-block w-fit rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                          o.paymentStatus === "Paid" || o.paymentStatus === "paid" ? "bg-emerald-500/10 text-emerald-500" : o.paymentStatus === "Failed" || o.paymentStatus === "failed" ? "bg-destructive/10 text-destructive" : "bg-amber-500/10 text-amber-500"
                        }`}>
                          {o.paymentStatus}
                        </span>
                        <span className="text-[9px] font-bold text-muted-foreground uppercase">{o.paymentMethod}</span>
                      </div>
                    </td>
                    <td className="p-4 font-display text-sm font-bold text-foreground">
                      ₹{o.totalAmount || o.total}
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

            <div className="grid gap-6 md:grid-cols-2 text-left">
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
                    <span className="text-primary">₹{selectedOrder.totalAmount || selectedOrder.total}</span>
                  </div>
                </div>
              </div>

              {/* Delivery and Status Update Panel */}
              <div className="space-y-6">
                <div>
                  <h4 className="font-display text-sm font-bold uppercase tracking-wider text-primary mb-3">Customer Shipping Details</h4>
                  <div className="rounded-2xl border border-border bg-muted/10 p-4 text-sm space-y-2">
                    <p><strong>Name:</strong> {selectedOrder.shippingAddress?.name || selectedOrder.user?.name || "Guest"}</p>
                    <p><strong>Phone:</strong> {selectedOrder.shippingAddress?.phone || "—"}</p>
                    <p><strong>Email:</strong> {selectedOrder.shippingAddress?.email || selectedOrder.user?.email || "—"}</p>
                    <p>
                      <strong>Address:</strong><br />
                      {selectedOrder.shippingAddress?.address || selectedOrder.shippingAddress?.line1}<br />
                      {selectedOrder.shippingAddress?.city}
                      {selectedOrder.shippingAddress?.state ? `, ${selectedOrder.shippingAddress?.state}` : ""}
                      {selectedOrder.shippingAddress?.pincode ? ` - ${selectedOrder.shippingAddress?.pincode}` : selectedOrder.shippingAddress?.postalCode ? ` - ${selectedOrder.shippingAddress?.postalCode}` : ""}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-display text-sm font-bold uppercase tracking-wider text-primary mb-3">Order Information</h4>
                  <div className="rounded-2xl border border-border bg-muted/10 p-4 text-sm space-y-3">
                    <div className="flex justify-between items-center">
                      <span><strong>Fulfillment:</strong></span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        selectedOrder.orderStatus === "Delivered" ? "bg-emerald-500/10 text-emerald-500" : selectedOrder.orderStatus === "Cancelled" ? "bg-destructive/10 text-destructive" : "bg-amber-500/10 text-amber-500"
                      }`}>
                        {selectedOrder.orderStatus || selectedOrder.status}
                      </span>
                    </div>

                    <div className="flex justify-between items-center border-t border-border/40 pt-2.5">
                      <span><strong>Payment Status:</strong></span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        selectedOrder.paymentStatus === "Paid" ? "bg-emerald-500/15 text-emerald-500" : selectedOrder.paymentStatus === "Failed" ? "bg-destructive/15 text-destructive" : "bg-amber-500/15 text-amber-500"
                      }`}>
                        {selectedOrder.paymentStatus}
                      </span>
                    </div>

                    {selectedOrder.paymentMethod && (
                      <div className="flex justify-between items-center border-t border-border/40 pt-2.5">
                        <span><strong>Method:</strong></span>
                        <span className="font-bold text-foreground text-xs uppercase">{selectedOrder.paymentMethod}</span>
                      </div>
                    )}

                    {selectedOrder.transactionId && (
                      <div className="border-t border-border/40 pt-2.5 font-mono text-[10px] space-y-0.5 truncate">
                        <p className="truncate"><strong>Transaction ID:</strong> {selectedOrder.transactionId}</p>
                      </div>
                    )}

                    {selectedOrder.cancelReason && (
                      <div className="border-t border-border/40 pt-2.5 text-xs text-destructive font-semibold">
                        <strong>Cancellation Reason:</strong> {selectedOrder.cancelReason}
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
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase">Fulfillment Status</label>
                          <select
                            value={selectedOrder.orderStatus || selectedOrder.status}
                            onChange={(e) => handleUpdateStatus(selectedOrder._id, e.target.value)}
                            disabled={updatingStatus}
                            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-bold text-foreground outline-none focus:border-primary cursor-pointer"
                          >
                            {["Placed", "Confirmed", "Processing", "Shipped", "Out for Delivery", "Delivered", "Cancelled", "Returned"].map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase">Payment Status</label>
                          <select
                            value={selectedOrder.paymentStatus}
                            onChange={(e) => handleUpdatePaymentStatus(selectedOrder._id, e.target.value)}
                            disabled={updatingStatus}
                            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-bold text-foreground outline-none focus:border-primary cursor-pointer"
                          >
                            {["Pending", "Paid", "Failed", "Refunded"].map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Status History Timeline */}
                      {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 && (
                        <div className="border-t border-border pt-4">
                          <h4 className="font-display text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Order Status History</h4>
                          <div className="relative border-l border-border pl-3 space-y-3 text-left">
                            {selectedOrder.statusHistory.map((history: any, index: number) => (
                              <div key={index} className="relative">
                                <span className="absolute -left-[17px] top-1.5 h-2 w-2 rounded-full bg-primary border border-background" />
                                <p className="text-xs font-bold text-foreground">{history.status}</p>
                                {history.note && <p className="text-[11px] text-muted-foreground mt-0.5">{history.note}</p>}
                                <p className="text-[9px] text-muted-foreground/85 mt-0.5">
                                  {new Date(history.updatedAt).toLocaleString()}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <button
                        onClick={() => handleSoftDelete(selectedOrder._id)}
                        className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-destructive/10 py-2.5 text-xs font-bold uppercase tracking-wider text-destructive transition hover:bg-destructive/20"
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
