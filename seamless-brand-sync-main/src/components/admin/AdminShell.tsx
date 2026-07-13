import { ReactNode, useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";

interface AdminShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function AdminShell({ title, subtitle, children }: AdminShellProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-foreground flex items-center gap-2">
          {title}
        </h1>
        {subtitle && <p className="text-muted-foreground text-sm mt-1">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

interface Option {
  value: string;
  label: string;
  className?: string;
}

interface AdminDropdownProps {
  value: string;
  onChange: (val: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function AdminDropdown({ value, onChange, options, placeholder = "Select option", className, disabled }: AdminDropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((o) => o.value === value);

  return (
    <div ref={containerRef} className={cn("relative inline-block text-left min-w-[150px] select-none", className)} style={{ zIndex: open ? 50 : 1 }}>
      <button
        disabled={disabled}
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-bold text-foreground hover:border-primary hover:bg-muted/30 transition duration-150 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {selectedOption ? (
          selectedOption.className ? (
            <span className={cn("truncate px-2 py-0.5 rounded-full border text-[9px] uppercase font-bold text-left", selectedOption.className)}>
              {selectedOption.label}
            </span>
          ) : (
            <span className="truncate">{selectedOption.label}</span>
          )
        ) : (
          <span className="truncate text-stone-400">{placeholder}</span>
        )}
        <ChevronDown className={cn("h-4 w-4 text-primary transition-transform shrink-0", open && "rotate-180")} />
      </button>

      <AnimatePresence>
        {open && !disabled && (
          <motion.ul
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 left-0 z-50 mt-1.5 max-h-60 overflow-y-auto rounded-xl border border-stone-200 bg-white/95 backdrop-blur-md p-1 shadow-lg min-w-[160px]"
          >
            {options.map((opt) => (
              <li key={opt.value}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs font-semibold transition-all duration-150 cursor-pointer select-none",
                    value === opt.value
                      ? "bg-[#f46a1e]/10 border border-[#f46a1e]/20"
                      : "hover:bg-stone-50"
                  )}
                >
                  {opt.className ? (
                    <span className={cn("truncate px-2.5 py-0.5 rounded-full border text-[9px] uppercase font-bold", opt.className)}>
                      {opt.label}
                    </span>
                  ) : (
                    <span className="truncate text-stone-750">{opt.label}</span>
                  )}
                  {value === opt.value && <Check className="h-3.5 w-3.5 shrink-0 text-[#f46a1e]" />}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
