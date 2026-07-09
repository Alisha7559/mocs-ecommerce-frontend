import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryCardProps {
  name: string;
  defaultImg: string;
  products: any[];
  linkSearch: any;
}

export function CategoryCard({ name, defaultImg, products, linkSearch }: CategoryCardProps) {
  const [imgIndex, setImgIndex] = useState(0);
  const navigate = useNavigate();

  const images = useMemo(() => {
    const latest = products.slice(0, 3);
    if (latest.length === 0) return [defaultImg];
    return latest.map((p) => p.image);
  }, [products, defaultImg]);

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setImgIndex((prev) => (prev + 1) % images.length);
    }, 7000 + Math.random() * 3000);
    return () => clearInterval(interval);
  }, [images]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate({ to: "/shop", search: linkSearch });
  };

  return (
    <Link
      to="/shop"
      search={linkSearch}
      onClick={handleClick}
      className="group relative block h-72 overflow-hidden rounded-3xl bg-muted shadow-soft transition-all duration-500 hover:-translate-y-1.5 hover:shadow-lift"
    >
      <div className="absolute inset-0 h-full w-full pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.img
            key={images[imgIndex]}
            src={images[imgIndex]}
            alt={name}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 1.6 }}
            loading="lazy"
            className={cn(
              "h-full w-full object-cover",
              name === "Kids" ? "scale-110 object-center" : ""
            )}
          />
        </AnimatePresence>
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-secondary/85 via-secondary/20 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 p-5 text-secondary-foreground text-left pointer-events-none">
        <p className="text-xs font-medium uppercase tracking-wide text-secondary-foreground/80">
          {products.length} {products.length === 1 ? "style" : "styles"}
        </p>
        <h3 className="font-display text-2xl font-extrabold">{name}</h3>
        <span className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
          Shop now <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}
