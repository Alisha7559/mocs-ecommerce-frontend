import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, ShoppingBag, ArrowRight, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

type SuccessSearch = {
  paymentId?: string;
  orderId?: string;
  method?: string;
};

export const Route = createFileRoute("/payment-success")({
  validateSearch: (s: Record<string, unknown>): SuccessSearch => ({
    paymentId: typeof s.paymentId === "string" ? s.paymentId : undefined,
    orderId: typeof s.orderId === "string" ? s.orderId : undefined,
    method: typeof s.method === "string" ? s.method : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Payment Successful — MOCS" },
    ],
  }),
  component: PaymentSuccess,
});

function PaymentSuccess() {
  const { paymentId, orderId, method } = Route.useSearch();
  const [showTick, setShowTick] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTick(false);
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="mx-auto grid min-h-[70vh] max-w-md place-items-center px-4 text-center select-none">
      <AnimatePresence mode="wait">
        {showTick ? (
          <motion.div
            key="tick-screen"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex flex-col items-center justify-center min-h-[40vh]"
          >
            {/* Animated concentric pulsing circles */}
            <div className="relative flex items-center justify-center">
              {/* Outer pulse */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0.5 }}
                animate={{ scale: 1.4, opacity: 0 }}
                transition={{ repeat: Infinity, duration: 1.6, ease: "easeOut" }}
                className="absolute h-24 w-24 rounded-full bg-emerald-100"
              />
              {/* Inner pulse */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0.8 }}
                animate={{ scale: 1.2, opacity: 0 }}
                transition={{ repeat: Infinity, duration: 1.6, ease: "easeOut", delay: 0.3 }}
                className="absolute h-24 w-24 rounded-full bg-emerald-100/50"
              />
              {/* Main Circle */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="relative z-10 grid h-24 w-24 place-items-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
              >
                {/* Drawing SVG Checkmark */}
                <svg className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4.5}>
                  <motion.path
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </motion.div>
            </div>
            
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="mt-6 font-display text-xl font-extrabold text-emerald-650 tracking-wider uppercase"
            >
              Order Successful
            </motion.h2>
          </motion.div>
        ) : (
          <motion.div
            key="success-card"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full rounded-3xl border border-border bg-card p-8 shadow-card"
          >
            <h1 className="font-display text-3xl font-extrabold text-foreground">Order Successful</h1>
            <span className="mx-auto mt-4.5 mb-2 grid h-14 w-14 place-items-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200/60 shadow-sm">
              <Check className="h-8 w-8 stroke-[3.5]" />
            </span>
            <p className="mt-4 text-muted-foreground text-sm">
              {method === "cod"
                ? "Thank you for your purchase. Your order has been placed successfully and is now awaiting delivery."
                : "Thank you for your purchase. Your payment has been verified successfully, and your order is being processed."}
            </p>

            <div className="mt-6 space-y-2 rounded-2xl bg-muted p-4 text-left text-sm">
              {orderId && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order Ref:</span>
                  <span className="font-mono font-bold text-foreground truncate max-w-[180px]">{orderId.toUpperCase()}</span>
                </div>
              )}
              {paymentId && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment ID:</span>
                  <span className="font-mono font-bold text-foreground truncate max-w-[180px]">{paymentId}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Mode:</span>
                <span className="font-bold text-foreground">
                  {method === "cod" ? "Cash on Delivery" : "Razorpay (Online)"}
                </span>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-2">
              <Link
                to="/orders"
                className="flex items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-bold uppercase tracking-wider text-primary-foreground transition hover:bg-primary-glow"
              >
                <ShoppingBag className="h-4 w-4" /> View My Orders
              </Link>
              <Link
                to="/shop"
                className="flex items-center justify-center gap-1 py-3 text-sm font-bold uppercase tracking-wider text-muted-foreground transition hover:text-foreground"
              >
                Continue Shopping <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
