import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Search, Heart, ShoppingBag, Package } from "lucide-react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const { cartCount, wishlist, setCartOpen, setSearchOpen } = useStore();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/90 backdrop-blur-xl lg:hidden">
      <div className="grid grid-cols-5">
        <Link
          to="/"
          className={cn(
            "flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium",
            pathname === "/" ? "text-primary" : "text-muted-foreground",
          )}
        >
          <Home className="h-5 w-5" />
          Home
        </Link>
        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          className="flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium text-muted-foreground"
        >
          <Search className="h-5 w-5" />
          Search
        </button>
        <Link
          to="/wishlist"
          className={cn(
            "relative flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium",
            pathname === "/wishlist" ? "text-primary" : "text-muted-foreground",
          )}
        >
          <Heart className="h-5 w-5" />
          {wishlist.length > 0 && (
            <span className="absolute right-4 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
              {wishlist.length}
            </span>
          )}
          Saved
        </Link>
        <Link
          to="/orders"
          className={cn(
            "flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium",
            pathname === "/orders" ? "text-primary" : "text-muted-foreground",
          )}
        >
          <Package className="h-5 w-5" />
          Orders
        </Link>
        <button
          type="button"
          onClick={() => setCartOpen(true)}
          className="relative flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium text-muted-foreground"
        >
          <ShoppingBag className="h-5 w-5" />
          {cartCount > 0 && (
            <span className="absolute right-4 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
              {cartCount}
            </span>
          )}
          Cart
        </button>
      </div>
    </nav>
  );
}
