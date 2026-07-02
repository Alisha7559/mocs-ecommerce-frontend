import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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
} from "lucide-react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

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

  const isAdmin = user && (user.role === "admin" || user.role === "superadmin");

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

      {/* User Status Bar */}
      <div className="flex items-center gap-3 border-b border-zinc-800/80 px-6 py-3.5 bg-black/10 shrink-0">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-primary/20 text-primary font-display text-xs font-bold uppercase border border-primary/45">
          {user.name.charAt(0)}
        </span>
        <div className="min-w-0 flex-1 text-left">
          <p className="truncate text-sm font-bold text-white leading-none mb-1">{user.name}</p>
          <p className="truncate text-[9px] text-zinc-400 font-bold uppercase tracking-wider">{user.jobTitle || user.role}</p>
        </div>
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
        <Link
          to="/"
          className="flex w-full items-center rounded-xl border border-transparent px-3 py-2 text-sm font-semibold text-zinc-300 hover:border-[#f46a1e] hover:bg-white/5 hover:text-white transition-all"
        >
          Storefront
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
      <header className="flex lg:hidden items-center justify-between border-b border-border bg-card px-6 py-4 shrink-0 shadow-sm">
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
      <div className={cn("fixed inset-0 z-50 lg:hidden transition-opacity duration-300", mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none")}>
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
      <main className="min-w-0 flex-1 flex flex-col justify-between px-4 py-8 sm:px-6 lg:px-8">
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
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              API Status: Online
            </span>
            <a href="#" className="hover:text-primary transition">Developer API</a>
            <a href="#" className="hover:text-primary transition">Documentation</a>
          </div>
        </footer>
      </main>
    </div>
  );
}