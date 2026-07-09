import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Reveal } from "@/components/Reveal";
import { cn, getImageUrl } from "@/lib/utils";

export function ScrollBrandReveal({ collections }: { collections: any[] }) {
  const [showAll, setShowAll] = useState(false);
  const visibleCollections = showAll ? collections : collections.slice(0, 5);

  const renderCard = (item: any, idx: number, isFlex: boolean) => {
    const targetTo = item.to || "/shop";
    const itemTitle = item.title || "";
    const searchVal = item.search && (item.search.collection || item.search.category)
      ? item.search
      : { collection: itemTitle ? (itemTitle.charAt(0).toUpperCase() + itemTitle.slice(1).toLowerCase()) : "Sports" };

    const bgImg = item.bg || "";
    const getOptimizedUrl = (url: string) => {
      if (!url) return "";
      let finalUrl = getImageUrl(url);
      if (finalUrl.includes("unsplash.com")) {
        if (finalUrl.includes("w=")) {
          finalUrl = finalUrl.replace(/w=\d+/, "w=400").replace(/q=\d+/, "q=70");
        } else {
          finalUrl = `${finalUrl}${finalUrl.includes("?") ? "&" : "?"}w=400&q=70`;
        }
      }
      return finalUrl;
    };
    const bgUrl = getOptimizedUrl(bgImg);

    return (
      <Reveal
        key={item.key || item.title}
        delay={0.05 * (idx + 1)}
        className={isFlex ? "w-full sm:w-[calc(20%-19.2px)] min-w-[200px]" : undefined}
      >
        <Link
          to={targetTo}
          search={searchVal as any}
          className="group block relative h-40 w-full rounded-3xl overflow-hidden shadow-soft transition-all duration-500 hover:scale-105 hover:-translate-y-2 hover:shadow-xl border border-black/5 bg-stone-900"
        >
          {/* Background Image */}
          {bgUrl ? (
            <img
              src={bgUrl}
              alt={item.title}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          ) : null}
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/45 transition-colors duration-500 group-hover:bg-black/55" />

          {/* Centered Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 z-10">
            <h3 className="font-display text-xs sm:text-sm font-black text-white tracking-widest uppercase drop-shadow-md text-center px-1 leading-snug">
              {item.title}
            </h3>
          </div>
        </Link>
      </Reveal>
    );
  };

  // Helper to render a row of cards
  const renderRow = (rowItems: any[], startIdx: number) => {
    const isFullRow = rowItems.length === 5;

    if (isFullRow) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {rowItems.map((item, index) => renderCard(item, startIdx + index, false))}
        </div>
      );
    } else {
      return (
        <div className="flex flex-wrap justify-center gap-6">
          {rowItems.map((item, index) => renderCard(item, startIdx + index, true))}
        </div>
      );
    }
  };

  // Split visible collections into rows of up to 5 items
  const rows: any[][] = [];
  for (let i = 0; i < visibleCollections.length; i += 5) {
    rows.push(visibleCollections.slice(i, i + 5));
  }

  return (
    <section className="mx-auto max-w-7xl px-4 pt-2 pb-2 sm:px-6 lg:px-8 overflow-hidden font-sans">
      <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
        <Reveal>
          <span className="rounded-full bg-primary/10 px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-primary">
            MOCS Collections
          </span>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="font-display text-4xl sm:text-5xl font-black uppercase tracking-tight text-stone-900">
            Shop by <span className="bg-gradient-to-r from-stone-950 to-primary bg-clip-text text-transparent">Collection</span>
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed font-medium">
            Find your perfect pair from our diverse style collections. Whether you're looking for active sports, everyday casuals, or elegant formals, we have you covered.
          </p>
        </Reveal>
      </div>

      {/* Grid / Centered rows of collections */}
      <div className="space-y-6">
        {rows.map((rowItems, idx) => (
          <div key={idx}>
            {renderRow(rowItems, idx * 5)}
          </div>
        ))}
      </div>

      {collections.length > 5 && (
        <Reveal delay={0.1} className="mt-12 flex justify-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="group inline-flex items-center gap-2 rounded-full border border-border bg-card px-8 py-3.5 text-xs font-bold uppercase tracking-widest transition-all shadow-sm cursor-pointer hover:scale-105"
          >
            <span className="bg-gradient-to-r from-stone-950 to-primary bg-clip-text text-transparent">
              {showAll ? "View Less" : "View More"}
            </span>
          </button>
        </Reveal>
      )}
    </section>
  );
}
