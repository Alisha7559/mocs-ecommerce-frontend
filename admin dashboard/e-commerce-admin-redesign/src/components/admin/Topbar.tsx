import { Search, Bell, MessageSquare, ChevronDown } from "lucide-react";

export function Topbar({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="flex items-center gap-4 px-6 py-4 lg:px-8">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            MOCS / Admin
          </p>
          <h1 className="truncate font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-0.5 hidden text-sm text-muted-foreground sm:block">{subtitle}</p>
          ) : null}
        </div>

        <div className="relative hidden md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search orders, SKUs, customers…"
            className="h-11 w-72 rounded-full border border-border bg-card pl-9 pr-4 text-sm font-medium outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <button className="relative grid h-11 w-11 place-items-center rounded-full border border-border bg-card text-foreground transition hover:bg-muted">
          <MessageSquare className="h-4 w-4" />
        </button>
        <button className="relative grid h-11 w-11 place-items-center rounded-full border border-border bg-card text-foreground transition hover:bg-muted">
          <Bell className="h-4 w-4" />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
        </button>

        <button className="flex items-center gap-3 rounded-full border border-border bg-card py-1.5 pl-1.5 pr-3 transition hover:bg-muted">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-secondary font-display text-xs font-bold text-secondary-foreground">
            AM
          </span>
          <span className="hidden text-left sm:block">
            <span className="block text-xs font-bold leading-tight">Aarav Mehta</span>
            <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">
              Head of Retail
            </span>
          </span>
          <ChevronDown className="hidden h-4 w-4 text-muted-foreground sm:block" />
        </button>
      </div>
    </header>
  );
}
