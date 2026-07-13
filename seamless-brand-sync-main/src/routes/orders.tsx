import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { Package } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";
import { useStore } from "@/lib/store";
import { getImageUrl, cn, formatDate } from "@/lib/utils";
import { isAuthed } from "@/lib/auth";
import { OrdersDropdown } from "@/components/OrdersDropdown";
import { OrderDetailsModal } from "@/components/OrderDetailsModal";
import { OrderActionModals } from "@/components/OrderActionModals";

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
  pending: "bg-amber-100 text-amber-800 border border-amber-300/60",
  Placed: "bg-zinc-100 text-zinc-700 border border-zinc-300/60",
  placed: "bg-zinc-100 text-zinc-700 border border-zinc-300/60",
  Confirmed: "bg-blue-100 text-blue-800 border border-blue-300/60",
  confirmed: "bg-blue-100 text-blue-800 border border-blue-300/60",
  Processing: "bg-amber-100 text-amber-800 border border-amber-300/60",
  processing: "bg-amber-100 text-amber-800 border border-amber-300/60",
  Shipped: "bg-indigo-100 text-indigo-800 border border-indigo-300/60",
  shipped: "bg-indigo-100 text-indigo-800 border border-indigo-300/60",
  "Out for Delivery": "bg-purple-100 text-purple-800 border border-purple-300/60",
  out_for_delivery: "bg-purple-100 text-purple-800 border border-purple-300/60",
  Delivered: "bg-emerald-100 text-emerald-800 border border-emerald-300/60",
  delivered: "bg-emerald-100 text-emerald-800 border border-emerald-300/60",
  Cancelled: "bg-red-100 text-red-800 border border-red-300/60",
  cancelled: "bg-red-100 text-red-800 border border-red-300/60",
  "Return Requested": "bg-orange-100 text-orange-850 border border-orange-300/60",
  return_requested: "bg-orange-100 text-orange-850 border border-orange-300/60",
  "Return Accepted": "bg-fuchsia-100 text-fuchsia-800 border border-fuchsia-300/60",
  return_accepted: "bg-fuchsia-100 text-fuchsia-800 border border-fuchsia-300/60",
  Returned: "bg-stone-100 text-stone-700 border border-stone-300/60",
  returned: "bg-stone-100 text-stone-700 border border-stone-300/60",
};

