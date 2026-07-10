import { Image } from "lucide-react";
import { cn } from "@/lib/utils";

interface AuthConfigProps {
  authSettings: any;
  setAuthSettings: any;
  handleAuthFileChange: (e: React.ChangeEvent<HTMLInputElement>, idx: number) => void;
  getImageUrl: (url: string) => string;
}

export function AuthConfig({
  authSettings,
  setAuthSettings,
  handleAuthFileChange,
  getImageUrl,
}: AuthConfigProps) {
  return (
    <div id="auth-page" className="space-y-6 pt-6 border-t border-border scroll-mt-24 font-sans text-left">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold">Login Images</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-12 items-stretch pt-2">
        {/* Live Previews */}
        <div className="md:col-span-4 flex flex-col justify-between rounded-3xl border border-border bg-card p-5 shadow-soft space-y-4">
          <div>
            <span className="font-display text-xs font-extrabold text-primary uppercase tracking-wider block mb-3">Live Slides Previews</span>
            
            <div className="space-y-3">
              {authSettings.slides?.map((slide: any, idx: number) => (
                <div key={idx} className="relative group overflow-hidden rounded-2xl bg-zinc-900 border border-border h-[100px] flex flex-col justify-end p-3">
                  {slide.image ? (
                    <div className="absolute inset-0 h-full w-full">
                      <img
                        src={getImageUrl(slide.image)}
                        alt={`Slide ${idx + 1} Preview`}
                        className="h-full w-full object-cover brightness-[0.7] saturate-[0.8]"
                      />
                      <div className="absolute inset-0 bg-black/40" />
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center text-zinc-500 text-[9px] font-mono uppercase tracking-wider text-center px-2">
                      Fallback Hero / Product Cover
                    </div>
                  )}
                  <div className="relative z-10 text-white space-y-0.5">
                    <span className="text-[7px] bg-primary/20 text-primary border border-primary/20 px-1.5 py-0.5 rounded-full uppercase font-bold tracking-wider w-fit block">Slide {idx + 1}</span>
                    <h4 className="font-display text-xs font-black text-white leading-tight mt-0.5 line-clamp-1">{slide.title || "Title"}</h4>
                    <p className="text-[8px] text-zinc-300 line-clamp-1">{slide.subtitle || "Subtitle..."}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Inputs Form */}
        <div className="md:col-span-8 rounded-3xl border border-border bg-card p-5 shadow-soft space-y-4">
          <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
            {authSettings.slides?.map((slide: any, idx: number) => (
              <div key={idx} className={cn("space-y-3 pb-4", idx < 2 && "border-b border-border/80")}>
                <h3 className="text-xs font-black uppercase text-primary tracking-wider">Auth Visual Slide {idx + 1}</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Heading Title</label>
                    <input
                      required
                      value={slide.title}
                      onChange={(e) => {
                        const newSlides = [...authSettings.slides];
                        newSlides[idx] = { ...newSlides[idx], title: e.target.value };
                        setAuthSettings((prev: any) => ({ ...prev, slides: newSlides }));
                      }}
                      className="input-field"
                      placeholder="e.g. Discover Your Style"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Background Image</label>
                    <div className="flex gap-2 items-center">
                      <input
                        value={slide.image || ""}
                        onChange={(e) => {
                          const newSlides = [...authSettings.slides];
                          newSlides[idx] = { ...newSlides[idx], image: e.target.value };
                          setAuthSettings((prev: any) => ({ ...prev, slides: newSlides }));
                        }}
                        className="input-field flex-1"
                        placeholder="Image URL or blank"
                      />
                      <label className="flex h-11 px-3 items-center justify-center rounded-xl border border-dashed border-border hover:border-primary bg-muted/20 hover:bg-muted/40 transition text-xs font-bold cursor-pointer whitespace-nowrap gap-1">
                        <Image className="h-4 w-4" />
                        <span>Upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={(e) => handleAuthFileChange(e, idx)}
                        />
                      </label>
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Detail Description</label>
                    <textarea
                      rows={2}
                      value={slide.subtitle}
                      onChange={(e) => {
                        const newSlides = [...authSettings.slides];
                        newSlides[idx] = { ...newSlides[idx], subtitle: e.target.value };
                        setAuthSettings((prev: any) => ({ ...prev, slides: newSlides }));
                      }}
                      className="input-field py-2"
                      placeholder="Short marketing text..."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
