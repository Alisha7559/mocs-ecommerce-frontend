import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import { FileText, Search, Eye, Edit3, X, Truck, Check, CornerUpLeft, Clock, RotateCcw, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";
import { getImageUrl, formatDateTime } from "@/lib/utils";
import { AdminDropdown } from "@/components/admin/AdminShell";

const isItemRefundedOrReturned = (item: any, order: any) => {
  if (!order) return false;
  const hasReturnStatus = 
    order.orderStatus === "Returned" || 
    order.status === "returned" || 
    order.orderStatus === "Return Requested" || 
    order.status === "return_requested" || 
    order.paymentStatus === "Refunded" || 
    order.paymentStatus === "refunded";
  if (!hasReturnStatus && !order.returnReason) return false;
  if (order.items?.length === 1) return true;
  const reason = (order.returnReason || "").toLowerCase();
  return reason.includes(item.name.toLowerCase());
};

const getOrderStatusStyle = (status: string) => {
  const s = status || "Placed";
  switch (s) {
    case "Delivered":
    case "delivered":
      return "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20";
    case "Cancelled":
    case "cancelled":
      return "bg-red-500/10 text-red-600 border border-red-500/20";
    case "Return Requested":
    case "return_requested":
      return "bg-purple-500/10 text-purple-600 border border-purple-500/20";
    case "Returned":
    case "returned":
      return "bg-stone-500/10 text-stone-600 border border-stone-500/20";
    case "Shipped":
    case "shipped":
      return "bg-indigo-500/10 text-indigo-650 border border-indigo-650/20";
    case "Out for Delivery":
    case "out_for_delivery":
      return "bg-pink-500/10 text-pink-650 border border-pink-650/20";
    default:
      return "bg-amber-500/10 text-amber-600 border border-amber-500/20";
  }
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

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

  const handleUpdateStatus = async (orderId: string, newStatus: string, note?: string) => {
    setUpdatingStatus(true);
    try {
      const updated = await apiClient.orders.updateStatus(orderId, newStatus, note);
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
                { value: "Return Requested", label: "Return Requested" },
                { value: "Return Accepted", label: "Return Accepted" },
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
                      <p className="text-[10px] text-muted-foreground">{formatDate(o.createdAt)}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-foreground">{o.shippingAddress?.name || o.user?.name || "Guest User"}</p>
                      <p className="text-xs text-muted-foreground">{o.shippingAddress?.phone || "—"}</p>
                    </td>
                     <td className="p-4">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                        getOrderStatusStyle(o.orderStatus || o.status)
                      }`}>
                        {o.orderStatus || o.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-0.5">
                        {(() => {
                          const payStat = o.paymentStatus?.toLowerCase() || "";
                          const method = o.paymentMethod?.toLowerCase() || "";
                          const displayStatus = (method === "online" && payStat === "pending") || payStat === "cancelled" ? "Failed" : o.paymentStatus;
                          const isPaid = displayStatus === "Paid" || displayStatus === "paid";
                          const isFailed = displayStatus === "Failed" || displayStatus === "failed" || displayStatus === "Cancelled" || displayStatus === "cancelled";
                          const isRefunded = displayStatus === "Refunded" || displayStatus === "refunded";
                          
                          let badgeClass = "bg-amber-500/10 text-amber-500 border border-amber-500/20";
                          if (isPaid) badgeClass = "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20";
                          if (isFailed) badgeClass = "bg-destructive/10 text-destructive border border-destructive/20";
                          if (isRefunded) badgeClass = "bg-purple-500/10 text-purple-600 border border-purple-500/20";

                          return (
                            <span className={`inline-block w-fit rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${badgeClass}`}>
                              {displayStatus}
                            </span>
                          );
                        })()}
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
      <AnimatePresence>
        {detailModalOpen && selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/75 p-4 backdrop-blur-md overflow-y-auto select-none">
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 15 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-4xl rounded-[28px] border border-stone-200/60 bg-white p-7 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh] my-4 font-sans"
            >
              {/* Top Border Accent */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500" />

              {/* Header */}
              <div className="mb-6 flex items-start justify-between border-b border-stone-100 pb-4 pt-2">
                <div>
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                    Order Management
                  </span>
                  <h3 className="font-display text-2xl font-black text-stone-900 mt-1">
                    Order Details: <span className="font-mono text-lg font-bold text-stone-600">
                      {selectedOrder.razorpayOrderId ? selectedOrder.razorpayOrderId.slice(-8).toUpperCase() : selectedOrder._id.slice(-8).toUpperCase()}
                    </span>
                  </h3>
                  <p className="text-[11px] text-stone-500 font-medium">Placed on {formatDateTime(selectedOrder.createdAt)}</p>
                </div>
                <button
                  onClick={() => setDetailModalOpen(false)}
                  className="rounded-full p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-all duration-300 focus:outline-none cursor-pointer"
                >
                  <X className="h-5.5 w-5.5" />
                </button>
              </div>

              {/* Content Body */}
              <div className="grid gap-6 md:grid-cols-2 text-left overflow-y-auto pr-1 flex-1 no-scrollbar pb-2">
                
                {/* Left Column: Purchased Items, Prices & Customer Shipping Details */}
                <div className="space-y-5">
                  <div>
                    <h4 className="font-display text-xs font-black uppercase tracking-widest text-primary border-l-2 border-primary pl-2 mb-3">Purchased Items</h4>
                    <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1.5 no-scrollbar">
                      {selectedOrder.items.map((item: any, i: number) => (
                        <div key={i} className="flex items-center gap-3.5 rounded-2xl border border-stone-100 bg-stone-50/50 p-3 hover:bg-stone-50 transition-all duration-200">
                          <img
                            src={getImageUrl(item.image)}
                            alt={item.name}
                            className="h-14 w-14 rounded-xl object-cover bg-stone-100 border border-stone-200/50 shadow-sm"
                            onError={(e) => {
                              e.currentTarget.src = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=120";
                            }}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-extrabold text-stone-900">{item.name}</p>
                            <div className="flex flex-wrap items-center gap-2 mt-0.5">
                              <span className="text-[11px] font-semibold text-stone-500">
                                Size {item.size} · Color: <span className="font-bold text-stone-600">{item.color}</span> · Qty <span className="font-bold text-stone-600">{item.qty}</span>
                              </span>
                              {isItemRefundedOrReturned(item, selectedOrder) && (
                                <span className="text-[9px] font-extrabold uppercase tracking-widest text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200 shrink-0">
                                  {selectedOrder.orderStatus === "Return Requested" || selectedOrder.status === "return_requested" ? "Return Requested" : "Refunded / Returned"}
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="font-bold text-sm text-stone-900 bg-white border border-stone-150 px-2 py-1 rounded-lg shadow-2xs">
                            ₹{item.price * item.qty}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-stone-100 bg-stone-50/30 p-4 text-sm space-y-2.5">
                    <div className="flex justify-between">
                      <span className="text-stone-500 font-medium">Subtotal</span>
                      <span className="font-bold text-stone-800">₹{selectedOrder.subtotal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500 font-medium">Shipping Charge</span>
                      <span className="font-bold text-stone-800">{selectedOrder.shipping === 0 ? "Free" : `₹${selectedOrder.shipping}`}</span>
                    </div>
                    <div className="flex justify-between border-t border-stone-100 pt-3 font-display text-lg font-black">
                      <span className="text-stone-900">Total Amount</span>
                      <span className="text-primary text-xl">₹{selectedOrder.totalAmount || selectedOrder.total}</span>
                    </div>
                  </div>

                  {/* Shipping Details */}
                  <div>
                    <h4 className="font-display text-xs font-black uppercase tracking-widest text-primary border-l-2 border-primary pl-2 mb-3">Customer Shipping Details</h4>
                    <div className="rounded-2xl border border-stone-150 bg-stone-50/20 p-4 text-xs space-y-2.5 leading-relaxed text-stone-700">
                      <p className="flex justify-between border-b border-stone-100 pb-1.5">
                        <span className="text-stone-400 font-medium uppercase tracking-wider text-[9px]">Name</span>
                        <span className="font-bold text-stone-900">{selectedOrder.shippingAddress?.name || selectedOrder.user?.name || "Guest"}</span>
                      </p>
                      <p className="flex justify-between border-b border-stone-100 pb-1.5">
                        <span className="text-stone-400 font-medium uppercase tracking-wider text-[9px]">Phone</span>
                        <span className="font-bold text-stone-900">{selectedOrder.shippingAddress?.phone || "—"}</span>
                      </p>
                      <p className="flex justify-between border-b border-stone-100 pb-1.5">
                        <span className="text-stone-400 font-medium uppercase tracking-wider text-[9px]">Email</span>
                        <span className="font-bold text-stone-900">{selectedOrder.shippingAddress?.email || selectedOrder.user?.email || "—"}</span>
                      </p>
                      <div className="pt-1.5">
                        <span className="text-stone-400 font-medium uppercase tracking-wider text-[9px] block mb-1">Shipping Address</span>
                        <p className="font-semibold text-stone-800 leading-normal">
                          {selectedOrder.shippingAddress?.address || selectedOrder.shippingAddress?.line1}<br />
                          {selectedOrder.shippingAddress?.city}
                          {selectedOrder.shippingAddress?.state ? `, ${selectedOrder.shippingAddress?.state}` : ""}
                          {selectedOrder.shippingAddress?.pincode ? ` - ${selectedOrder.shippingAddress?.pincode}` : selectedOrder.shippingAddress?.postalCode ? ` - ${selectedOrder.shippingAddress?.postalCode}` : ""}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Status Info & Actions */}
                <div className="space-y-6">
                  <div>
                    <h4 className="font-display text-xs font-black uppercase tracking-widest text-primary border-l-2 border-primary pl-2 mb-3">Order Status Details</h4>
                    <div className="rounded-2xl border border-stone-150 bg-stone-50/20 p-4 text-xs space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-stone-500 font-medium">Fulfillment Status:</span>
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${
                          getOrderStatusStyle(selectedOrder.orderStatus || selectedOrder.status)
                        }`}>
                          {selectedOrder.orderStatus || selectedOrder.status}
                        </span>
                      </div>

                      <div className="flex justify-between items-center border-t border-stone-100 pt-2.5">
                        <span className="text-stone-500 font-medium">Payment Status:</span>
                        {(() => {
                          const payStat = selectedOrder.paymentStatus?.toLowerCase() || "";
                          const method = selectedOrder.paymentMethod?.toLowerCase() || "";
                          const displayStatus = (method === "online" && payStat === "pending") || payStat === "cancelled" ? "Failed" : selectedOrder.paymentStatus;
                          const isPaid = displayStatus === "Paid" || displayStatus === "paid";
                          const isFailed = displayStatus === "Failed" || displayStatus === "failed" || displayStatus === "Cancelled" || displayStatus === "cancelled";
                          const isRefunded = displayStatus === "Refunded" || displayStatus === "refunded";
                          
                          let badgeClass = "bg-amber-500/10 text-amber-600 border border-amber-500/20";
                          if (isPaid) badgeClass = "bg-emerald-500/10 text-emerald-650 border border-emerald-500/20";
                          if (isFailed) badgeClass = "bg-red-500/10 text-red-650 border border-red-500/20";
                          if (isRefunded) badgeClass = "bg-purple-500/10 text-purple-650 border border-purple-500/20";

                          return (
                            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${badgeClass}`}>
                              {displayStatus}
                            </span>
                          );
                        })()}
                      </div>

                      <div className="flex justify-between items-center border-t border-stone-100 pt-2.5">
                        <span className="text-stone-500 font-medium">Payment Method:</span>
                        <span className="font-bold text-stone-850 uppercase text-[10px]">{selectedOrder.paymentMethod || "COD"}</span>
                      </div>

                      {selectedOrder.transactionId && (
                        <div className="border-t border-stone-100 pt-2.5 font-mono text-[9px] text-stone-500 flex justify-between gap-2 overflow-hidden">
                          <span>TXN ID:</span>
                          <span className="font-bold text-stone-800 truncate max-w-[190px]">{selectedOrder.transactionId}</span>
                        </div>
                      )}

                      {selectedOrder.cancelReason && (
                        <div className="border-t border-stone-100 pt-2.5 text-xs text-red-600 font-bold">
                          <strong>Reason:</strong> {selectedOrder.cancelReason}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Operations & Timeline */}
                  <div>
                    <h4 className="font-display text-xs font-black uppercase tracking-widest text-primary border-l-2 border-primary pl-2 mb-3">
                      {selectedOrder.isDeleted ? "Management Operations" : "Fulfillment & Status Actions"}
                    </h4>
                    {selectedOrder.isDeleted ? (
                      <button
                        onClick={() => handleRestore(selectedOrder._id)}
                        className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500 py-3 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-emerald-600 cursor-pointer shadow-md shadow-emerald-500/10"
                      >
                        <RotateCcw className="h-4.5 w-4.5" /> Restore Archived Order
                      </button>
                    ) : (
                      <div className="space-y-4">
                        {selectedOrder.orderStatus === "Return Requested" ? (
                          <div className="w-full">
                            <button
                              onClick={() => handleUpdateStatus(selectedOrder._id, "Return Accepted", "Return accepted. The item will be fetched back within 7 days.")}
                              disabled={updatingStatus}
                              className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 py-3 text-xs font-bold uppercase tracking-wider text-white transition cursor-pointer shadow-md shadow-purple-500/10"
                            >
                              Accept Return (Fetch in 7 days)
                            </button>
                          </div>
                        ) : selectedOrder.orderStatus === "Return Accepted" ? (
                          <div className="w-full">
                            <button
                              onClick={() => handleUpdateStatus(selectedOrder._id, "Returned", "Item fetched by company.")}
                              disabled={updatingStatus}
                              className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 py-3 text-xs font-bold uppercase tracking-wider text-white transition cursor-pointer shadow-md shadow-sky-500/10"
                            >
                              Mark as Returned (Item Fetched)
                            </button>
                          </div>
                        ) : (
                          <div className="grid gap-3 grid-cols-2">
                            <div className="space-y-1">
                              <label className="text-[9px] font-extrabold text-stone-400 uppercase tracking-widest block mb-1">Fulfillment</label>
                              {(selectedOrder.paymentStatus?.toLowerCase() === "failed" || selectedOrder.paymentStatus?.toLowerCase() === "cancelled") ? (
                                <div className="font-semibold text-stone-500 bg-stone-100/80 border border-stone-200/50 rounded-xl px-3 py-2 text-center text-xs">
                                  {selectedOrder.orderStatus || selectedOrder.status}
                                </div>
                              ) : (
                                <AdminDropdown
                                  value={selectedOrder.orderStatus || selectedOrder.status}
                                  onChange={(val) => handleUpdateStatus(selectedOrder._id, val)}
                                  disabled={updatingStatus}
                                  className="w-full text-stone-700 font-bold"
                                  options={["Placed", "Confirmed", "Processing", "Shipped", "Out for Delivery", "Delivered", "Cancelled", "Return Accepted", "Returned"].map((s) => ({ value: s, label: s }))}
                                />
                              )}
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-extrabold text-stone-400 uppercase tracking-widest block mb-1">Payment</label>
                              {(() => {
                                const isCod = selectedOrder.paymentMethod === "COD";
                                const isReturned = selectedOrder.orderStatus === "Returned";
                                const showDropdown = isCod || isReturned;

                                if (!showDropdown) {
                                  return (
                                    <div className="font-semibold text-stone-500 bg-stone-100/80 border border-stone-200/50 rounded-xl px-3.5 py-2.5 text-center text-xs">
                                      {selectedOrder.paymentStatus}
                                    </div>
                                  );
                                }

                                if (selectedOrder.paymentStatus?.toLowerCase() === "failed" || selectedOrder.paymentStatus?.toLowerCase() === "cancelled") {
                                  return (
                                    <div className="font-bold text-destructive bg-destructive/10 border border-destructive/20 rounded-xl px-3 py-2 text-center text-xs uppercase">
                                      Failed
                                    </div>
                                  );
                                }

                                return (
                                  <AdminDropdown
                                    value={selectedOrder.paymentStatus}
                                    onChange={(val) => handleUpdatePaymentStatus(selectedOrder._id, val)}
                                    disabled={updatingStatus}
                                    className="w-full text-stone-700 font-bold"
                                    options={["Pending", "Paid", "Failed", "Refunded"].map((s) => ({ value: s, label: s }))}
                                  />
                                );
                              })()}
                            </div>
                          </div>
                        )}

                        {/* Status History Timeline */}
                        {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 && (
                          <div className="border-t border-stone-100 pt-4">
                            <h4 className="font-display text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-3">Order Status History</h4>
                            <div className="relative border-l border-stone-200 pl-3 space-y-3.5 text-left">
                              {selectedOrder.statusHistory.map((history: any, index: number) => (
                                <div key={index} className="relative">
                                  <span className="absolute -left-[16.5px] top-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500 border border-white" />
                                  <p className="text-[11px] font-bold text-stone-850">{history.status}</p>
                                  {history.note && <p className="text-[10px] text-stone-500 mt-0.5">{history.note}</p>}
                                  <p className="text-[9px] text-stone-400 mt-0.5">
                                    {formatDateTime(history.updatedAt)}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <button
                          onClick={() => handleSoftDelete(selectedOrder._id)}
                          className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50/40 py-2.5 text-xs font-bold uppercase tracking-wider text-red-650 transition hover:bg-red-50 cursor-pointer"
                        >
                          Archive / Soft Delete Order
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