const isItemRefundedOrReturned = (item: any, order: any) => {
  if (!order) return false;
  const hasReturnStatus = 
    order.orderStatus === "Returned" || 
    order.status === "returned" || 
    order.orderStatus === "Return Requested" || 
    order.status === "return_requested" || 
    order.orderStatus === "Return Accepted" || 
    order.status === "return_accepted" || 
    order.paymentStatus === "Refunded" || 
    order.paymentStatus === "refunded";
  if (!hasReturnStatus && !order.returnReason) return false;
  if (order.items?.length === 1) return true;
  const reason = (order.returnReason || "").toLowerCase();
  return reason.includes(item.name.toLowerCase());
};



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
  const [returnItems, setReturnItems] = useState<string[]>([]);

  const [reviewModal, setReviewModal] = useState(false);
  const [reviewProduct, setReviewProduct] = useState("");
  const [reviewOrder, setReviewOrder] = useState("");
  const [reviewColor, setReviewColor] = useState("Default");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [reviewSize, setReviewSize] = useState<number | null>(null);

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
    if (selectedOrder && selectedOrder.items?.length > 1 && returnItems.length === 0) {
      toast.error("Please select at least one item to return", { id: "auth-toast" });
      return;
    }
    try {
      let finalReason = returnReason;
      if (selectedOrder && selectedOrder.items?.length > 1) {
        const selectedDetails = selectedOrder.items
          .filter((item: any) => {
            const key = `${item.product?.id || item.product}_${item.size}_${item.color}`;
            return returnItems.includes(key);
          })
          .map((item: any) => `${item.name} (Size ${item.size}, ${item.color})`);
        finalReason = `[Returned Items: ${selectedDetails.join(", ")}] — Reason: ${returnReason}`;
      }
      await apiClient.orders.returnOrder(returnOrderId, finalReason);
      toast.success("Return request submitted successfully");
      setReturnModal(false);
      setReturnReason("");
      setReturnItems([]);
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
        size: reviewSize || undefined,
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
              <OrdersDropdown value={sortOrder} onChange={setSortOrder} />

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
                            Order {displayId}
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
                                    onError={(e) => {
                                      e.currentTarget.src = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=120";
                                    }}
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
                            {formatDate(order.createdAt)}
                          </td>

                          {/* Grand Total */}
                          <td className="whitespace-nowrap px-6 py-4.5 font-display text-sm font-extrabold text-stone-900">
                            ₹{order.total}
                          </td>

                          {/* Order Status Badge */}
                          <td className="whitespace-nowrap px-6 py-4.5">
                            <span className={cn(
                              "inline-block rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider",
                              statusStyles[order.orderStatus || order.status] || "bg-stone-100 text-stone-500 border border-stone-200"
                            )}>
                              {(order.orderStatus || order.status).replace("_", " ")}
                            </span>
                          </td>

                          {/* Detail Trigger Action */}
                          <td className="whitespace-nowrap px-6 py-4.5 text-right flex items-center justify-end gap-2">
                            {["Delivered", "delivered"].includes(order.orderStatus || order.status) && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (order.items && order.items.length === 1) {
                                      const firstItem = order.items[0];
                                      setReviewProduct(firstItem.product);
                                      setReviewOrder(order._id);
                                      setReviewColor(firstItem.color || "Default");
                                      setReviewSize(firstItem.size || null);
                                      setReviewRating(5);
                                      setReviewText("");
                                      setReviewModal(true);
                                    } else {
                                      setSelectedOrder(order);
                                      setDetailModalOpen(true);
                                      toast.info("Please click 'Review' next to the product you want to review in the list.", { id: "auth-toast" });
                                    }
                                  }}
                                  className="rounded-full bg-primary/10 border border-primary/20 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider hover:bg-primary hover:text-white hover:border-primary transition text-primary cursor-pointer shadow-sm"
                                >
                                  Review
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedOrder(order);
                                    setReturnOrderId(order._id);
                                    setReturnItems([]);
                                    setReturnModal(true);
                                  }}
                                  className="rounded-full bg-purple-50 border border-purple-200 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider hover:bg-purple-100 hover:text-purple-700 transition text-purple-600 cursor-pointer shadow-sm"
                                >
                                  Return
                                </button>
                              </>
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

      {/* Extracted Modals */}
      <OrderDetailsModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        selectedOrder={selectedOrder}
        statusStyles={statusStyles}
        isItemRefundedOrReturned={isItemRefundedOrReturned}
        onCancel={(orderId) => {
          setCancelOrderId(orderId);
          setCancelModal(true);
        }}
        onReturn={(orderId) => {
          setReturnOrderId(orderId);
          setReturnItems([]);
          setReturnModal(true);
        }}
        onReview={(productId, orderId, color, size) => {
          setReviewProduct(productId);
          setReviewOrder(orderId);
          setReviewColor(color);
          setReviewSize(size);
          setReviewRating(5);
          setReviewText("");
          setReviewModal(true);
        }}
      />

      <OrderActionModals
        cancelModal={cancelModal}
        setCancelModal={setCancelModal}
        cancelReason={cancelReason}
        setCancelReason={setCancelReason}
        handleCancelOrder={handleCancelOrder}
        returnModal={returnModal}
        setReturnModal={setReturnModal}
        selectedOrder={selectedOrder}
        returnReason={returnReason}
        setReturnReason={setReturnReason}
        returnItems={returnItems}
        setReturnItems={setReturnItems}
        handleReturnOrder={handleReturnOrder}
        reviewModal={reviewModal}
        setReviewModal={setReviewModal}
        reviewRating={reviewRating}
        setReviewRating={setReviewRating}
        reviewText={reviewText}
        setReviewText={setReviewText}
        handleCreateReview={handleCreateReview}
      />
    </div>
  );
}