import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Lock, Check, ShieldCheck, Building2, Truck, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { apiClient } from "@/lib/api";
import { isAuthed } from "@/lib/auth";
import { getImageUrl, cn } from "@/lib/utils";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

const RAZORPAY_SRC = "https://checkout.razorpay.com/v1/checkout.js";

function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = RAZORPAY_SRC;
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — MOCS" },
      { name: "description", content: "Securely complete your MOCS order." },
    ],
  }),
  component: Checkout,
});
function Checkout() {
  const navigate = useNavigate();
  const { cart, cartTotal, clearCart, user } = useStore();
  const [paying, setPaying] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "upi" | "netbanking" | "cod">("netbanking");
  const [tempAddress, setTempAddress] = useState<any>(null);
  const [tempEmail, setTempEmail] = useState("");
  const shipping = cart.reduce((sum, item) => sum + ((item.product as any).shippingCharge || 0) * item.qty, 0);
  const total = cartTotal + shipping;

  useEffect(() => {
    if (!isAuthed()) navigate({ to: "/auth", search: { redirect: "/checkout" } });
  }, [navigate]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    const form = e.currentTarget;
    const fd = new FormData(form);

    const shippingAddress = {
      fullName: `${fd.get("first") ?? ""} ${fd.get("last") ?? ""}`.trim(),
      line1: String(fd.get("address") ?? ""),
      city: String(fd.get("city") ?? ""),
      postalCode: String(fd.get("postal") ?? ""),
      country: "India",
    };

    setTempAddress(shippingAddress);
    setTempEmail(String(fd.get("email") ?? ""));
    handleSelectPaymentOption(paymentMethod, shippingAddress, String(fd.get("email") ?? ""));
  };

  const handleSelectPaymentOption = async (
    method: "card" | "upi" | "netbanking" | "cod",
    addr?: any,
    email?: string
  ) => {
    const finalAddress = addr || tempAddress;
    const finalEmail = email || tempEmail;
    setPaying(true);

    if (method === "cod") {
      try {
        toast.loading("Placing your Cash on Delivery order...", { id: "place-order" });
        const orderInfo = await apiClient.orders.create({
          shippingAddress: finalAddress,
          paymentMethod: "cod",
          items: cart.map((i) => ({
            product: i.product.id || i.product._id,
            qty: i.qty,
            size: i.size,
            color: i.color,
          })),
        });
        toast.success("Order Placed Successfully!", { id: "place-order" });
        clearCart();
        navigate({
          to: "/payment-success",
          search: {
            orderId: orderInfo._id || orderInfo.id,
            method: "cod",
          },
        });
      } catch (err: any) {
        toast.error(err?.message || "Failed to place Cash on Delivery order", { id: "place-order" });
      } finally {
        setPaying(false);
      }
      return;
    }

    try {
      const ok = await loadRazorpay();
      if (!ok || !window.Razorpay) {
        toast.error("Could not load Razorpay SDK. Please check your internet connection.");
        setPaying(false);
        return;
      }

      // 1. Create order on Express backend
      let orderInfo;
      try {
        orderInfo = await apiClient.payments.createOrder(finalAddress, cart.map((i) => ({
          product: i.product.id || i.product._id,
          qty: i.qty,
          size: i.size,
          color: i.color,
        })));
      } catch (err: any) {
        toast.error(err?.message || "Failed to create order on server");
        setPaying(false);
        return;
      }

      // 2. Open Razorpay Checkout overlay
      const rzp = new window.Razorpay!({
        key: orderInfo.key,
        amount: orderInfo.amount,
        currency: orderInfo.currency,
        order_id: orderInfo.orderId,
        name: "MOCS",
        description: "Complete your footwear purchase",
        prefill: {
          name: finalAddress.fullName,
          email: finalEmail,
          contact: finalAddress.phone || user?.phone || "",
          method: paymentMethod === "cod" ? undefined : paymentMethod,
        },
        theme: { color: "#F46A1E" }, // MOCS Orange Theme
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          setPaying(true);
          try {
            // 3. Verify payment signature on backend
            await apiClient.payments.verify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              internalOrderId: orderInfo.internalOrderId,
            });

            toast.success("Payment verified successfully!");
            clearCart();
            navigate({
              to: "/payment-success",
              search: {
                paymentId: response.razorpay_payment_id,
                orderId: orderInfo.internalOrderId,
              },
            });
          } catch (err: any) {
            toast.error("Payment verification failed");
            navigate({
              to: "/payment-failed",
              search: {
                reason: err?.message || "Verification signature error",
                orderId: orderInfo.internalOrderId,
              },
            });
          } finally {
            setPaying(false);
          }
        },
        modal: {
          ondismiss: () => {
            setPaying(false);
            toast.error("Payment cancelled");
          },
        },
      });
      rzp.open();
    } catch (err: any) {
      toast.error(err?.message || "Something went wrong during payment initialization");
      setPaying(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-display text-4xl font-extrabold">Checkout</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="mb-4 font-display text-lg font-bold">Contact & shipping</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                name="first"
                required
                placeholder="First name"
                defaultValue={user?.name ? user.name.split(" ")[0] : ""}
                className="input-field"
              />
              <input
                name="last"
                required
                placeholder="Last name"
                defaultValue={user?.name ? user.name.split(" ").slice(1).join(" ") : ""}
                className="input-field"
              />
              <input
                name="email"
                required
                type="email"
                placeholder="Email"
                defaultValue={user?.email || ""}
                className="input-field sm:col-span-2"
              />
              <input
                name="phone"
                required
                type="tel"
                placeholder="Phone number"
                defaultValue={user?.phone || ""}
                maxLength={10}
                onKeyPress={(e) => {
                  if (!/[0-9]/.test(e.key)) {
                    e.preventDefault();
                  }
                }}
                onChange={(e) => {
                  e.target.value = e.target.value.replace(/[^0-9]/g, "").slice(0, 10);
                }}
                className="input-field sm:col-span-2"
              />
              <input name="address" required placeholder="Address" className="input-field sm:col-span-2" />
              <input name="city" required placeholder="City" className="input-field" />
              <input
                name="postal"
                required
                placeholder="Postal code"
                onKeyPress={(e) => {
                  if (!/[0-9]/.test(e.key)) {
                    e.preventDefault();
                  }
                }}
                className="input-field"
              />
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="mb-4 font-display text-lg font-bold">Payment Method</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                {
                  id: "netbanking",
                  label: "Net Banking",
                  icon: Building2,
                },
                {
                  id: "upi",
                  label: "UPI Payment",
                  logo: "https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg",
                },
                {
                  id: "card",
                  label: "Credit / Debit Card",
                  icon: CreditCard,
                },
                {
                  id: "cod",
                  label: "Cash on Delivery",
                  icon: Truck,
                },
              ].map((method) => (
                <label
                  key={method.id}
                  className={cn(
                    "flex items-center justify-between rounded-xl border p-4 cursor-pointer transition-all hover:bg-accent",
                    paymentMethod === method.id
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border bg-background"
                  )}
                >
                  <div className="flex items-center gap-3 text-left">
                    <input
                      type="radio"
                      name="payment_method_radio"
                      value={method.id}
                      checked={paymentMethod === method.id}
                      onChange={() => setPaymentMethod(method.id as any)}
                      className="h-4 w-4 text-primary focus:ring-primary cursor-pointer"
                    />
                    <span className="text-sm font-semibold text-foreground">{method.label}</span>
                  </div>
                  {method.logo ? (
                    <img src={method.logo} alt={method.label} className="h-4.5 w-auto object-contain max-w-[36px] select-none" />
                  ) : method.icon ? (
                    <method.icon className="h-5 w-5 text-primary shrink-0 select-none" />
                  ) : null}
                </label>
              ))}
            </div>
            <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Secure payments powered by Razorpay or select Cash on Delivery.
            </p>
          </div>
          <button
            type="submit"
            disabled={paying}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-4 text-sm font-bold uppercase tracking-wide text-primary-foreground transition hover:bg-primary-glow disabled:opacity-60"
          >
            <Lock className="h-4 w-4" /> {paying ? "Processing…" : `Proceed to Pay ₹${total}`}
          </button>
        </form>

        <aside className="h-fit rounded-2xl border border-border bg-card p-6">
          <h2 className="mb-4 font-display text-lg font-bold">Order summary</h2>
          <ul className="space-y-3">
            {cart.map((item, i) => (
              <li key={i} className="flex items-center gap-3">
                <img
                  src={getImageUrl(item.product.image)}
                  alt={item.product.name}
                  className="h-14 w-14 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{item.product.name}</p>
                  <p className="text-xs text-muted-foreground">
                    US {item.size} · Qty {item.qty}
                  </p>
                </div>
                <span className="text-sm font-bold">₹{item.product.price * item.qty}</span>
              </li>
            ))}
            {cart.length === 0 && (
              <li className="text-sm text-muted-foreground">Your cart is empty.</li>
            )}
          </ul>
          <div className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-semibold">₹{cartTotal}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span className="font-semibold">{shipping === 0 ? "Free" : `₹${shipping}`}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2 font-display text-lg font-bold">
              <span>Total</span>
              <span>₹{total}</span>
            </div>
          </div>
        </aside>
      </div>

      {/* Options Modal Removed: Layout is Inline Radio Buttons */}
    </div>
  );
}
