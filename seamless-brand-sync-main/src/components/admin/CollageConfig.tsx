import { Plus, Trash2, Image } from "lucide-react";
import { cn } from "@/lib/utils";

interface CollageConfigProps {
  promiseCollage: any[];
  selectedPromiseIdx: number;
  setSelectedPromiseIdx: (idx: number) => void;
  updatePromiseField: (idx: number, field: string, value: any) => void;
  addPromiseBanner: () => void;
  removePromiseBanner: (idx: number) => void;
  handlePromiseFileChange: (e: React.ChangeEvent<HTMLInputElement>, idx: number) => void;
  getImageUrl: (url: string) => string;
}

export function CollageConfig({
  promiseCollage,
  selectedPromiseIdx,
  setSelectedPromiseIdx,
  updatePromiseField,
  addPromiseBanner,
  removePromiseBanner,
  handlePromiseFileChange,
  getImageUrl,
}: CollageConfigProps) {
  const currentBanner = promiseCollage[selectedPromiseIdx] || { title: "", to: "", bg: "", desc: "", cta: "", subtitle: "" };

  return (
    <div id="promise-collage" className="space-y-6 pt-6 border-t border-border scroll-mt-24 font-sans text-left">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold">Promise Section Collage Cards</h2>
        <button
          onClick={addPromiseBanner}
          className="flex items-center gap-1.5 rounded-full border border-border bg-background px-4 py-2 text-xs font-bold uppercase transition hover:bg-accent cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Add Collage Card
        </button>
      </div>

      {/* Banner Tabs Selector with Delete Buttons */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-border/60">
        {promiseCollage.map((banner, idx) => (
          <div key={banner.key || idx} className="flex items-center gap-1 bg-card rounded-full border border-border px-3 py-1.5 shadow-sm">
            <button
              type="button"
              onClick={() => setSelectedPromiseIdx(idx)}
              className={cn(
                "text-xs font-bold transition-all cursor-pointer whitespace-nowrap",
                selectedPromiseIdx === idx ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {banner.title || `Card #${idx + 1}`}
            </button>
            {promiseCollage.length > 1 && (
              <button
                onClick={() => removePromiseBanner(idx)}
                className="text-muted-foreground hover:text-destructive transition p-0.5 rounded-full hover:bg-muted cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-12 items-stretch pt-2">
        {/* Live Preview Card */}
        <div className="md:col-span-5 flex flex-col justify-between rounded-3xl border border-border bg-card p-6 shadow-soft space-y-4">
          <div>
            <span className="font-display text-xs font-extrabold text-primary uppercase tracking-wider block mb-3">Live Preview Collage</span>
            
            {/* Dynamic collage preview block */}
            <div className="w-full bg-[#0b0a0a] p-2 rounded-2xl border border-black/5 shadow-md min-h-[180px] flex items-center justify-center relative overflow-hidden">
              <div className="grid grid-cols-12 grid-rows-6 gap-1 absolute inset-0 w-full h-full opacity-65 z-0 p-2">
                {promiseCollage.map((item, idx) => {
                  const gridSpans = [
                    "col-span-4 row-span-4",
                    "col-span-3 row-span-6",
                    "col-span-5 row-span-3",
                    "col-span-5 row-span-3",
                    "col-span-4 row-span-2"
                  ];
                  const spanClass = gridSpans[idx % gridSpans.length];
                  return (
                    <div
                      key={item.key || idx}
                      onClick={() => setSelectedPromiseIdx(idx)}
                      className={cn(
                        "relative overflow-hidden bg-stone-950 border transition cursor-pointer rounded-md",
                        spanClass,
                        selectedPromiseIdx === idx ? "border-primary ring-1 ring-primary/45 z-10" : "border-white/5 hover:border-white/20"
                      )}
                    >
                      {item.bg ? (
                        <img
                          src={getImageUrl(item.bg)}
                          alt=""
                          className="w-full h-full object-cover filter grayscale"
                        />
                      ) : (
                        <div className="w-full h-full bg-stone-900 flex items-center justify-center text-[6px] text-zinc-500">Slot {idx+1}</div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="relative z-10 pointer-events-none text-center bg-black/60 p-3 rounded-xl border border-white/5 backdrop-blur-xs text-white">
                <span className="text-[10px] uppercase font-bold tracking-wider block">Mosaic Grid Preview</span>
                <p className="text-[8px] text-stone-300 mt-0.5 max-w-[140px]">Click any image slot in the background grid to select and edit its details.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Inputs Form */}
        <div className="md:col-span-7 rounded-3xl border border-border bg-card p-6 shadow-soft space-y-4">
          {promiseCollage.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Title (Header)</label>
                <input
                  required
                  value={currentBanner.title || ""}
                  onChange={(e) => updatePromiseField(selectedPromiseIdx, "title", e.target.value)}
                  className="input-field"
                  placeholder="e.g. Feoro Woman Power"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Subtitle (Eyebrow)</label>
                <input
                  value={currentBanner.subtitle || ""}
                  onChange={(e) => updatePromiseField(selectedPromiseIdx, "subtitle", e.target.value)}
                  className="input-field"
                  placeholder="e.g. CONFIDENCE (Optional)"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Description (Detail Text)</label>
                <textarea
                  rows={2}
                  value={currentBanner.desc || ""}
                  onChange={(e) => updatePromiseField(selectedPromiseIdx, "desc", e.target.value)}
                  className="input-field py-2"
                  placeholder="Short tagline or detailed text... (Optional)"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">CTA (Button Text)</label>
                <input
                  value={currentBanner.cta || ""}
                  onChange={(e) => updatePromiseField(selectedPromiseIdx, "cta", e.target.value)}
                  className="input-field"
                  placeholder="e.g. Explore (Optional)"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Link URL</label>
                <input
                  required
                  value={currentBanner.to || ""}
                  onChange={(e) => updatePromiseField(selectedPromiseIdx, "to", e.target.value)}
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
                    onChange={(e) => updatePromiseField(selectedPromiseIdx, "bg", e.target.value)}
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
                      onChange={(e) => handlePromiseFileChange(e, selectedPromiseIdx)}
                    />
                  </label>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground text-sm font-medium">Click "Add Collage Card" above to build your promise section collage grid!</div>
          )}
        </div>
      </div>
    </div>
  );
}
