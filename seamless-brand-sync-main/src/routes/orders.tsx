import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { Package, Clock, Star, X, MapPin, CreditCard, Receipt, Calendar, ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";
import { useStore } from "@/lib/store";
import { getImageUrl, cn } from "@/lib/utils";
import { isAuthed } from "@/lib/auth";

export const Route = createFileRoute("/orders")({
  head: () => ({
    meta: [
      { title: "My Orders — MOCS" },
      { name: "description", content: "Track and manage your footwear orders." },
    ],
  }),
  component: OrdersPage,
});

const statusStyles: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-600 border border-amber-500/20",
  shipped: "bg-blue-500/10 text-blue-600 border border-blue-500/20",
  delivered: "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20",
  cancelled: "bg-red-500/10 text-red-600 border border-red-500/20",
  return_requested: "bg-purple-500/10 text-purple-600 border border-purple-500/20",
  returned: "bg-indigo-500/10 text-indigo-600 border border-indigo-500/20",
};

function FancyDropdown({
  value,
  onChange,
}: {
  value: "newest" | "oldest";
  onChange: (v: "newest" | "oldest") => void;
}) {
  const [open, setOpen] = useState(false);
  const options = [
    { id: "newest", label: "Newest First" },
    { id: "oldest", label: "Oldest First" },
  ];
  const activeOption = options.find((o) => o.id === value);
  
  return (
    <div className="relative z-30" onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center justify-between gap-2 rounded-full border border-stone-200 bg-white px-4 py-1.5 text-xs font-bold text-stone-700 transition hover:border-primary hover:text-stone-900 cursor-pointer shadow-sm"
      >
        <span className="text-stone-400 font-medium">Sort: </span>
        <span>{activeOption?.label}</span>
        <ChevronDown className={cn("h-3.5 w-3.5 text-stone-450 transition-transform", open && "rotate-180")} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 z-35 mt-2 w-44 overflow-hidden rounded-2xl border border-stone-200 bg-white p-1 shadow-lift text-left"
          >
            {options.map((opt) => (
              <li key={opt.id}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(opt.id as any);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer",
                    value === opt.id
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-primary/5 text-stone-650 hover:text-primary",
                  )}
                >
                  {opt.label}
                  {value === opt.id && <Check className="h-3.5 w-3.5 text-primary" />}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

function OrdersPage() {
  const navigate = useNavigate();
  const { orders: localOrders } = useStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected order details modal
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Table filters: statusFilter ("all", "pending", "delivered", "cancelled", etc.) and sortOrder ("newest", "oldest")
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  // Cancellation, Returns, Reviews State
  const [cancelModal, setCancelModal] = useState(false);
  const [cancelOrderId, setCancelOrderId] = useState("");
  const [cancelReason, setCancelReason] = useState("");

  const [returnModal, setReturnModal] = useState(false);
  const [returnOrderId, setReturnOrderId] = useState("");
  const [returnReason, setReturnReason] = useState("");

  const [reviewModal, setReviewModal] = useState(false);
  const [reviewProduct, setReviewProduct] = useState("");
  const [reviewOrder, setReviewOrder] = useState("");
  const [reviewColor, setReviewColor] = useState("Default");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const backendOrders = await apiClient.orders.list();
      if (Array.isArray(backendOrders)) {
        setOrders(backendOrders);
      } else {
        setOrders(localOrders);
      }
    } catch (err) {
      console.warn("Failed to fetch backend orders, falling back:", err);
      setOrders(localOrders);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthed()) {
      navigate({ to: "/auth", search: { redirect: "/orders" } });
      return;
    }
    fetchOrders();
  }, [localOrders, navigate]);

  const handleCancelOrder = async () => {
    if (!cancelOrderId) return;
    try {
      await apiClient.orders.cancel(cancelOrderId, cancelReason);
      toast.success("Order cancelled successfully");
      setCancelModal(false);
      setCancelReason("");
      setDetailModalOpen(false);
      fetchOrders();
    } catch (err: any) {
      toast.error(err?.message || "Failed to cancel order");
    }
  };

  const handleReturnOrder = async () => {
    if (!returnOrderId) return;
    try {
      await apiClient.orders.returnOrder(returnOrderId, returnReason);
      toast.success("Return request submitted successfully");
      setReturnModal(false);
      setReturnReason("");
      setDetailModalOpen(false);
      fetchOrders();
    } catch (err: any) {
      toast.error(err?.message || "Failed to submit return request");
    }
  };

  const handleCreateReview = async () => {
    if (!reviewProduct || !reviewOrder) return;
    try {
      await apiClient.reviews.create({
        productId: reviewProduct,
        rating: reviewRating,
        text: reviewText,
        color: reviewColor,
      });
      toast.success("Review submitted successfully!");
      setReviewModal(false);
      setReviewText("");
    } catch (err: any) {
      toast.error(err?.message || "Failed to submit review");
    }
  };

  // Filter and sort computation
  const filteredAndSortedOrders = useMemo(() => {
    let result = [...orders];

    // 1. Filter by status selection
    if (statusFilter !== "all") {
      result = result.filter(
        (o) => o.status?.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // 2. Sort by date selection
    result.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [orders, statusFilter, sortOrder]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#FAF9F6] text-stone-900">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-stone-900 py-12 px-4 sm:px-6 lg:px-8 text-left animate-in fade-in duration-300">
      <div className="mx-auto max-w-7xl space-y-8">
        <div>
          <h1 className="font-display text-4xl font-extrabold text-stone-900">My Orders</h1>
          <p className="mt-2 text-stone-500 font-medium">Track your purchase delivery history and requests.</p>
        </div>

        {orders.length === 0 ? (
          <div className="grid place-items-center rounded-3xl border border-stone-200 bg-white py-20 text-center shadow-soft">
            <Package className="h-12 w-12 text-stone-400" />
            <p className="mt-4 font-semibold text-stone-500">No orders yet</p>
            <Link
              to="/shop"
              className="mt-4 rounded-full bg-stone-900 px-6 py-2.5 text-sm font-bold uppercase tracking-wide text-white hover:bg-primary transition cursor-pointer"
            >
              Start shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Filter and Sorting Pills Bar */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-stone-200 pb-4">
              
              {/* Status Tabs */}
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "all", label: "All Orders" },
                  { id: "pending", label: "Pending" },
                  { id: "shipped", label: "Shipped" },
                  { id: "delivered", label: "Delivered" },
                  { id: "cancelled", label: "Cancelled" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setStatusFilter(tab.id)}
                    className={cn(
                      "rounded-full px-4 py-1.5 text-xs font-bold transition border cursor-pointer",
                      statusFilter === tab.id
                        ? "bg-primary border-primary text-white shadow-sm"
                        : "bg-white border-stone-200 text-stone-600 hover:border-primary hover:text-primary hover:bg-primary/5"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Custom Date Sorter Menu */}
              <FancyDropdown value={sortOrder} onChange={setSortOrder} />

            </div>

            {filteredAndSortedOrders.length === 0 ? (
              <div className="grid place-items-center rounded-3xl border border-stone-200 bg-white py-16 text-center shadow-soft">
                <p className="font-bold text-stone-500">No orders match this status filter</p>
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter("all");
                    setSortOrder("newest");
                  }}
                  className="mt-4 rounded-full bg-stone-900 px-5 py-2 text-xs font-bold text-white hover:bg-primary transition cursor-pointer"
                >
                  Clear filter
                </button>
              </div>
            ) : (
              /* Scrollable responsive table view of orders */
              <div className="overflow-x-auto rounded-3xl border border-stone-200 bg-white shadow-soft">
                <table className="w-full min-w-[700px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-stone-200 bg-stone-50/50 text-[11px] font-black uppercase tracking-wider text-stone-500">
                      <th className="px-6 py-4">Order ID</th>
                      <th className="px-6 py-4">Items</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Total</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-150">
                    {filteredAndSortedOrders.map((order) => {
                      const firstItem = order.items?.[0];
                      // Find display index relative to original list to maintain index counts
                      const idxInList = orders.findIndex((o) => o._id === order._id);
                      const displayId = orders.length - idxInList;
                      
                      return (
                        <tr key={order._id} className="hover:bg-stone-50/20 transition-colors">
                          {/* Order ID */}
                          <td className="whitespace-nowrap px-6 py-4.5 font-bold text-primary text-sm">
                            Order #{displayId}
                          </td>

                          {/* Items Column: cover thumbnail and details */}
                          <td className="px-6 py-4.5">
                            {firstItem ? (
                              <div className="flex items-center gap-3">
                                <div className="relative h-12 w-12 rounded-xl overflow-hidden bg-[#FAF9F6] border border-stone-150 shrink-0">
                                  <img
                                    src={getImageUrl(firstItem.image)}
                                    alt={firstItem.name}
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-bold text-stone-900 max-w-[220px]">
                                    {firstItem.name}
                                  </p>
                                  {order.items.length > 1 && (
                                    <p className="text-[10px] text-stone-500 font-bold uppercase tracking-wider mt-0.5">
                                      +{order.items.length - 1} more items
                                    </p>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <span className="text-stone-400 text-xs">—</span>
                            )}
                          </td>

                          {/* Placed Date */}
                          <td className="whitespace-nowrap px-6 py-4.5 text-stone-600 text-xs font-semibold">
                            {new Date(order.createdAt).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </td>

                          {/* Grand Total */}
                          <td className="whitespace-nowrap px-6 py-4.5 font-display text-sm font-extrabold text-stone-900">
                            ₹{order.total}
                          </td>

                          {/* Order Status Badge */}
                          <td className="whitespace-nowrap px-6 py-4.5">
                            <span className={cn(
                              "inline-block rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider",
                              statusStyles[order.status] || "bg-stone-100 text-stone-500 border border-stone-200"
                            )}>
                              {order.status.replace("_", " ")}
                            </span>
                          </td>

                          {/* Detail Trigger Action */}
                          <td className="whitespace-nowrap px-6 py-4.5 text-right flex items-center justify-end gap-2">
                            {order.status === "delivered" && (
                              <button
                                type="button"
                                onClick={() => {
                                  const firstItem = order.items?.[0];
                                  if (firstItem) {
                                    setReviewProduct(firstItem.product);
                                    setReviewOrder(order._id);
                                    setReviewColor(firstItem.color || "Default");
                                    setReviewRating(5);
                                    setReviewText("");
                                    setReviewModal(true);
                                  }
                                }}
                                className="rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-xs font-bold uppercase tracking-wider hover:bg-primary hover:text-white hover:border-primary transition text-primary cursor-pointer shadow-sm"
                              >
                                Review
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedOrder(order);
                                setDetailModalOpen(true);
                              }}
                              className="rounded-full border border-stone-200 bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-wider hover:bg-stone-50 hover:text-stone-900 transition text-stone-600 cursor-pointer shadow-sm"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Order Details Modal Overlay */}
      {detailModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl border border-stone-200 bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200 my-8 text-stone-900">
            <div className="mb-6 flex items-center justify-between border-b border-stone-100 pb-4">
              <div className="text-left">
                <h3 className="font-display text-xl font-bold text-stone-900">Order Details</h3>
                <p className="text-xs text-stone-500 mt-1 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setDetailModalOpen(false)}
                className="rounded-full p-1.5 hover:bg-stone-100 text-stone-400 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6 text-left">
              {/* Product list */}
              <div className="space-y-3">
                <h4 className="font-display text-xs font-black uppercase tracking-wider text-primary">Purchased Items</h4>
                <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                  {selectedOrder.items.map((item: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 rounded-2xl border border-stone-150 bg-stone-50/50 p-3">
                      <img
                        src={getImageUrl(item.image)}
                        alt={item.name}
                        className="h-11 w-11 rounded-xl object-cover bg-white border border-stone-150 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-stone-900">{item.name}</p>
                        <p className="text-[10px] text-stone-500 mt-0.5">US {item.size} · Color: {item.color} · Qty {item.qty}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-semibold text-sm text-stone-900">₹{item.price * item.qty}</span>
                        {selectedOrder.status === "delivered" && (
                          <button
                            onClick={() => {
                              setReviewProduct(item.product);
                              setReviewOrder(selectedOrder._id);
                              setReviewColor(item.color || "Default");
                              setReviewRating(5);
                              setReviewText("");
                              setReviewModal(true);
                            }}
                            className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary hover:bg-primary/20 transition cursor-pointer"
                          >
                            Review
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Meta details grid */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-stone-150 bg-stone-50/50 p-4 space-y-2">
                  <h4 className="font-display text-xs font-black uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" /> Shipping Address
                  </h4>
                  <p className="text-xs font-bold text-stone-850 leading-relaxed">
                    {selectedOrder.shippingAddress?.fullName}<br />
                    {selectedOrder.shippingAddress?.line1}<br />
                    {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.postalCode}
                  </p>
                </div>
                <div className="rounded-2xl border border-stone-150 bg-stone-50/50 p-4 space-y-2">
                  <h4 className="font-display text-xs font-black uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                    <CreditCard className="h-3.5 w-3.5" /> Payment Summary
                  </h4>
                  <div className="text-xs space-y-1">
                    <p className="flex justify-between font-medium text-stone-500">Method: <span className="font-bold text-stone-900 uppercase">{selectedOrder.paymentMethod}</span></p>
                    <p className="flex justify-between font-medium text-stone-500">Status: <span className="font-bold text-stone-900 uppercase">{selectedOrder.paymentStatus}</span></p>
                    <p className="flex justify-between font-medium text-stone-500 border-t border-stone-200/80 pt-1 mt-1 font-display text-sm font-extrabold text-stone-900">Total: <span>₹{selectedOrder.total}</span></p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3 border-t border-stone-100 pt-4">
              {selectedOrder.status === "pending" && (
                <button
                  onClick={() => {
                    setCancelOrderId(selectedOrder._id);
                    setCancelModal(true);
                  }}
                  className="rounded-full border border-red-200 bg-red-50 px-5 py-2 text-xs font-bold text-red-600 hover:bg-red-100 transition cursor-pointer"
                >
                  Cancel Order
                </button>
              )}
              {selectedOrder.status === "delivered" && (
                <button
                  onClick={() => {
                    setReturnOrderId(selectedOrder._id);
                    setReturnModal(true);
                  }}
                  className="rounded-full border border-purple-200 bg-purple-50 px-5 py-2 text-xs font-bold text-purple-600 hover:bg-purple-100 transition cursor-pointer"
                >
                  Request Return
                </button>
              )}
              <button
                onClick={() => setDetailModalOpen(false)}
                className="rounded-full bg-stone-900 px-5 py-2 text-xs font-bold text-white hover:bg-stone-850 transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Order Modal */}
      {cancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
          <div className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-6 shadow-xl text-stone-900">
            <h3 className="font-display text-lg font-bold">Cancel Order</h3>
            <p className="text-xs text-stone-500 mt-1">Please select or provide a reason for cancelling this order.</p>
            <textarea
              className="mt-4 w-full rounded-2xl border border-stone-200 p-3 text-sm focus:border-red-500 outline-none"
              placeholder="E.g. Changed my mind, found better price..."
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setCancelModal(false)}
                className="rounded-full border border-stone-200 px-4 py-2 text-xs font-bold hover:bg-stone-50 transition cursor-pointer"
              >
                Go Back
              </button>
              <button
                onClick={handleCancelOrder}
                className="rounded-full bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 transition cursor-pointer"
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Return Request Modal */}
      {returnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
          <div className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-6 shadow-xl text-stone-900">
            <h3 className="font-display text-lg font-bold">Request Return</h3>
            <p className="text-xs text-stone-500 mt-1">Please provide the reason for requesting a return.</p>
            <textarea
              className="mt-4 w-full rounded-2xl border border-stone-200 p-3 text-sm focus:border-primary outline-none"
              placeholder="E.g. Size does not fit, wrong product delivered..."
              rows={3}
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
            />
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setReturnModal(false)}
                className="rounded-full border border-stone-200 px-4 py-2 text-xs font-bold hover:bg-stone-50 transition cursor-pointer"
              >
                Go Back
              </button>
              <button
                onClick={handleReturnOrder}
                className="rounded-full bg-stone-900 px-4 py-2 text-xs font-bold text-white hover:bg-primary transition cursor-pointer"
              >
                Request Return
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Dialog */}
      {reviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
          <div className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-6 shadow-xl text-stone-900">
            <h3 className="font-display text-lg font-bold">Submit Review</h3>
            <div className="mt-4 flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setReviewRating(s)}
                  className="p-1 cursor-pointer"
                >
                  <Star className={cn("h-6 w-6 transition-colors", s <= reviewRating ? "fill-primary text-primary" : "text-stone-300")} />
                </button>
              ))}
            </div>
            <textarea
              className="mt-4 w-full rounded-2xl border border-stone-200 p-3 text-sm focus:border-primary outline-none"
              placeholder="Share your experience wearing this footwear..."
              rows={3}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
            />
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setReviewModal(false)}
                className="rounded-full border border-stone-200 px-4 py-2 text-xs font-bold hover:bg-stone-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateReview}
                className="rounded-full bg-stone-900 px-4 py-2 text-xs font-bold text-white hover:bg-primary transition cursor-pointer"
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}