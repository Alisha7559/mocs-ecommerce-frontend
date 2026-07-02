import { ReactNode, useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

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
    <div ref={containerRef} className={cn("relative inline-block text-left min-w-[150px]", className)}>
      <button
        disabled={disabled}
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground hover:border-primary hover:bg-muted/30 transition focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-border"
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown className={cn("h-4 w-4 text-primary transition-transform shrink-0", open && "rotate-180")} />
      </button>

      {open && !disabled && (
        <ul className="absolute right-0 left-0 z-50 mt-1.5 max-h-60 overflow-y-auto rounded-xl border border-border/80 bg-popover/95 backdrop-blur-md p-1 shadow-lg animate-in fade-in slide-in-from-top-1 duration-150 no-scrollbar">
          {options.map((opt) => (
            <li key={opt.value}>
              <button
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-semibold transition-all",
                  value === opt.value
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-primary/10 hover:text-primary"
                )}
              >
                <span className="truncate">{opt.label}</span>
                {value === opt.value && <Check className="h-3.5 w-3.5 shrink-0" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
