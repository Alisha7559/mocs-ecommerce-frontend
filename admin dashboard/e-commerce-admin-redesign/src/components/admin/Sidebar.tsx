import { useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  BarChart3,
  Star,
  Tag,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav: { to: string; label: string; icon: typeof LayoutDashboard; badge?: string }[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/orders", label: "Orders", icon: ShoppingBag, badge: "12" },
  { to: "/products", label: "Products", icon: Package },
  { to: "/customers", label: "Customers", icon: Users },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/reviews", label: "Reviews", icon: Star },
  { to: "/discounts", label: "Discounts", icon: Tag },
];

export function Sidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside className="sticky top-4 hidden h-[calc(100vh-2rem)] my-4 ml-4 w-64 shrink-0 flex-col rounded-[2rem] border border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex overflow-hidden no-scrollbar shadow-xl">
      <div className="flex items-center gap-2 px-6 py-5 shrink-0">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary font-display text-lg font-black text-primary-foreground">
          M
        </div>
        <div className="leading-tight">
          <p className="font-display text-lg font-extrabold tracking-tight">MOCS</p>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-sidebar-foreground/60">
            Commerce Console
          </p>
        </div>
      </div>

      <p className="px-6 pb-1 pt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-sidebar-foreground/40 shrink-0">
        Operate
      </p>
      <nav className="flex-1 px-3 overflow-y-hidden no-scrollbar py-2">
        <ul className="space-y-1">
          {nav.map(({ to, label, icon: Icon, badge }) => {
            const active = pathname === to || (to !== "/" && pathname.startsWith(to));
            return (
              <li key={to}>
                <a 
                  href={to}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl border border-transparent px-3 py-2 text-sm font-semibold transition-all",
                    active
                      ? "bg-primary text-primary-foreground shadow-[var(--shadow-lift)] border border-transparent"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:border-primary",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="flex-1">{label}</span>
                  {badge ? (
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-bold",
                        active ? "bg-white/20 text-white" : "bg-primary/15 text-primary",
                      )}
                    >
                      {badge}
                    </span>
                  ) : null}
                </a>
              </li>
            );
          })}
        </ul>

        <p className="px-3 pb-1 pt-4 text-[10px] font-bold uppercase tracking-[0.2em] text-sidebar-foreground/40 shrink-0">
          Account
        </p>
        <ul className="space-y-1">
          <li>
            <a 
              href="/settings"
              className="flex items-center gap-3 rounded-xl border border-transparent px-3 py-2 text-sm font-semibold text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:border-primary transition-all"
            >
              <Settings className="h-4 w-4" />
              Settings
            </a>
          </li>
        </ul>
      </nav>

      <div className="m-3 rounded-2xl bg-gradient-to-br from-primary to-[oklch(0.78_0.18_55)] p-4 text-primary-foreground shrink-0">
        <p className="font-display text-sm font-extrabold uppercase tracking-wide">New Season 2026</p>
        <p className="mt-1 text-xs text-primary-foreground/80">
          Push the Velocity Pro drop live.
        </p>
        <button className="mt-2.5 w-full rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold uppercase tracking-wider backdrop-blur transition hover:bg-white/25">
          Schedule launch
        </button>
      </div>

      <button className="mx-3 mb-4 flex items-center gap-3 rounded-xl border border-transparent px-3 py-2 text-sm font-semibold text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:border-primary transition-all shrink-0">
        <LogOut className="h-4 w-4" /> Sign out
      </button>
    </aside>
  );
}
