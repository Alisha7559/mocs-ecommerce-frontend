import { X, Calendar, MapPin, CreditCard, Check } from "lucide-react";
import { cn, getImageUrl } from "@/lib/utils";

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedOrder: any;
  statusStyles: Record<string, string>;
  isItemRefundedOrReturned: (item: any, order: any) => boolean;
  onCancel: (orderId: string) => void;
  onReturn: (orderId: string) => void;
  onReview: (productId: string, orderId: string, color: string, size: number | null) => void;
}

export function OrderDetailsModal({
  isOpen,
  onClose,
  selectedOrder,
  statusStyles,
  isItemRefundedOrReturned,
  onCancel,
  onReturn,
  onReview,
}: OrderDetailsModalProps) {
  if (!isOpen || !selectedOrder) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start lg:items-center justify-center bg-black/50 p-4 overflow-y-auto">
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
            onClick={onClose}
            className="rounded-full p-1.5 hover:bg-stone-100 text-stone-400 transition cursor-pointer"
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
                    onError={(e) => {
                      e.currentTarget.src = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=120";
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-stone-900">{item.name}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-stone-500 font-medium">Size {item.size} · Color: {item.color} · Qty {item.qty}</span>
                      {isItemRefundedOrReturned(item, selectedOrder) && (
                        <span className="text-[9px] font-extrabold uppercase tracking-widest text-purple-650 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-150 shrink-0">
                          Refunded / Returned
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-sm text-stone-900">₹{item.price * item.qty}</span>
                    {["Delivered", "delivered"].includes(selectedOrder.orderStatus || selectedOrder.status) && (
                      <button
                        onClick={() => onReview(item.product, selectedOrder._id, item.color || "Default", item.size || null)}
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
              <p className="text-xs font-bold text-stone-850 leading-relaxed text-left">
                {selectedOrder.shippingAddress?.name || selectedOrder.shippingAddress?.fullName}<br />
                {selectedOrder.shippingAddress?.address || selectedOrder.shippingAddress?.line1}<br />
                {selectedOrder.shippingAddress?.city}
                {selectedOrder.shippingAddress?.state ? `, ${selectedOrder.shippingAddress?.state}` : ""}
                {selectedOrder.shippingAddress?.pincode ? ` - ${selectedOrder.shippingAddress?.pincode}` : selectedOrder.shippingAddress?.postalCode ? ` - ${selectedOrder.shippingAddress?.postalCode}` : ""}
                {selectedOrder.shippingAddress?.phone && <><br />Phone: {selectedOrder.shippingAddress.phone}</>}
                {selectedOrder.shippingAddress?.email && <><br />Email: {selectedOrder.shippingAddress.email}</>}
              </p>
            </div>
            <div className="rounded-2xl border border-stone-150 bg-stone-50/50 p-4 space-y-2">
              <h4 className="font-display text-xs font-black uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                <CreditCard className="h-3.5 w-3.5" /> Payment Summary
              </h4>
              <div className="text-xs space-y-1">
                <p className="flex justify-between font-medium text-stone-500">Method: <span className="font-bold text-stone-900 uppercase">{selectedOrder.paymentMethod}</span></p>
                <p className="flex justify-between font-medium text-stone-500">Payment Status: <span className="font-bold text-stone-900 uppercase">{selectedOrder.paymentStatus?.toLowerCase() === "cancelled" ? "FAILED" : selectedOrder.paymentStatus}</span></p>
                <p className="flex justify-between font-medium text-stone-500">Order Status: <span className="font-bold text-stone-900 uppercase">{selectedOrder.orderStatus || selectedOrder.status}</span></p>
                {selectedOrder.transactionId && (
                  <p className="flex justify-between font-medium text-stone-500 truncate max-w-full">Txn ID: <span className="font-semibold text-stone-800 text-[10px]">{selectedOrder.transactionId}</span></p>
                )}
                <p className="flex justify-between font-medium text-stone-500 border-t border-stone-200/80 pt-1 mt-1 font-display text-sm font-extrabold text-stone-900">Total: <span>₹{selectedOrder.total}</span></p>
              </div>
            </div>
          </div>

          {/* Status History Timeline */}
          {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 && (
            <div className="space-y-4 border-t border-stone-100 pt-6">
              <h4 className="font-display text-xs font-black uppercase tracking-widest text-primary text-left">
                Order Status Tracker
              </h4>
              
              {/* Stepper Grid Container */}
              <div className="relative flex items-center justify-between px-2 pt-2 pb-8 select-none">
                {/* Connecting Line Background */}
                <div className="absolute left-8 right-8 top-6 h-0.5 bg-stone-150 -translate-y-1/2" />
                
                {/* Connecting Line Active Fill */}
                <div 
                  className="absolute left-8 top-6 h-0.5 bg-emerald-500 -translate-y-1/2 transition-all duration-500" 
                  style={{ 
                    width: `${
                      (() => {
                        const steps = ["Placed", "Confirmed", "Processing", "Shipped", "Out for Delivery", "Delivered"];
                        const currentStatus = selectedOrder.orderStatus || selectedOrder.status || "Placed";
                        const index = steps.findIndex(s => s.toLowerCase() === currentStatus.toLowerCase());
                        const clampedIndex = index >= 0 ? index : 0;
                        return clampedIndex >= steps.length - 1 ? 100 : (clampedIndex / (steps.length - 1)) * 100;
                      })()
                    }%`,
                    maxWidth: "calc(100% - 4rem)"
                  }}
                />

                {(() => {
                  const steps = ["Placed", "Confirmed", "Processing", "Shipped", "Out for Delivery", "Delivered"];
                  const currentStatus = selectedOrder.orderStatus || selectedOrder.status || "Placed";
                  const currentStepIndex = steps.findIndex(s => s.toLowerCase() === currentStatus.toLowerCase());
                  const clampedStepIndex = currentStepIndex >= 0 ? currentStepIndex : 0;
                  
                  const getStatusDate = (statusName: string) => {
                    const match = selectedOrder.statusHistory?.find((h: any) => h.status.toLowerCase() === statusName.toLowerCase());
                    return match ? new Date(match.updatedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : null;
                  };

                  return steps.map((step, idx) => {
                    const isCompleted = idx <= clampedStepIndex;
                    const isActive = idx === clampedStepIndex;
                    const stepDate = getStatusDate(step);
                    
                    return (
                      <div key={step} className="relative z-10 flex flex-col items-center flex-1">
                        <div className={cn(
                          "h-8 w-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 bg-white",
                          isActive 
                            ? "border-emerald-500 text-emerald-600 bg-emerald-50 scale-110 shadow-md shadow-emerald-500/10" 
                            : isCompleted 
                              ? "border-emerald-500 text-emerald-600 bg-emerald-50/50" 
                              : "border-stone-200 text-stone-400"
                        )}>
                          {isCompleted ? (
                            <Check className="h-4 w-4 stroke-[3]" />
                          ) : (
                            <span className="text-xs font-bold">{idx + 1}</span>
                          )}
                        </div>
                        <div className="absolute top-10 text-center w-24">
                          <p className={cn(
                            "text-[9px] font-extrabold tracking-tight leading-tight uppercase",
                            isActive ? "text-emerald-600" : isCompleted ? "text-stone-850" : "text-stone-400"
                          )}>
                            {step}
                          </p>
                          {stepDate && (
                            <p className="text-[8px] text-stone-450 mt-0.5 font-bold">
                              {stepDate}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 flex justify-end gap-3 border-t border-stone-100 pt-4">
          {["Placed", "Confirmed", "Processing", "pending", "paid"].includes(selectedOrder.orderStatus || selectedOrder.status) && (
            <button
              onClick={() => onCancel(selectedOrder._id)}
              className="rounded-full border border-red-200 bg-red-50 px-5 py-2 text-xs font-bold text-red-600 hover:bg-red-100 transition cursor-pointer"
            >
              Cancel Order
            </button>
          )}
          {["Delivered", "delivered"].includes(selectedOrder.orderStatus || selectedOrder.status) && (
            <button
              onClick={() => onReturn(selectedOrder._id)}
              className="rounded-full border border-purple-200 bg-purple-50 px-5 py-2 text-xs font-bold text-purple-600 hover:bg-purple-100 transition cursor-pointer"
            >
              Request Return
            </button>
          )}
          <button
            onClick={onClose}
            className="rounded-full bg-stone-900 px-5 py-2 text-xs font-bold text-white hover:bg-stone-850 transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
