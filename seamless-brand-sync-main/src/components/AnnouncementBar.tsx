import { Truck, ShieldCheck, RotateCcw } from "lucide-react";

const items = [
  { icon: Truck, text: "Faster shipping " },
  { icon: RotateCcw, text: "3-day easy returns" },
  { icon: ShieldCheck, text: "Secure checkout" },
];

export function AnnouncementBar() {
  return (
    <div className="bg-secondary text-secondary-foreground">
      <div className="flex overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap py-2">
          {[...items, ...items, ...items, ...items].map((item, i) => (
            <span
              key={i}
              className="mx-8 flex items-center gap-2 text-xs font-medium uppercase tracking-wide"
            >
              <item.icon className="h-4 w-4 text-primary" />
              {item.text}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
