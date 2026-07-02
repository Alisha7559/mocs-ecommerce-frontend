import { Truck, RotateCcw, ShieldCheck, Headphones } from "lucide-react";

const perks = [
  { icon: Truck, title: "Bulk Shipping", text: "Worldwide export" },
  { icon: RotateCcw, title: "Easy Returns", text: "3-day policy" },
  { icon: ShieldCheck, title: "Quality Assured", text: "Premium build" },
  { icon: Headphones, title: "24/7 Support", text: "We're here to help" },
];

export function Perks() {
  return (
    <section className="border-y border-border bg-background">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px px-4 sm:px-6 lg:grid-cols-4 lg:px-8">
        {perks.map((p) => (
          <div key={p.title} className="flex items-center gap-3 py-6">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
              <p.icon className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">{p.title}</p>
              <p className="truncate text-xs text-muted-foreground">{p.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
