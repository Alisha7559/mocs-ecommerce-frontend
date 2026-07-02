import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, Linkedin, Phone, Mail, MapPin } from "lucide-react";
import logo from "@/assets/mocs-logo.png";

const footerNav = [
  {
    title: "Shop",
    links: [
      { label: "Men", to: "/shop", search: { category: "Men" } },
      { label: "Women", to: "/shop", search: { category: "Women" } },
      { label: "Kids", to: "/shop", search: { category: "Kids" } },
      { label: "New Arrivals", to: "/shop", search: { collection: "New Arrival" } },
      { label: "Best Sellers", to: "/shop", search: { collection: "Trending" } },
    ]
  },
  {
    title: "Collections",
    links: [
      { label: "Sports", to: "/shop", search: { collection: "Sports" } },
      { label: "Casual", to: "/shop", search: { collection: "Casual" } },
      { label: "Formal", to: "/shop", search: { collection: "Formal" } },
      { label: "Trending", to: "/shop", search: { collection: "Trending" } },
      { label: "New Arrival", to: "/shop", search: { collection: "New Arrival" } },
    ]
  },
  {
    title: "Company",
    links: [
      { label: "About", to: "/about" },
      { label: "Why Choose MOCS", to: "/about" },
      { label: "Contact", to: "/contact" },
      { label: "Careers", to: "/contact" },
      { label: "Press", to: "/contact" },
    ]
  }
];

// WhatsApp custom glyph (lucide-react has no WhatsApp icon).
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M20.52 3.48A11.78 11.78 0 0 0 12.04 0C5.5 0 .2 5.3.2 11.84a11.76 11.76 0 0 0 1.62 5.94L0 24l6.36-1.66a11.83 11.83 0 0 0 5.68 1.45h.01c6.54 0 11.84-5.3 11.84-11.84 0-3.16-1.23-6.13-3.37-8.47Zm-8.48 18.2h-.01a9.83 9.83 0 0 1-5.01-1.37l-.36-.21-3.78.99 1.01-3.68-.24-.38a9.82 9.82 0 0 1-1.5-5.19c0-5.43 4.42-9.85 9.86-9.85 2.63 0 5.1 1.03 6.96 2.89a9.78 9.78 0 0 1 2.88 6.97c0 5.43-4.42 9.83-9.85 9.83Zm5.4-7.37c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.47a8.93 8.93 0 0 1-1.65-2.05c-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51l-.57-.01a1.1 1.1 0 0 0-.8.37c-.27.3-1.05 1.02-1.05 2.49 0 1.47 1.07 2.89 1.22 3.09.15.2 2.11 3.22 5.11 4.52.71.3 1.27.48 1.7.62.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35Z" />
    </svg>
  );
}

const socials: { Icon: React.ComponentType<{ className?: string }>; label: string; href: string }[] = [
  { Icon: Instagram, label: "Instagram", href: "https://instagram.com/mocsfootwear" },
  { Icon: Facebook, label: "Facebook", href: "https://facebook.com/mocsfootwear" },
  { Icon: Linkedin, label: "LinkedIn", href: "https://www.linkedin.com/company/mocsfootwear" },
  { Icon: WhatsAppIcon, label: "WhatsApp", href: "https://wa.me/919999999999" },
];

export function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_2fr]">
          <div>
            <Link to="/" className="inline-flex items-center rounded-xl bg-background/95 p-3" aria-label="MOCS home">
              <img
                src={logo}
                alt="MOCS"
                className="h-12 w-auto"
                draggable={false}
              />
            </Link>
            <p className="mt-4 max-w-sm text-sm text-secondary-foreground/70">
              Premium footwear engineered for performance and crafted at scale. Built for quality,
              designed for performance.
            </p>

            <ul className="mt-6 space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
                  <Phone className="h-4 w-4" />
                </span>
                <a
                  href="tel:++91 7994550834"
                  className="leading-snug text-secondary-foreground/80 transition hover:text-primary"
                >
                  +91 7994550834
                </a>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
                  <Mail className="h-4 w-4" />
                </span>
                <a
                  href="mailto:support@mocs.in"
                  className="leading-snug text-secondary-foreground/80 transition hover:text-primary"
                >
                  support@mocs.in
                </a>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
                  <MapPin className="h-4 w-4" />
                </span>
                <Link
                  to="/contact"
                  className="leading-snug text-secondary-foreground/80 transition hover:text-primary text-left cursor-pointer"
                >
                  CORPORATE OFFICE<br />
                  MOCS FOOT CARE <br />
                  7QJ8+42H, WEST HILL<br />
                  KOZHIKODE, KERALA 673005
                </Link>
              </li>
            </ul>

            <div className="mt-6 flex gap-2">
              {socials.map(({ Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="grid h-10 w-10 place-items-center rounded-full border border-secondary-foreground/20 transition hover:scale-110 hover:border-primary hover:bg-primary hover:text-primary-foreground"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {footerNav.map((col) => (
              <div key={col.title}>
                <p className="mb-4 font-display text-sm font-bold uppercase tracking-wide">
                  {col.title}
                </p>
                <ul className="space-y-2.5 text-left">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.to as any}
                        search={(link as any).search}
                        className="group relative inline-block text-sm text-secondary-foreground/70 transition hover:text-secondary-foreground"
                      >
                        {link.label}
                        <span className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-primary transition-transform duration-300 group-hover:scale-x-100" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-secondary-foreground/10 pt-6 sm:flex-row">
          <p className="text-xs text-secondary-foreground/60">
            © {new Date().getFullYear()} MOCS Footwear. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs text-secondary-foreground/60">
            <a href="#" className="hover:text-primary">Privacy</a>
            <a href="#" className="hover:text-primary">Terms</a>
            <a href="#" className="hover:text-primary">Shipping</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
