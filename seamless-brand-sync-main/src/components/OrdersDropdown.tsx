import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface OrdersDropdownProps {
  value: "newest" | "oldest";
  onChange: (v: "newest" | "oldest") => void;
}

export function OrdersDropdown({ value, onChange }: OrdersDropdownProps) {
  const [open, setOpen] = useState(false);
  const options = [
    { id: "newest", label: "Newest First" },
    { id: "oldest", label: "Oldest First" },
  ];
  const activeOption = options.find((o) => o.id === value);
  
  return (
    <div className="relative z-30" onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center justify-between gap-2 rounded-full border border-stone-200 bg-white px-4 py-1.5 text-xs font-bold text-stone-700 transition hover:border-primary hover:text-stone-900 cursor-pointer shadow-sm"
      >
        <span className="text-stone-400 font-medium">Sort: </span>
        <span>{activeOption?.label}</span>
        <ChevronDown className={cn("h-3.5 w-3.5 text-stone-450 transition-transform", open && "rotate-180")} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 z-35 mt-2 w-44 overflow-hidden rounded-2xl border border-stone-200 bg-white p-1 shadow-lift text-left"
          >
            {options.map((opt) => (
              <li key={opt.id}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(opt.id as any);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer",
                    value === opt.id
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-primary/5 text-stone-650 hover:text-primary",
                  )}
                >
                  {opt.label}
                  {value === opt.id && <Check className="h-3.5 w-3.5 text-primary" />}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
