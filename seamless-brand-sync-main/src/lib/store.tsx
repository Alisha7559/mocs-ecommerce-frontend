import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import type { Product } from "./products";
import { apiClient, getToken, setToken } from "./api";

export type CartItem = {
  product: Product;
  size: number;
  color: string;
  qty: number;
};

export type Order = {
  id: string;
  createdAt: string;
  items: CartItem[];
  total: number;
  status: "pending" | "shipped" | "delivered";
  customer: { name: string; email: string; address: string };
};

export type Role = "user" | "admin";

type StoreContextType = {
  cart: CartItem[];
  wishlist: string[];
  cartCount: number;
  cartTotal: number;
  cartOpen: boolean;
  searchOpen: boolean;
  setCartOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  addToCart: (product: Product, size?: number, color?: string, qty?: number) => void;
  removeFromCart: (index: number) => void;
  updateQty: (index: number, qty: number) => void;
  toggleWishlist: (product: Product) => void;
  isWishlisted: (id: string) => boolean;
  recentlyViewed: string[];
  pushRecentlyViewed: (id: string) => void;
  orders: Order[];
  placeOrder: (customer: Order["customer"]) => Order;
  updateOrderStatus: (id: string, status: Order["status"]) => void;
  role: Role;
  setRole: (r: Role) => void;
  user: any | null;
  setUser: (user: any) => void;
  login: (token: string, user: any) => void;
  logout: () => void;
  clearCart: () => void;
};

const StoreContext = createContext<StoreContextType | null>(null);

const read = <T,>(key: string, fallback: T): T => {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [role, setRoleState] = useState<Role>("user");
  const [user, setUser] = useState<any>(null);

  const fetchUserProfile = async () => {
    const token = getToken();
    if (token) {
      try {
        const res = await apiClient.auth.me();
        setUser(res.user);
        setRoleState(res.user.role === "admin" || res.user.role === "superadmin" ? "admin" : "user");
      } catch (err) {
        console.error("Token verification failed, logging out:", err);
        setToken(null);
        setUser(null);
        setRoleState("user");
      }
    }
  };

  useEffect(() => {
    setCart(read<CartItem[]>("mocs-cart", []));
    setWishlist(read<string[]>("mocs-wishlist", []));
    setRecentlyViewed(read<string[]>("mocs-recent", []));
    setOrders(read<Order[]>("mocs-orders", []));
    setRoleState(read<Role>("mocs-role", "user"));
    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined")
      localStorage.setItem("mocs-cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (typeof window !== "undefined")
      localStorage.setItem("mocs-wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    if (typeof window !== "undefined")
      localStorage.setItem("mocs-recent", JSON.stringify(recentlyViewed));
  }, [recentlyViewed]);

  useEffect(() => {
    if (typeof window !== "undefined")
      localStorage.setItem("mocs-orders", JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem("mocs-role", JSON.stringify(role));
  }, [role]);

  const addToCart: StoreContextType["addToCart"] = (
    product,
    size = product.sizes[2],
    color = product.colors[0].name,
    qty = 1,
  ) => {
    setCart((prev) => {
      const idx = prev.findIndex(
        (i) => i.product.id === product.id && i.size === size && i.color === color,
      );
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + qty };
        return next;
      }
      return [...prev, { product, size, color, qty }];
    });
    setCartOpen(true);
    toast.success("Added to cart", { description: `${product.name} · US ${size}` });
  };

  const removeFromCart = (index: number) =>
    setCart((prev) => prev.filter((_, i) => i !== index));

  const updateQty = (index: number, qty: number) =>
    setCart((prev) =>
      prev.map((item, i) => (i === index ? { ...item, qty: Math.max(1, qty) } : item)),
    );

  const toggleWishlist = (product: Product) => {
    const isAdded = wishlist.includes(product.id);
    if (isAdded) {
      toast("Removed from wishlist");
      setWishlist((prev) => prev.filter((id) => id !== product.id));
    } else {
      toast.success("Added to wishlist", { description: product.name });
      setWishlist((prev) => [...prev, product.id]);
    }
  };

  const pushRecentlyViewed = (id: string) =>
    setRecentlyViewed((prev) => [id, ...prev.filter((x) => x !== id)].slice(0, 8));

  const placeOrder: StoreContextType["placeOrder"] = (customer) => {
    const order: Order = {
      id: `MOCS-${Date.now().toString(36).toUpperCase()}`,
      createdAt: new Date().toISOString(),
      items: cart,
      total: cart.reduce((n, i) => n + i.qty * i.product.price, 0),
      status: "pending",
      customer,
    };
    setOrders((prev) => [order, ...prev]);
    setCart([]);
    toast.success("Order placed", { description: order.id });
    return order;
  };

  const updateOrderStatus: StoreContextType["updateOrderStatus"] = (id, status) =>
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));

  const setRole = (r: Role) => {
    setRoleState(r);
    toast.success(`Role: ${r}`);
  };

  const login = (token: string, userData: any) => {
    setToken(token);
    setUser(userData);
    const userRole = userData.role === "admin" || userData.role === "superadmin" ? "admin" : "user";
    setRoleState(userRole);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setRoleState("user");
    toast.success("Successfully logged out");
  };

  const clearCart = () => {
    setCart([]);
  };

  const value = useMemo<StoreContextType>(
    () => ({
      cart,
      wishlist,
      cartCount: cart.reduce((n, i) => n + i.qty, 0),
      cartTotal: cart.reduce((n, i) => n + i.qty * i.product.price, 0),
      cartOpen,
      searchOpen,
      setCartOpen,
      setSearchOpen,
      addToCart,
      removeFromCart,
      updateQty,
      toggleWishlist,
      isWishlisted: (id) => wishlist.includes(id),
      recentlyViewed,
      pushRecentlyViewed,
      orders,
      placeOrder,
      updateOrderStatus,
      role,
      setRole,
      user,
      setUser,
      login,
      logout,
      clearCart,
    }),
    [cart, wishlist, cartOpen, searchOpen, recentlyViewed, orders, role, user],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
