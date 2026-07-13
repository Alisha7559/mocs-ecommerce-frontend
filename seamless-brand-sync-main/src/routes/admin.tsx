import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ShieldOff,
  ShieldCheck,
  LayoutDashboard,
  Users,
  ShoppingBag,
  FileText,
  Inbox,
  CreditCard,
  ArrowLeft,
  LogOut,
  Menu,
  X,
  User as UserIcon,
  BarChart,
  Settings,
  Bell,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Portal — MOCS" },
      { name: "description", content: "MOCS administration and backend dashboard." },
    ],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  const navigate = useNavigate();
  const location = useRouterState({ select: (s) => s.location });
  const { user, logout } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [newOrderModal, setNewOrderModal] = useState<any>(null);
  const latestOrderIdRef = useRef<string | null>(null);

  const isAdmin = user && (user.role === "admin" || user.role === "superadmin");

  useEffect(() => {
    if (!isAdmin) return;

    const initializeLatestOrder = async () => {
      try {
        const orders = await apiClient.orders.listAll("limit=1");
        if (orders && orders.length > 0) {
          const newest = orders[0];
          latestOrderIdRef.current = newest._id;

          let alreadyViewed = false;
          try {
            const stored = localStorage.getItem("mocs_viewed_orders");
            const viewedList = stored ? JSON.parse(stored) : [];
            alreadyViewed = viewedList.includes(newest._id);
          } catch (e) {
            console.error(e);
          }

          const isPlaced = (newest.orderStatus || newest.status || "").toLowerCase() === "placed";

          if (!alreadyViewed && isPlaced) {
            setNewOrderModal(newest);
          }
        }
      } catch (err) {
        console.warn("Failed to initialize latest order", err);
      }
    };
    initializeLatestOrder();

    const interval = setInterval(async () => {
      try {
        const orders = await apiClient.orders.listAll("limit=1");
        if (orders && orders.length > 0) {
          const newest = orders[0];
          const prevId = latestOrderIdRef.current;

          let alreadyViewed = false;
          try {
            const stored = localStorage.getItem("mocs_viewed_orders");
            const viewedList = stored ? JSON.parse(stored) : [];
            alreadyViewed = viewedList.includes(newest._id);
          } catch (e) {
            console.error(e);
          }

          const isPlaced = (newest.orderStatus || newest.status || "").toLowerCase() === "placed";

          if (prevId && prevId !== newest._id && !alreadyViewed && isPlaced) {
            setNewOrderModal(newest);
          }
          latestOrderIdRef.current = newest._id;
        }
      } catch (err) {
        console.warn("Error polling for new orders", err);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin && (location.pathname === "/admin" || location.pathname === "/admin/")) {
      navigate({ to: "/admin/dashboard" });
    }
  }, [user, location.pathname, navigate, isAdmin]);

  if (!isAdmin) {
    return (
      <div className="mx-auto grid min-h-[70vh] max-w-md place-items-center px-4 text-center">
        <div className="rounded-3xl border border-border bg-card p-8 shadow-card animate-in fade-in zoom-in-95 duration-200">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-destructive/10 text-destructive">
            <ShieldOff className="h-8 w-8" />
          </span>
          <h1 className="mt-6 font-display text-2xl font-extrabold text-foreground">Admin Access Required</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            This area is restricted to MOCS administrators. Please log in with an authorized administrator account to continue.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Link
              to="/auth"
              search={{ redirect: "/admin/dashboard" }}
              className="rounded-full bg-primary py-3 text-sm font-bold uppercase tracking-wider text-primary-foreground transition hover:bg-primary-glow"
            >
              Sign In as Admin
            </Link>
            <Link
              to="/"
              className="flex items-center justify-center gap-2 rounded-full border border-border bg-background py-2.5 text-sm font-semibold transition hover:bg-accent"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const navLinks = [
    { label: "Dashboard", to: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Analytics", to: "/admin/analytics", icon: BarChart },
    { label: "Users", to: "/admin/users", icon: Users },
    { label: "Products", to: "/admin/products", icon: ShoppingBag },
    { label: "Orders", to: "/admin/orders", icon: FileText },
    { label: "Queries", to: "/admin/queries", icon: Inbox },
    { label: "Payments", to: "/admin/payments", icon: CreditCard },
    { label: "Settings", to: "/admin/settings", icon: Settings },
  ];

  const renderSidebar = (isMobile = false) => (
    <div className="relative z-10 flex h-full flex-col w-full">
      <div className="flex h-16 items-center justify-between border-b border-zinc-800/80 px-6 shrink-0">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary font-display text-lg font-black text-primary-foreground">
            M
          </div>
          <div className="leading-tight text-left">
            <p className="font-display text-sm font-extrabold tracking-tight text-white">MOCS</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#f46a1e]">
              Admin Dashboard
            </p>
          </div>
        </div>
        {isMobile && (
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="rounded-full p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 space-y-1.5 px-3 py-4 overflow-y-auto no-scrollbar">
        {navLinks.map((link) => {
          return (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileMenuOpen(false)}
              className="group flex items-center rounded-xl border border-transparent px-3 py-2 text-sm font-semibold transition-all text-zinc-300 hover:border-[#f46a1e] hover:bg-white/5 hover:text-white"
              activeProps={{ className: "bg-primary text-white shadow-[var(--shadow-lift)] hover:bg-primary border border-transparent" }}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Sidebar Footer Operations */}
      <div className="border-t border-zinc-800/80 p-3 space-y-1 shrink-0 bg-black/5">
        <Link
          to="/admin/profile"
          onClick={() => setMobileMenuOpen(false)}
          className="flex w-full items-center rounded-xl border border-transparent px-3 py-2 text-sm font-semibold text-zinc-300 hover:border-[#f46a1e] hover:bg-white/5 hover:text-white transition-all"
          activeProps={{ className: "bg-primary text-white shadow-[var(--shadow-lift)] hover:bg-primary border border-transparent" }}
        >
          My Profile
        </Link>
        <button
          onClick={() => {
            logout();
            navigate({ to: "/" });
          }}
          className="flex w-full items-center rounded-xl border border-transparent px-3 py-2 text-sm font-semibold text-red-400 hover:border-red-500/50 hover:bg-red-500/10 transition-all text-left cursor-pointer"
        >
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col lg:flex-row admin-layout">
      {/* Mobile Top Header */}
      <header className="sticky top-0 z-50 flex lg:hidden items-center justify-between border-b border-border bg-card px-6 py-4 shrink-0 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary font-display text-sm font-black text-primary-foreground">
            M
          </div>
          <span className="font-display text-sm font-extrabold text-foreground tracking-tight">MOCS Admin</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="rounded-xl border border-border p-2 hover:bg-muted text-foreground transition"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {/* Mobile sidebar overlay & drawer */}
      <div className={cn("fixed inset-0 z-[60] lg:hidden transition-opacity duration-300", mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none")}>
        {/* Backdrop overlay */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />

        {/* Drawer container */}
        <aside className={cn("absolute inset-y-0 left-0 flex w-64 flex-col border-r border-zinc-800/80 bg-gradient-to-b from-[#18181B] to-[#27272A] text-zinc-100 h-full overflow-hidden no-scrollbar shadow-2xl transition-transform duration-300 ease-out", mobileMenuOpen ? "translate-x-0" : "-translate-x-full")}>
          {/* Orange glowing shades */}
          <div className="absolute top-0 right-0 z-0 h-40 w-40 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-20 left-4 z-0 h-32 w-32 rounded-full bg-[#f46a1e]/15 blur-2xl pointer-events-none" />
          {renderSidebar(true)}
        </aside>
      </div>

      {/* Desktop Left Sidebar */}
      <aside
        className="hidden lg:flex sticky top-4 flex-col w-64 h-[calc(100vh-2rem)] border border-zinc-800/80 bg-gradient-to-b from-[#18181B] to-[#27272A] text-zinc-100 max-h-screen overflow-hidden no-scrollbar relative rounded-[2rem] my-4 ml-4 shadow-xl shrink-0"
      >
        {/* Orange glowing shades */}
        <div className="absolute top-0 right-0 z-0 h-40 w-40 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 left-4 z-0 h-32 w-32 rounded-full bg-[#f46a1e]/15 blur-2xl pointer-events-none" />
        {renderSidebar(false)}
      </aside>

      {/* Content Panel Area */}
      <main className="min-w-0 flex-1 flex flex-col justify-between px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex justify-end items-center mb-6">
          <Link
            to="/admin/profile"
            className="flex items-center gap-3 bg-transparent hover:bg-muted/30 px-3 py-1.5 rounded-2xl transition cursor-pointer select-none"
          >
            <span className="grid h-7 w-7 place-items-center rounded-full bg-primary/10 text-primary font-display text-xs font-bold uppercase border border-primary/20 shrink-0">
              {user.name.charAt(0)}
            </span>
            <div className="min-w-0 text-left">
              <p className="truncate text-xs font-bold text-foreground leading-none mb-0.5">{user.name}</p>
              <p className="truncate text-[9px] text-stone-400 font-bold uppercase tracking-wider">{user.jobTitle || user.role}</p>
            </div>
          </Link>
        </div>

        <div className="flex-1">
          <Outlet />
        </div>

        {/* Admin Portal Support Footer */}
        <footer className="mt-12 border-t border-border/60 pt-6 text-xs text-muted-foreground flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <span className="font-semibold text-foreground/80">MOCS Admin Helpdesk:</span>
            <a href="tel:+91 7994550834" className="hover:text-primary transition">
              +91 7994550834
            </a>
            <a href="mailto:support@mocs.in" className="hover:text-primary transition">
              support@mocs.in
            </a>
          </div>
        </footer>
      </main>

      {/* New Order Amodal Alert Box */}
      <AnimatePresence>
        {newOrderModal && (
          <motion.div
            initial={{ y: 50, scale: 0.9, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 50, scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 250 }}
            className="fixed bottom-6 right-6 z-[100] w-full max-w-sm rounded-3xl border border-[#f46a1e]/50 bg-zinc-950 p-5 shadow-2xl shadow-[#f46a1e]/20 text-zinc-100 text-left overflow-hidden pointer-events-auto ring-4 ring-[#f46a1e]/40 animate-pulse"
          >
            {/* Top orange glow effect */}
            <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-primary/20 blur-2xl pointer-events-none" />

            <div className="flex items-start gap-4">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-red-500/10 text-red-500 border border-red-500/25 shrink-0 animate-bounce">
                <Bell className="h-5 w-5" />
              </span>
              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                    <h4 className="font-display text-sm font-black uppercase tracking-wide text-white">
                      New Order!
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNewOrderModal(null)}
                    className="text-zinc-500 hover:text-white p-0.5 rounded-full transition"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-[11px] text-zinc-400 font-mono mt-1 text-zinc-300">
                  ID: #{newOrderModal._id}
                </p>
                <div className="text-[11px] text-zinc-400 space-y-0.5 mt-1.5">
                  <p>Customer: <span className="text-white font-semibold">{newOrderModal.user?.name || "Customer"}</span></p>
                  <p>Amount: <span className="text-primary font-bold">₹{newOrderModal.totalAmount || newOrderModal.total}</span></p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2.5 border-t border-zinc-900 pt-3">
              <button
                type="button"
                onClick={() => {
                  setNewOrderModal(null);
                  navigate({ to: "/admin/orders", search: { openOrderId: newOrderModal._id } });
                }}
                className="w-full rounded-xl bg-primary py-2 text-center text-xs font-bold uppercase text-white hover:bg-primary-glow hover:scale-102 active:scale-[0.98] transition cursor-pointer shadow-md shadow-orange-500/10"
              >
                View Details
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}