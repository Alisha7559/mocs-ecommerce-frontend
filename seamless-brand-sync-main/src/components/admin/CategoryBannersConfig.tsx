import { Image } from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryBannersConfigProps {
  categoriesBanners: any[];
  selectedBannerIdx: number;
  setSelectedBannerIdx: (idx: number) => void;
  updateBannerField: (idx: number, field: string, value: any) => void;
  handleBannerFileChange: (e: React.ChangeEvent<HTMLInputElement>, idx: number) => void;
  getImageUrl: (url: string) => string;
}

export function CategoryBannersConfig({
  categoriesBanners,
  selectedBannerIdx,
  setSelectedBannerIdx,
  updateBannerField,
  handleBannerFileChange,
  getImageUrl,
}: CategoryBannersConfigProps) {
  const currentBanner = categoriesBanners[selectedBannerIdx] || { title: "", to: "", bg: "", desc: "", cta: "" };

  return (
    <div id="promo-banner" className="space-y-6 pt-6 border-t border-border scroll-mt-24 font-sans text-left">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold">Category Section Banners</h2>
      </div>

      {/* Banner Tabs Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-border/60">
        {categoriesBanners.map((banner, idx) => (
          <button
            key={banner.key}
            type="button"
            onClick={() => setSelectedBannerIdx(idx)}
            className={cn(
              "px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap shadow-sm border",
              selectedBannerIdx === idx
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground border-border hover:bg-muted/50 hover:text-foreground"
            )}
          >
            {banner.title || `Banner #${idx + 1}`}
          </button>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-12 items-stretch pt-2">
        {/* Live Preview Card */}
        <div className="md:col-span-5 flex flex-col justify-between rounded-3xl border border-border bg-card p-6 shadow-soft space-y-4">
          <div>
            <span className="font-display text-xs font-extrabold text-primary uppercase tracking-wider block mb-3">Live Preview</span>
            
            {selectedBannerIdx === 0 ? (
              /* Main Large Landscape Banner Preview */
              <div className="relative group overflow-hidden rounded-none bg-stone-900 shadow-soft h-[240px] flex flex-col justify-end text-left w-full border border-border">
                {currentBanner.bg ? (
                  <div className="absolute inset-0 h-full w-full">
                    <img
                      src={getImageUrl(currentBanner.bg)}
                      alt="Live Preview"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60" />
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center text-zinc-500 text-xs font-mono uppercase tracking-widest">
                    No Image Configured
                  </div>
                )}
                <div className="relative z-10 p-6 text-white space-y-2">
                  <h3 className="font-display text-2xl font-extrabold leading-[1.1]">{currentBanner.title || "Title"}</h3>
                  <p className="text-[11px] text-stone-300 line-clamp-3 leading-relaxed font-sans">{currentBanner.desc || "Description"}</p>
                  <div className="pt-1">
                    <span className="inline-block border border-white px-4 py-1.5 text-[9px] font-bold uppercase tracking-wider text-white">
                      {currentBanner.cta || "CTA Button"}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              /* Category Grid Square Card Preview (with simulated hover effect) */
              <div className="relative group overflow-hidden rounded-none bg-stone-900 shadow-soft h-[240px] aspect-square mx-auto flex flex-col justify-end text-left w-full max-w-[240px] border border-border">
                {currentBanner.bg ? (
                  <div className="absolute inset-0 h-full w-full">
                    <img
                      src={getImageUrl(currentBanner.bg)}
                      alt="Live Preview"
                      className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/40 transition-colors duration-500 group-hover:bg-black/55" />
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center text-zinc-500 text-xs font-mono uppercase tracking-widest">
                    No Image Configured
                  </div>
                )}
                {/* Default Overlay */}
                <div className="absolute inset-x-0 bottom-6 text-center text-white transition-all duration-300 group-hover:opacity-0 group-hover:translate-y-4 z-10 px-4">
                  <h3 className="font-display text-xl font-extrabold">{currentBanner.title}</h3>
                  <p className="text-[10px] text-stone-300 mt-1 font-medium font-sans">{currentBanner.desc}</p>
                </div>
                {/* Hover Overlay */}
                <div className="absolute inset-0 flex items-center justify-center p-3 z-20">
                  <div className="w-full h-full border border-white/10 bg-stone-950/90 backdrop-blur-xs p-4 flex flex-col items-center justify-center text-center rounded-none opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-350 select-none">
                    <h4 className="font-display text-lg font-extrabold text-white">{currentBanner.title}</h4>
                    <p className="text-[9px] text-stone-400 mt-1 max-w-[150px] leading-relaxed font-medium font-sans">
                      Discover premium comfort and style details with {currentBanner.title} collection.
                    </p>
                    <span className="mt-3 bg-white text-stone-900 text-[9px] font-black uppercase tracking-wider py-1.5 px-4 shadow-md">
                      {currentBanner.cta || "Discover More"}
                    </span>
                  </div>
                </div>
              </div>
            )}
            <p className="text-center text-[10px] text-muted-foreground mt-3 font-semibold">Hover cursor over preview box to test active/hover state animations!</p>
          </div>
        </div>

        {/* Inputs Form */}
        <div className="md:col-span-7 rounded-3xl border border-border bg-card p-6 shadow-soft space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Banner Title</label>
              <input
                required
                value={currentBanner.title || ""}
                onChange={(e) => updateBannerField(selectedBannerIdx, "title", e.target.value)}
                className="input-field"
                placeholder="e.g. We Are MOCS"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">CTA (Button Label)</label>
              <input
                required
                value={currentBanner.cta || ""}
                onChange={(e) => updateBannerField(selectedBannerIdx, "cta", e.target.value)}
                className="input-field"
                placeholder="e.g. Purchase Now!"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Banner Description</label>
              <textarea
                required
                rows={2}
                value={currentBanner.desc || ""}
                onChange={(e) => updateBannerField(selectedBannerIdx, "desc", e.target.value)}
                className="input-field py-2"
                placeholder="Banner description text..."
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Link URL</label>
              <input
                required
                value={currentBanner.to || ""}
                onChange={(e) => updateBannerField(selectedBannerIdx, "to", e.target.value)}
                className="input-field"
                placeholder="e.g. /shop"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Background Image</label>
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <input
                  required
                  value={currentBanner.bg || ""}
                  onChange={(e) => updateBannerField(selectedBannerIdx, "bg", e.target.value)}
                  className="input-field flex-1"
                  placeholder="Image URL (e.g. https://...)"
                />
                <label className="flex h-11 px-4 items-center justify-center rounded-xl border border-dashed border-border hover:border-primary bg-muted/20 hover:bg-muted/40 transition text-xs font-bold cursor-pointer whitespace-nowrap gap-1">
                  <Image className="h-4 w-4" />
                  <span>Upload from Device</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => handleBannerFileChange(e, selectedBannerIdx)}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
