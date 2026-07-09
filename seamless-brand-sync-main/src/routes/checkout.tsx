import { createFileRoute, Link, useNavigate, useBlocker } from "@tanstack/react-router";
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

const indianStates = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Puducherry",
  "Jammu & Kashmir",
  "Ladakh"
];

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
  const { cart, cartTotal, clearCart, user, setUser } = useStore();
  const [paying, setPaying] = useState(false);
  const [isRepayMode, setIsRepayMode] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);

  const blocker = useBlocker({
    shouldBlockFn: () => isRepayMode,
    withResolver: true,
  });

  const handleConfirmCancelOrder = async () => {
    if (createdOrderId) {
      try {
        toast.loading("Cancelling order...", { id: "cancel-order-toast" });
        await apiClient.orders.cancel(createdOrderId, "Cancelled during checkout page exit");
        await apiClient.payments.cancel(createdOrderId);
        toast.success("Order cancelled successfully", { id: "cancel-order-toast" });
      } catch (err: any) {
        console.error(err);
        toast.error("Failed to cancel order", { id: "cancel-order-toast" });
      }
    }
    setIsRepayMode(false);
    setCreatedOrderId(null);
    if (blocker.status === "blocked") {
      blocker.proceed();
    }
  };

  const handleKeepOrder = () => {
    if (blocker.status === "blocked") {
      blocker.reset();
    }
  };

  const [paymentMethod, setPaymentMethod] = useState<"card" | "upi" | "netbanking" | "cod">("netbanking");
  const [tempAddress, setTempAddress] = useState<any>(null);
  const [tempEmail, setTempEmail] = useState("");
  const shipping = cart.reduce((sum, item) => sum + ((item.product as any).shippingCharge || 0) * item.qty, 0);
  const total = cartTotal + shipping;

  // Form fields controlled state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [addressVal, setAddressVal] = useState("");
  const [cityVal, setCityVal] = useState("");
  const [stateVal, setStateVal] = useState("");
  const [postalVal, setPostalVal] = useState("");

  useEffect(() => {
    if (user) {
      setFirstName(user.name ? user.name.split(" ")[0] : "");
      setLastName(user.name ? user.name.split(" ").slice(1).join(" ") : "");
      setEmail(user.email || "");
      setPhone(user.phone || "");

      // Parse address format: "line1, city, state, postal, country"
      if (user.address && typeof user.address === "string") {
        const parts = user.address.split(",").map((s: string) => s.trim());
        if (parts.length >= 4) {
          const countryIdx = parts.findIndex((p: string) => p.toLowerCase() === "india");
          let postal = "";
          let state = "";
          let city = "";
          let line1 = "";

          if (countryIdx !== -1) {
            postal = parts[countryIdx - 1] || "";
            state = parts[countryIdx - 2] || "";
            city = parts[countryIdx - 3] || "";
            line1 = parts.slice(0, countryIdx - 3).join(", ");
          } else {
            postal = parts[parts.length - 1];
            state = parts[parts.length - 2];
            city = parts[parts.length - 3];
            line1 = parts.slice(0, parts.length - 3).join(", ");
          }
          setAddressVal(line1);
          setCityVal(city);
          setStateVal(state);
          setPostalVal(postal);
        } else if (parts.length === 3) {
          setAddressVal(parts[0]);
          setCityVal(parts[1]);
          setPostalVal(parts[2]);
          setStateVal("");
        } else {
          setAddressVal(user.address);
          setCityVal("");
          setPostalVal("");
          setStateVal("");
        }
      }
    }
  }, [user]);

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
      name: `${fd.get("first") ?? ""} ${fd.get("last") ?? ""}`.trim(),
      fullName: `${fd.get("first") ?? ""} ${fd.get("last") ?? ""}`.trim(),
      phone: String(fd.get("phone") ?? ""),
      email: String(fd.get("email") ?? ""),
      address: String(fd.get("address") ?? ""),
      line1: String(fd.get("address") ?? ""),
      city: String(fd.get("city") ?? ""),
      state: String(fd.get("state") ?? ""),
      pincode: String(fd.get("postal") ?? ""),
      postalCode: String(fd.get("postal") ?? ""),
      country: "India",
    };

    setTempAddress(shippingAddress);
    setTempEmail(shippingAddress.email);

    // Sync profile phone and address back to backend user
    const addressStr = `${shippingAddress.address}, ${shippingAddress.city}, ${shippingAddress.state}, ${shippingAddress.pincode}, ${shippingAddress.country}`;
    apiClient.users
      .updateProfile({
        name: shippingAddress.name,
        phone: shippingAddress.phone,
        address: addressStr,
      })
      .then((updatedUser) => {
        if (updatedUser) {
          setUser(updatedUser);
        }
      })
      .catch((err) => {
        console.warn("Failed to auto-update profile on checkout", err);
      });

    handleSelectPaymentOption(paymentMethod, shippingAddress, shippingAddress.email);
  };

  const handleSelectPaymentOption = async (
    method: "card" | "upi" | "netbanking" | "cod",
    addr?: any,
    email?: string
  ) => {
    const finalAddress = addr || tempAddress;
    const finalEmail = email || tempEmail;
    setPaying(true);
    setIsRepayMode(false);
    setCreatedOrderId(null);

    if (method === "cod") {
      try {
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
        clearCart();
        navigate({
          to: "/payment-success",
          search: {
            orderId: orderInfo._id || orderInfo.id,
            method: "cod",
          },
        });
      } catch (err: any) {
        toast.error(err?.message || "Failed to place Cash on Delivery order");
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
          ondismiss: async () => {
            setPaying(false);
            toast.error("Payment cancelled");
            if (orderInfo && orderInfo.internalOrderId) {
              setIsRepayMode(true);
              setCreatedOrderId(orderInfo.internalOrderId);
              try {
                await apiClient.payments.cancel(orderInfo.internalOrderId);
              } catch (e) {
                console.warn("Failed to mark payment as cancelled/failed on backend:", e);
              }
            }
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
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="input-field"
              />
              <input
                name="last"
                required
                placeholder="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="input-field"
              />
              <input
                name="email"
                required
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field sm:col-span-2"
              />
              <input
                name="phone"
                required
                type="tel"
                placeholder="Phone number"
                value={phone}
                maxLength={10}
                onKeyPress={(e) => {
                  if (!/[0-9]/.test(e.key)) {
                    e.preventDefault();
                  }
                }}
                onChange={(e) => {
                  setPhone(e.target.value.replace(/[^0-9]/g, "").slice(0, 10));
                }}
                className="input-field sm:col-span-2"
              />
              <input
                name="address"
                required
                placeholder="Address"
                value={addressVal}
                onChange={(e) => setAddressVal(e.target.value)}
                className="input-field sm:col-span-2"
              />
              <input
                name="city"
                required
                placeholder="City"
                value={cityVal}
                onChange={(e) => setCityVal(e.target.value)}
                className="input-field"
              />
              <select
                name="state"
                required
                value={stateVal}
                onChange={(e) => setStateVal(e.target.value)}
                className="input-field cursor-pointer bg-card text-foreground"
              >
                <option value="">Select State</option>
                {indianStates.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
              <input
                name="postal"
                required
                placeholder="Postal code"
                value={postalVal}
                onKeyPress={(e) => {
                  if (!/[0-9]/.test(e.key)) {
                    e.preventDefault();
                  }
                }}
                onChange={(e) => {
                  setPostalVal(e.target.value.replace(/[^0-9]/g, ""));
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
            <Lock className="h-4 w-4" /> {paying ? "Processing…" : isRepayMode ? `Proceed to Repay ₹${total}` : `Proceed to Pay ₹${total}`}
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
                    Size {item.size} · Qty {item.qty}
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

      {/* Route Exit Confirmation Modal */}
      {blocker.status === "blocked" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-card space-y-4 text-left animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-destructive">
              <div className="rounded-full bg-destructive/10 p-2">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="font-display text-lg font-bold text-foreground">Cancel Order?</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Without completing payment, this order will not be completed. Would you like to cancel this order?
            </p>
            <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-end">
              <button
                onClick={handleKeepOrder}
                className="rounded-full border border-border bg-background px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition hover:bg-accent cursor-pointer"
              >
                No, Keep Order
              </button>
              <button
                onClick={handleConfirmCancelOrder}
                className="rounded-full border border-destructive/30 bg-destructive/10 text-destructive px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition hover:bg-destructive/20 cursor-pointer"
              >
                Yes, Cancel Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
