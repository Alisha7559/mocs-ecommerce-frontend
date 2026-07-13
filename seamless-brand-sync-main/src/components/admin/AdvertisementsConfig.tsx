import { Plus, Trash2, Image, Eye, X } from "lucide-react";
import { useState } from "react";

interface AdvertisementsConfigProps {
  advertisements: string[];
  addAdsImageByUrl: (url: string) => void;
  removeAdsImage: (idx: number) => void;
  handleAdsFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  getImageUrl: (url: string) => string;
}

export function AdvertisementsConfig({
  advertisements,
  addAdsImageByUrl,
  removeAdsImage,
  handleAdsFileChange,
  getImageUrl,
}: AdvertisementsConfigProps) {
  const [urlInput, setUrlInput] = useState("");
  const [viewImage, setViewImage] = useState<string | null>(null);

  const handleAddUrl = () => {
    if (!urlInput.trim()) return;
    addAdsImageByUrl(urlInput.trim());
    setUrlInput("");
  };

  return (
    <div id="advertisements" className="space-y-6 pt-6 border-t border-border scroll-mt-24 font-sans text-left">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-bold">Homepage Advertisements</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage promotional banner images displayed on the homepage below collections.
          </p>
        </div>

        {/* Upload Buttons */}
        <div className="flex items-center gap-3">
          <label className="flex h-10 px-4 items-center justify-center rounded-full border border-dashed border-border hover:border-primary bg-muted/20 hover:bg-muted/40 transition text-xs font-bold cursor-pointer whitespace-nowrap gap-1">
            <Image className="h-4 w-4" />
            <span>Upload Image</span>
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleAdsFileChange}
            />
          </label>
        </div>
      </div>

      {/* Paste URL Bar */}
      <div className="flex gap-3 max-w-2xl bg-card border border-border p-2 rounded-2xl shadow-xs">
        <input
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          className="flex-1 bg-transparent px-3 text-xs outline-none"
          placeholder="Or paste image URL directly (e.g. https://...)"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAddUrl();
          }}
        />
        <button
          type="button"
          onClick={handleAddUrl}
          className="flex items-center gap-1 bg-primary text-primary-foreground px-4 py-2 text-xs font-bold uppercase rounded-xl transition hover:brightness-110 cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" /> Add URL
        </button>
      </div>

      {/* Grid of Advertisements */}
      {advertisements.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center text-muted-foreground text-xs font-medium">
          No advertisements configured. Upload some images to display them on the homepage.
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          {advertisements.map((imgUrl, idx) => (
            <div
              key={idx}
              className="relative group rounded-3xl overflow-hidden border border-border bg-stone-900 shadow-soft h-[220px] flex items-center justify-center text-center"
            >
              {imgUrl ? (
                <>
                  <img
                    src={getImageUrl(imgUrl)}
                    alt={`Advertisement #${idx + 1}`}
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-350 z-10 flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => setViewImage(imgUrl)}
                      className="rounded-full bg-white/20 backdrop-blur-md border border-white/20 p-3 text-white transition hover:bg-white/40 cursor-pointer shadow-lg hover:scale-110"
                      title="View Full Image"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeAdsImage(idx)}
                      className="rounded-full bg-destructive p-3 text-white transition hover:bg-destructive/85 cursor-pointer shadow-lg hover:scale-110"
                      title="Delete Advertisement"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-zinc-500 text-xs font-mono uppercase tracking-widest">
                  Loading...
                </div>
              )}
              {/* Badge label */}
              <div className="absolute top-3 left-3 bg-stone-950/80 text-white border border-white/10 px-3 py-1 rounded-full text-[10px] font-bold z-10">
                Ad #{idx + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Full Image View Modal */}
      {viewImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 animate-in fade-in duration-200">
          <div className="relative max-w-4xl max-h-[85vh] overflow-hidden rounded-3xl bg-transparent border border-white/10 shadow-2xl flex items-center justify-center">
            <img
              src={getImageUrl(viewImage)}
              alt="Full Size View"
              className="max-w-full max-h-[85vh] object-contain rounded-3xl select-none"
            />
            <button
              onClick={() => setViewImage(null)}
              className="absolute top-4 right-4 rounded-full bg-black/60 backdrop-blur-md p-2.5 text-white hover:bg-black/80 transition-all hover:scale-105 border border-white/10 shadow-lg cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
