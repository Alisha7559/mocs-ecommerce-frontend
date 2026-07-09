import { Plus, Trash2, Image, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeroSlidesConfigProps {
  heroSlides: any[];
  updateHeroSlideField: (idx: number, field: string, value: any) => void;
  addHeroSlide: () => void;
  removeHeroSlide: (idx: number) => void;
  handleHeroFileChange: (e: React.ChangeEvent<HTMLInputElement>, idx: number) => void;
  openFocusIdx: number | null;
  setOpenFocusIdx: (idx: number | null) => void;
}

export function HeroSlidesConfig({
  heroSlides,
  updateHeroSlideField,
  addHeroSlide,
  removeHeroSlide,
  handleHeroFileChange,
  openFocusIdx,
  setOpenFocusIdx,
}: HeroSlidesConfigProps) {
  return (
    <div id="hero-slideshow" className="space-y-6 scroll-mt-24">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <h2 className="font-display text-lg font-bold">Hero Slideshow</h2>
        <button
          onClick={addHeroSlide}
          className="flex items-center gap-1.5 rounded-full border border-border bg-background px-4 py-2 text-xs font-bold uppercase transition hover:bg-accent cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Add Slide
        </button>
      </div>

      <div className="space-y-6">
        {heroSlides.map((slide, idx) => (
          <div key={idx} className="rounded-3xl border border-border bg-card p-6 shadow-soft space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="font-display text-sm font-extrabold text-primary uppercase">Slide #{idx + 1}</span>
              {heroSlides.length > 1 && (
                <button
                  onClick={() => removeHeroSlide(idx)}
                  className="rounded-full bg-destructive/10 p-1.5 text-destructive transition hover:bg-destructive/20 cursor-pointer"
                >
                  <Trash2 className="h-4.5 w-4.5" />
                </button>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Eyebrow (Small Tag)</label>
                <input
                  required
                  value={slide.eyebrow}
                  onChange={(e) => updateHeroSlideField(idx, "eyebrow", e.target.value)}
                  className="input-field"
                  placeholder="e.g. New Arrivals"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Title (Heading)</label>
                <input
                  required
                  value={slide.title}
                  onChange={(e) => updateHeroSlideField(idx, "title", e.target.value)}
                  className="input-field"
                  placeholder="e.g. Step Into Style"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Subtitle (Description)</label>
                <input
                  required
                  value={slide.subtitle}
                  onChange={(e) => updateHeroSlideField(idx, "subtitle", e.target.value)}
                  className="input-field"
                  placeholder="e.g. Feel the comfort of polyurethanes."
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">CTA (Button Label)</label>
                <input
                  required
                  value={slide.cta}
                  onChange={(e) => updateHeroSlideField(idx, "cta", e.target.value)}
                  className="input-field"
                  placeholder="e.g. Shop Now"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Link URL</label>
                <input
                  required
                  value={slide.to}
                  onChange={(e) => updateHeroSlideField(idx, "to", e.target.value)}
                  className="input-field"
                  placeholder="e.g. /shop"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Mobile Image Focus</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setOpenFocusIdx(openFocusIdx === idx ? null : idx)}
                    className="w-full text-left rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-semibold text-stone-900 transition-all focus:outline-none focus:ring-1 focus:ring-primary flex items-center justify-between shadow-sm cursor-pointer"
                  >
                    <span>
                      {slide.mobileFocus === "right"
                        ? "Right Focus (Footwear on Right)"
                        : slide.mobileFocus === "left"
                          ? "Left Focus (Footwear on Left)"
                          : "Center Focus (Default)"}
                    </span>
                    <ChevronDown className={cn("h-4 w-4 text-primary transition-transform duration-200", openFocusIdx === idx && "rotate-180")} />
                  </button>

                  {openFocusIdx === idx && (
                    <>
                      <div
                        className="fixed inset-0 z-30"
                        onClick={() => setOpenFocusIdx(null)}
                      />
                      <div className="absolute left-0 right-0 mt-1.5 z-40 rounded-xl border border-stone-150 bg-white p-1.5 shadow-[0_10px_25px_rgba(0,0,0,0.08)] animate-in fade-in slide-in-from-top-2 duration-200">
                        {[
                          { value: "center", label: "Center Focus (Default)" },
                          { value: "right", label: "Right Focus (Footwear on Right)" },
                          { value: "left", label: "Left Focus (Footwear on Left)" }
                        ].map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => {
                              updateHeroSlideField(idx, "mobileFocus", opt.value);
                              setOpenFocusIdx(null);
                            }}
                            className={cn(
                              "w-full text-left rounded-lg px-3 py-2 text-xs font-semibold transition cursor-pointer",
                              (slide.mobileFocus || "center") === opt.value
                                ? "bg-primary/10 text-primary"
                                : "text-stone-700 hover:bg-stone-50 hover:text-black"
                            )}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Background Image</label>
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  <input
                    required
                    value={slide.bg}
                    onChange={(e) => updateHeroSlideField(idx, "bg", e.target.value)}
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
                      onChange={(e) => handleHeroFileChange(e, idx)}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
