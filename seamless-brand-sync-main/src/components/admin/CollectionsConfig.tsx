import { Plus, Trash2, Image } from "lucide-react";
import { cn } from "@/lib/utils";

interface CollectionsConfigProps {
  collectionsBanners: any[];
  selectedCollectionIdx: number;
  setSelectedCollectionIdx: (idx: number) => void;
  updateCollectionField: (idx: number, field: string, value: any) => void;
  addCollectionBanner: () => void;
  removeCollectionBanner: (idx: number) => void;
  handleCollectionFileChange: (e: React.ChangeEvent<HTMLInputElement>, idx: number) => void;
  getImageUrl: (url: string) => string;
}

export function CollectionsConfig({
  collectionsBanners,
  selectedCollectionIdx,
  setSelectedCollectionIdx,
  updateCollectionField,
  addCollectionBanner,
  removeCollectionBanner,
  handleCollectionFileChange,
  getImageUrl,
}: CollectionsConfigProps) {
  const currentCollection = collectionsBanners[selectedCollectionIdx];

  return (
    <div id="collections-banners" className="space-y-6 pt-6 border-t border-border scroll-mt-24 font-sans text-left">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold">Collections Section Banners</h2>
        <button
          onClick={addCollectionBanner}
          className="flex items-center gap-1.5 rounded-full border border-border bg-background px-4 py-2 text-xs font-bold uppercase transition hover:bg-accent cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Add Collection
        </button>
      </div>

      {/* Banner Tabs Selector with Delete Buttons */}
      <div className="flex gap-2 items-center overflow-x-auto pb-2 scrollbar-none border-b border-border/60">
        {collectionsBanners.map((banner, idx) => (
          <div key={banner.key || idx} className="flex items-center gap-1.5 bg-card rounded-full pr-1.5 border border-border/40 shadow-xs">
            <button
              type="button"
              onClick={() => setSelectedCollectionIdx(idx)}
              className={cn(
                "px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap border-0",
                selectedCollectionIdx === idx
                  ? "bg-primary text-primary-foreground"
                  : "bg-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {banner.title || `Collection #${idx + 1}`}
            </button>
            {collectionsBanners.length > 1 && (
              <button
                onClick={() => removeCollectionBanner(idx)}
                className="rounded-full bg-destructive/10 p-1 text-destructive transition hover:bg-destructive/20 cursor-pointer"
                title="Delete Collection"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>

      {currentCollection && (
        <div className="grid gap-6 md:grid-cols-12 items-stretch pt-2">
          {/* Live Preview Card */}
          <div className="md:col-span-5 flex flex-col justify-between rounded-3xl border border-border bg-card p-6 shadow-soft space-y-4">
            <div>
              <span className="font-display text-xs font-extrabold text-primary uppercase tracking-wider block mb-3">Live Preview</span>
              
              {/* Collection Banner Card style */}
              <div className="relative group overflow-hidden rounded-3xl bg-stone-900 shadow-soft h-[150px] mx-auto flex flex-col items-center justify-center text-center w-full border border-border">
                {currentCollection.bg ? (
                  <div className="absolute inset-0 h-full w-full">
                    <img
                      src={getImageUrl(currentCollection.bg)}
                      alt="Live Preview"
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/45 transition-colors duration-500 group-hover:bg-black/55" />
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center text-zinc-500 text-xs font-mono uppercase tracking-widest">
                    No Image Configured
                  </div>
                )}
                
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 z-10">
                  <h3 className="font-display text-xl font-black text-white tracking-wider uppercase drop-shadow-md">
                    SHOP {currentCollection.title}
                  </h3>
                </div>
              </div>
            </div>
          </div>

          {/* Inputs Form */}
          <div className="md:col-span-7 rounded-3xl border border-border bg-card p-6 shadow-soft space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Collection Title</label>
                <input
                  required
                  value={currentCollection.title}
                  onChange={(e) => updateCollectionField(selectedCollectionIdx, "title", e.target.value)}
                  className="input-field"
                  placeholder="e.g. SPORTS"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Link URL</label>
                <input
                  required
                  value={currentCollection.to || "/shop"}
                  onChange={(e) => updateCollectionField(selectedCollectionIdx, "to", e.target.value)}
                  className="input-field"
                  placeholder="e.g. /shop"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Collection Filter (Optional)</label>
                <input
                  value={currentCollection.search?.collection || ""}
                  onChange={(e) => updateCollectionField(selectedCollectionIdx, "search", { collection: e.target.value })}
                  className="input-field"
                  placeholder="e.g. Sports (leave empty to use title)"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Background Image</label>
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  <input
                    required
                    value={currentCollection.bg || ""}
                    onChange={(e) => updateCollectionField(selectedCollectionIdx, "bg", e.target.value)}
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
                      onChange={(e) => handleCollectionFileChange(e, selectedCollectionIdx)}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
