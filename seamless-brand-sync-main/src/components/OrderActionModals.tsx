import { Star } from "lucide-react";
import { cn, getImageUrl } from "@/lib/utils";

interface OrderActionModalsProps {
  // Cancel Order Modal State
  cancelModal: boolean;
  setCancelModal: (open: boolean) => void;
  cancelReason: string;
  setCancelReason: (v: string) => void;
  handleCancelOrder: () => void;

  // Return Request Modal State
  returnModal: boolean;
  setReturnModal: (open: boolean) => void;
  selectedOrder: any;
  returnReason: string;
  setReturnReason: (v: string) => void;
  returnItems: string[];
  setReturnItems: (items: string[] | ((prev: string[]) => string[])) => void;
  handleReturnOrder: () => void;

  // Review Dialog State
  reviewModal: boolean;
  setReviewModal: (open: boolean) => void;
  reviewRating: number;
  setReviewRating: (rating: number) => void;
  reviewText: string;
  setReviewText: (text: string) => void;
  handleCreateReview: () => void;
}

export function OrderActionModals({
  cancelModal,
  setCancelModal,
  cancelReason,
  setCancelReason,
  handleCancelOrder,
  returnModal,
  setReturnModal,
  selectedOrder,
  returnReason,
  setReturnReason,
  returnItems,
  setReturnItems,
  handleReturnOrder,
  reviewModal,
  setReviewModal,
  reviewRating,
  setReviewRating,
  reviewText,
  setReviewText,
  handleCreateReview,
}: OrderActionModalsProps) {
  return (
    <>
      {/* Cancel Order Modal */}
      {cancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
          <div className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-6 shadow-xl text-stone-900 text-left">
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
                type="button"
                onClick={() => setCancelModal(false)}
                className="rounded-full border border-stone-200 px-4 py-2 text-xs font-bold hover:bg-stone-50 transition cursor-pointer"
              >
                Go Back
              </button>
              <button
                type="button"
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
          <div className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-6 shadow-xl text-stone-900 text-left">
            <h3 className="font-display text-lg font-bold">Request Return</h3>
            <p className="text-xs text-stone-500 mt-1">Please provide the reason for requesting a return.</p>
            {selectedOrder && selectedOrder.items.length > 1 && (
              <div className="mt-4 space-y-2 border-y border-stone-100 py-3.5 text-left max-h-48 overflow-y-auto pr-1 no-scrollbar">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-stone-400 block mb-2">
                  Select Items to Return / Refund
                </label>
                {selectedOrder.items.map((item: any, idx: number) => {
                  const key = `${item.product?.id || item.product}_${item.size}_${item.color}`;
                  const isChecked = returnItems.includes(key);
                  return (
                    <label key={idx} className="flex items-center gap-3 rounded-xl border border-stone-100 p-2 hover:bg-stone-50 transition cursor-pointer text-xs font-semibold text-stone-850">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          setReturnItems(prev => 
                            isChecked ? prev.filter(k => k !== key) : [...prev, key]
                          );
                        }}
                        className="rounded border-stone-300 text-primary focus:ring-primary h-4 w-4"
                      />
                      <img 
                        src={getImageUrl(item.image)} 
                        className="h-14 w-14 rounded-xl object-cover bg-stone-50 border border-stone-200/50 shrink-0"
                        onError={(e) => {
                          e.currentTarget.src = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=120";
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="truncate font-bold text-stone-900">{item.name}</p>
                        <p className="text-[10px] text-stone-500 mt-0.5">Size {item.size} · {item.color} · Qty {item.qty}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
            <textarea
              className="mt-4 w-full rounded-2xl border border-stone-200 p-3 text-sm focus:border-primary outline-none"
              placeholder="E.g. Size does not fit, wrong product delivered..."
              rows={3}
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
            />
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setReturnModal(false)}
                className="rounded-full border border-stone-200 px-4 py-2 text-xs font-bold hover:bg-stone-50 transition cursor-pointer"
              >
                Go Back
              </button>
              <button
                type="button"
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
          <div className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-6 shadow-xl text-stone-900 text-left">
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
                type="button"
                onClick={() => setReviewModal(false)}
                className="rounded-full border border-stone-200 px-4 py-2 text-xs font-bold hover:bg-stone-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateReview}
                className="rounded-full bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary-glow transition cursor-pointer"
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
