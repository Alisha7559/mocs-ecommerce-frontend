import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useStore } from "@/lib/store";
import { getImageUrl } from "@/lib/utils";

export function CartDrawer() {
  const { cart, cartOpen, setCartOpen, cartTotal, updateQty, removeFromCart } = useStore();
  const freeShip = 150;
  const remaining = Math.max(0, freeShip - cartTotal);
  const progress = Math.min(100, (cartTotal / freeShip) * 100);

  return (
    <AnimatePresence>
      {cartOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] bg-secondary/60 backdrop-blur-sm"
          onClick={() => setCartOpen(false)}
        >
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
            className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-background"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border p-5">
              <h2 className="font-display text-lg font-bold">
                Your Cart ({cart.reduce((n, i) => n + i.qty, 0)})
              </h2>
              <button type="button" aria-label="Close cart" onClick={() => setCartOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>

            {cart.length > 0 && (
              <div className="border-b border-border bg-accent/50 px-5 py-3 text-sm">
                {remaining > 0 ? (
                  <p>
                    Easy <span className="font-bold text-primary">₹{remaining}</span> 
                    shipping
                  </p>
                ) : null}
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-5">
              {cart.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-4 text-center text-muted-foreground">
                  <ShoppingBag className="h-12 w-12" />
                  <p>Your cart is empty</p>
                  <button
                    type="button"
                    onClick={() => setCartOpen(false)}
                    className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-glow"
                  >
                    Start shopping
                  </button>
                </div>
              ) : (
                <ul className="space-y-4">
                  <AnimatePresence initial={false}>
                    {cart.map((item, i) => (
                      <motion.li
                        key={`${item.product.id}-${item.size}-${item.color}`}
                        layout
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 40 }}
                        className="flex gap-3 rounded-xl border border-border p-3"
                      >
                        <img
                          src={getImageUrl(item.product.image)}
                          alt={item.product.name}
                          className="h-20 w-20 rounded-lg object-cover"
                        />
                        <div className="flex flex-1 flex-col">
                          <div className="flex justify-between gap-2">
                            <p className="text-sm font-semibold leading-tight">
                              {item.product.name}
                            </p>
                            <button
                              type="button"
                              aria-label="Remove"
                              onClick={() => removeFromCart(i)}
                              className="text-muted-foreground transition hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Size {item.size} · {item.color}
                          </p>
                          <div className="mt-auto flex items-center justify-between">
                            <div className="flex items-center gap-1 rounded-full border border-border">
                              <button
                                type="button"
                                aria-label="Decrease"
                                onClick={() => updateQty(i, item.qty - 1)}
                                className="grid h-7 w-7 place-items-center"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="w-5 text-center text-sm font-semibold">
                                {item.qty}
                              </span>
                              <button
                                type="button"
                                aria-label="Increase"
                                onClick={() => updateQty(i, item.qty + 1)}
                                className="grid h-7 w-7 place-items-center"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                            <span className="font-bold">₹{item.product.price * item.qty}</span>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {cart.length > 0 && (
              <div className="space-y-3 border-t border-border p-5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-display text-xl font-bold">₹{cartTotal}</span>
                </div>
                <Link
                  to="/checkout"
                  onClick={() => setCartOpen(false)}
                  className="block rounded-full bg-primary py-3.5 text-center text-sm font-bold uppercase tracking-wide text-primary-foreground transition hover:bg-primary-glow"
                >
                  Checkout
                </Link>
                <p className="text-center text-xs text-muted-foreground">
                  Secure payment · Free 3-day returns
                </p>
              </div>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
