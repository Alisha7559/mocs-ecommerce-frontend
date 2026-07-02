import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";

type FailedSearch = {
  reason?: string;
  orderId?: string;
};

export const Route = createFileRoute("/payment-failed")({
  validateSearch: (s: Record<string, unknown>): FailedSearch => ({
    reason: typeof s.reason === "string" ? s.reason : undefined,
    orderId: typeof s.orderId === "string" ? s.orderId : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Payment Failed — MOCS" },
    ],
  }),
  component: PaymentFailed,
});

function PaymentFailed() {
  const { reason, orderId } = Route.useSearch();
  const cleanReason = reason ? reason.replace(/\s*by\s*user/gi, "").trim() : "";

  return (
    <div className="mx-auto grid min-h-[70vh] max-w-md place-items-center px-4 text-center">
      <div className="rounded-3xl border border-border bg-card p-8 shadow-card animate-in fade-in zoom-in-95 duration-200">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-destructive/15 text-destructive">
          <AlertCircle className="h-10 w-10 animate-bounce" />
        </span>
        <h1 className="mt-6 font-display text-3xl font-extrabold text-foreground">Payment Failed</h1>
        <p className="mt-3 text-muted-foreground text-sm">
          We couldn't process your transaction. The payment gateway reported an error or the transaction was cancelled.
        </p>

        {cleanReason && (
          <div className="mt-6 rounded-2xl bg-destructive/5 border border-destructive/10 p-4 text-left text-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-destructive">Reason reported:</span>
            <p className="font-semibold text-foreground mt-1">{cleanReason}</p>
          </div>
        )}

        <div className="mt-8 flex flex-col gap-2">
          <Link
            to="/checkout"
            className="flex items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-bold uppercase tracking-wider text-primary-foreground transition hover:bg-primary-glow"
          >
            <RefreshCw className="h-4 w-4" /> Retry Checkout
          </Link>
          <Link
            to="/shop"
            className="flex items-center justify-center gap-1 py-3 text-sm font-bold uppercase tracking-wider text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Shop
          </Link>
        </div>
      </div>
    </div>
  );
}
