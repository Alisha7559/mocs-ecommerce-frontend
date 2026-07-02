import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, ShoppingBag, ArrowRight } from "lucide-react";

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

  return (
    <div className="mx-auto grid min-h-[70vh] max-w-md place-items-center px-4 text-center">
      <div className="rounded-3xl border border-border bg-card p-8 shadow-card animate-in fade-in zoom-in-95 duration-300">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-success/15 text-success">
          <CheckCircle2 className="h-10 w-10 animate-pulse" />
        </span>
        <h1 className="mt-6 font-display text-3xl font-extrabold text-foreground">Order Confirmed!</h1>
        <p className="mt-3 text-muted-foreground text-sm">
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
      </div>
    </div>
  );
}
