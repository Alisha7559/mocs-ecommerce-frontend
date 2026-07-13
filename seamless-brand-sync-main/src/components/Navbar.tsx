import { useEffect, useState, useRef } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { Search, Heart, ShoppingBag, User, Menu, X, ChevronDown, ShieldCheck, LogOut } from "lucide-react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import logo from "@/assets/mocs-logo.png";
import { apiClient } from "@/lib/api";

type NavLink = {
  label: string;
  to: "/shop" | "/about" | "/contact";
  search?: { category?: "Men" | "Women" | "Kids" };
};

const navLinks: NavLink[] = [
  { label: "Men", to: "/shop", search: { category: "Men" } },
  { label: "Women", to: "/shop", search: { category: "Women" } },
  { label: "Kids", to: "/shop", search: { category: "Kids" } },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

export function Navbar() {
  const { cartCount, wishlist, setCartOpen, setSearchOpen, role, user, logout, collections } = useStore();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isHome = pathname === "/";
  const transparent = isHome && !scrolled;

  const handleLogoClick = (e: React.MouseEvent) => {
    if (isHome) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (userOpen && userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [userOpen]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-500 text-foreground",
          "border-b border-border bg-background/95 shadow-soft backdrop-blur-xl",
          transparent &&
          "lg:border-transparent lg:bg-background/40 lg:shadow-none lg:backdrop-blur-md",
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
              className="grid h-10 w-10 place-items-center"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>

          <Link to="/" onClick={handleLogoClick} aria-label="MOCS home" className="flex items-center">
            <img
              src={logo}
              alt="MOCS"
              className="h-9 w-auto select-none sm:h-10"
              draggable={false}
            />
          </Link>

          <nav
            className="hidden items-center gap-1 lg:flex relative"
            onMouseLeave={() => setMenuOpen(false)}
          >
            <button
              type="button"
              onMouseEnter={() => setMenuOpen(true)}
              className="group relative flex items-center gap-1 px-3 py-2 text-sm font-semibold cursor-pointer"
            >
              Collections
              <ChevronDown className="h-3.5 w-3.5" />
              <span className="absolute inset-x-3 -bottom-0.5 h-0.5 origin-left scale-x-0 bg-primary transition-transform duration-300 group-hover:scale-x-100" />
            </button>
            {navLinks.map((l) => (
              <Link
                key={l.label}
                to={l.to}
                search={l.search as any}
                className="group relative px-3 py-2 text-sm font-semibold"
                activeProps={{ className: "text-primary" }}
              >
                {l.label}
                <span className="absolute inset-x-3 -bottom-0.5 h-0.5 origin-left scale-x-0 bg-primary transition-transform duration-300 group-hover:scale-x-100" />
              </Link>
            ))}

            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.2 }}
                  className="absolute left-0 top-full pt-1 w-64"
                  onMouseEnter={() => setMenuOpen(true)}
                >
                  <div className="rounded-2xl border border-border bg-popover p-5 text-popover-foreground shadow-card mt-0.5">
                    <p className="mb-3 font-display text-[10px] font-bold uppercase tracking-widest text-primary border-b border-border pb-1.5">
                      Browse Collections
                    </p>
                    <ul className="space-y-1">
                      {collections.map((col) => (
                        <li key={col._id}>
                          <Link
                            to="/shop"
                            search={{ collection: col.name } as any}
                            onClick={() => setMenuOpen(false)}
                            className="text-sm font-semibold text-muted-foreground transition hover:text-primary block py-1"
                          >
                            {col.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </nav>

          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Search"
              onClick={() => setSearchOpen(true)}
              className="grid h-10 w-10 place-items-center rounded-full transition-all hover:scale-110 hover:text-primary"
            >
              <Search className="h-5 w-5" />
            </button>
            <Link
              to="/wishlist"
              aria-label="Wishlist"
              className="relative hidden sm:grid h-10 w-10 place-items-center rounded-full transition-all hover:scale-110 hover:text-primary"
            >
              <Heart className="h-5 w-5" />
              {wishlist.length > 0 && (
                <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                  {wishlist.length}
                </span>
              )}
            </Link>
            <button
              type="button"
              aria-label="Cart"
              onClick={() => setCartOpen(true)}
              className="relative hidden sm:grid h-10 w-10 place-items-center rounded-full transition-all hover:scale-110 hover:text-primary"
            >
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <motion.span
                  key={cartCount}
                  initial={{ scale: 0.4 }}
                  animate={{ scale: 1 }}
                  className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground"
                >
                  {cartCount}
                </motion.span>
              )}
            </button>
            <div className="relative block" ref={userMenuRef}>
              <button
                type="button"
                aria-label="Account"
                onClick={() => setUserOpen((v) => !v)}
                className="grid h-10 w-10 place-items-center rounded-full transition-all hover:scale-110 hover:text-primary focus:outline-none outline-none select-none"
              >
                <User className="h-5 w-5" />
              </button>
              <AnimatePresence>
                {userOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-12 w-56 rounded-2xl border border-border bg-popover p-2 text-popover-foreground shadow-card"
                  >
                    {user ? (
                      <>
                        <div className="px-3 py-2 border-b border-border mb-1">
                          <p className="text-sm font-bold truncate">{user.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                        <Link
                          to="/profile"
                          onClick={() => setUserOpen(false)}
                          className="block rounded-lg px-3 py-2 text-sm font-semibold hover:bg-accent focus:outline-none outline-none select-none"
                        >
                          My Profile
                        </Link>
                        <Link
                          to="/orders"
                          onClick={() => setUserOpen(false)}
                          className="block rounded-lg px-3 py-2 text-sm font-semibold hover:bg-accent focus:outline-none outline-none select-none"
                        >
                          My Orders
                        </Link>
                        <Link
                          to="/wishlist"
                          onClick={() => setUserOpen(false)}
                          className="block rounded-lg px-3 py-2 text-sm font-semibold hover:bg-accent focus:outline-none outline-none select-none"
                        >
                          Wishlist
                        </Link>
                        {(user.role === "admin" || user.role === "superadmin") && (
                          <Link
                            to="/admin/dashboard"
                            onClick={() => setUserOpen(false)}
                            className="block rounded-lg px-3 py-2 text-sm font-semibold hover:bg-accent focus:outline-none outline-none select-none text-primary"
                          >
                            Admin Dashboard
                          </Link>
                        )}
                        <button
                          onClick={() => {
                            logout();
                            setUserOpen(false);
                          }}
                          className="w-full text-left rounded-lg px-3 py-2 text-sm font-semibold hover:bg-destructive/10 text-destructive mt-1 border-t border-border pt-2 focus:outline-none outline-none select-none"
                        >
                          Logout
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/auth"
                          search={{ redirect: pathname, mode: "login" } as any}
                          onClick={() => setUserOpen(false)}
                          className="block rounded-lg px-3 py-2 text-sm font-semibold hover:bg-accent"
                        >
                          Log in
                        </Link>
                        <Link
                          to="/auth"
                          search={{ redirect: pathname, mode: "signup" } as any}
                          onClick={() => {
                            setUserOpen(false);
                          }}
                          className="block rounded-lg px-3 py-2 text-sm font-semibold hover:bg-accent"
                        >
                          Sign up
                        </Link>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-secondary/60 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="h-full w-80 max-w-[85%] bg-background p-6 text-foreground overflow-y-auto no-scrollbar"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-8 flex items-center justify-between">
                <Link
                  to="/"
                  onClick={(e) => {
                    handleLogoClick(e);
                    setMobileOpen(false);
                  }}
                  className="flex items-center"
                >
                  <img src={logo} alt="MOCS" className="h-8 w-auto" />
                </Link>
                <button type="button" aria-label="Close" onClick={() => setMobileOpen(false)}>
                  <X className="h-6 w-6" />
                </button>
              </div>
              <nav className="flex flex-col gap-1.5">
                {navLinks.map((l) => (
                  <Link
                    key={l.label}
                    to={l.to}
                    search={l.search as any}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-xl border border-transparent px-3 py-2 text-lg font-semibold text-stone-900 transition-all hover:border-primary hover:bg-primary/5"
                    activeProps={{ className: "text-primary border-primary bg-primary/20" }}
                  >
                    {l.label}
                  </Link>
                ))}
              </nav>

              <div className="mt-6 border-t border-border pt-4">
                <p className="px-3 text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Collections</p>
                <div className="grid grid-cols-2 gap-1.5 px-1">
                  {collections.map((col) => (
                    <Link
                      key={col._id}
                      to="/shop"
                      search={{ collection: col.name } as any}
                      onClick={() => setMobileOpen(false)}
                      className="rounded-xl border border-transparent px-3 py-2 text-sm font-semibold text-muted-foreground transition-all hover:border-primary hover:bg-primary/5 hover:text-primary"
                    >
                      {col.name}
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
