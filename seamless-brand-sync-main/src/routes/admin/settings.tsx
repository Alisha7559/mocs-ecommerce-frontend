import { createFileRoute, useBlocker } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Save, Plus, Trash2, Sliders, Image, Sparkles, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { apiClient, API_BASE_URL } from "@/lib/api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({
    meta: [
      { title: "Global Settings — MOCS Admin" },
    ],
  }),
  component: AdminSettingsPage,
});

function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Hero Slides state
  const [heroSlides, setHeroSlides] = useState<any[]>([]);
  const [originalSlides, setOriginalSlides] = useState<any[]>([]);
  const [openFocusIdx, setOpenFocusIdx] = useState<number | null>(null);

  // Categories Section Banners
  const [categoriesBanners, setCategoriesBanners] = useState<any[]>([
    {
      key: "main",
      title: "We Are MOCS",
      desc: "Awesome, clean & creative footwear collections engineered for everyday agility, comfort, and style.",
      cta: "Purchase Now!",
      to: "/shop",
      bg: ""
    },
    {
      key: "women",
      title: "Women",
      desc: "Best Footwear For Women",
      cta: "Discover More",
      to: "/shop",
      search: { category: "Women" },
      bg: ""
    },
    {
      key: "men",
      title: "Men",
      desc: "Best Collections For Men",
      cta: "Discover More",
      to: "/shop",
      search: { category: "Men" },
      bg: ""
    },
    {
      key: "kids",
      title: "Kids",
      desc: "Best Shoes For Kids",
      cta: "Discover More",
      to: "/shop",
      search: { category: "Kids" },
      bg: ""
    },
    {
      key: "trending",
      title: "Trending",
      desc: "Best Trend Collections",
      cta: "Discover More",
      to: "/shop",
      search: { collection: "Trending" },
      bg: ""
    }
  ]);

  const [originalCategoriesBanners, setOriginalCategoriesBanners] = useState<any[]>([
    {
      key: "main",
      title: "We Are MOCS",
      desc: "Awesome, clean & creative footwear collections engineered for everyday agility, comfort, and style.",
      cta: "Purchase Now!",
      to: "/shop",
      bg: ""
    },
    {
      key: "women",
      title: "Women",
      desc: "Best Footwear For Women",
      cta: "Discover More",
      to: "/shop",
      search: { category: "Women" },
      bg: ""
    },
    {
      key: "men",
      title: "Men",
      desc: "Best Collections For Men",
      cta: "Discover More",
      to: "/shop",
      search: { category: "Men" },
      bg: ""
    },
    {
      key: "kids",
      title: "Kids",
      desc: "Best Shoes For Kids",
      cta: "Discover More",
      to: "/shop",
      search: { category: "Kids" },
      bg: ""
    },
    {
      key: "trending",
      title: "Trending",
      desc: "Best Trend Collections",
      cta: "Discover More",
      to: "/shop",
      search: { collection: "Trending" },
      bg: ""
    }
  ]);

  // Collections Section Banners
  const [collectionsBanners, setCollectionsBanners] = useState<any[]>([
    { key: "sports", title: "Sports", bg: "" },
    { key: "casual", title: "Casual", bg: "" },
    { key: "formal", title: "Formal", bg: "" }
  ]);

  const [originalCollectionsBanners, setOriginalCollectionsBanners] = useState<any[]>([
    { key: "sports", title: "Sports", bg: "" },
    { key: "casual", title: "Casual", bg: "" },
    { key: "formal", title: "Formal", bg: "" }
  ]);

  //  Collage Section Banners
  const [promiseCollage, setPromiseCollage] = useState<any[]>([]);
  const [originalPromiseCollage, setOriginalPromiseCollage] = useState<any[]>([]);
  const [selectedPromiseIdx, setSelectedPromiseIdx] = useState(0);

  const [selectedBannerIdx, setSelectedBannerIdx] = useState(0);
  const [selectedCollectionIdx, setSelectedCollectionIdx] = useState(0);

  const [activeSection, setActiveSection] = useState("hero-slideshow");

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = 140; // sticky header offset
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
      setActiveSection(id);
    }
  };

  useEffect(() => {
    if (loading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.2, rootMargin: "-80px 0px -50% 0px" }
    );

    const sections = ["hero-slideshow", "promo-banner", "collections-banners", "promise-collage"];
    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [loading]);

  const isDirty =
    JSON.stringify(heroSlides) !== JSON.stringify(originalSlides) ||
    JSON.stringify(categoriesBanners) !== JSON.stringify(originalCategoriesBanners) ||
    JSON.stringify(collectionsBanners) !== JSON.stringify(originalCollectionsBanners) ||
    JSON.stringify(promiseCollage) !== JSON.stringify(originalPromiseCollage);

  const blocker = useBlocker({
    shouldBlockFn: () => isDirty,
    withResolver: true,
  });

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "You have unsaved changes in settings.";
        return e.returnValue;
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const heroRes = await apiClient.settings.get("hero_slides").catch(() => null);
        const bannerRes = await apiClient.settings.get("categories_banners").catch(() => null);
        const collectionsRes = await apiClient.settings.get("collections_banners").catch(() => null);
        const promiseRes = await apiClient.settings.get("promise_collage").catch(() => null);

        if (heroRes && Array.isArray(heroRes.value)) {
          setHeroSlides(heroRes.value);
          setOriginalSlides(JSON.parse(JSON.stringify(heroRes.value)));
        } else {
          const fallbacks = [
            {
              eyebrow: "Premium Comfort",
              title: "Step Into Style",
              subtitle: "Explore the new MOCS lifestyle sneaker collection.",
              cta: "Shop Men",
              to: "/shop",
              bg: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1920",
              mobileFocus: "center"
            }
          ];
          setHeroSlides(fallbacks);
          setOriginalSlides(JSON.parse(JSON.stringify(fallbacks)));
        }

        if (bannerRes && bannerRes.value && Array.isArray(bannerRes.value) && bannerRes.value.length === 5) {
          setCategoriesBanners(bannerRes.value);
          setOriginalCategoriesBanners(JSON.parse(JSON.stringify(bannerRes.value)));
        }

        const defaultCollections = [
          { key: "sports", title: "SPORTS", bg: "https://images.unsplash.com/photo-1517649763962-0c623066013b", to: "/shop", search: { collection: "Sports" } },
          { key: "casual", title: "CASUAL", bg: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77", to: "/shop", search: { collection: "Casual" } },
          { key: "formal", title: "FORMAL", bg: "https://images.unsplash.com/photo-1486308512493-ae6a625e368a", to: "/shop", search: { collection: "Formal" } }
        ];
        if (collectionsRes && collectionsRes.value && Array.isArray(collectionsRes.value)) {
          setCollectionsBanners(collectionsRes.value);
          setOriginalCollectionsBanners(JSON.parse(JSON.stringify(collectionsRes.value)));
        } else {
          setCollectionsBanners(defaultCollections);
          setOriginalCollectionsBanners(JSON.parse(JSON.stringify(defaultCollections)));
        }

        const defaultPromiseCollage = [
          {
            key: "top-left",
            title: "Top Left Image",
            to: "/shop",
            bg: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=800"
          },
          {
            key: "bottom-left",
            subtitle: "CONFIDENCE",
            title: "Feoro Woman Power",
            desc: "Bold heels & elegant flats for the woman who leads.",
            cta: "Explore",
            to: "/shop",
            bg: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800"
          },
          {
            key: "right",
            title: "Right Side Image",
            to: "/shop",
            bg: "https://images.unsplash.com/photo-1539185441755-769473a23570?q=80&w=800"
          }
        ];
        if (promiseRes && promiseRes.value && Array.isArray(promiseRes.value) && promiseRes.value.length > 0) {
          setPromiseCollage(promiseRes.value);
          setOriginalPromiseCollage(JSON.parse(JSON.stringify(promiseRes.value)));
        } else {
          setPromiseCollage(defaultPromiseCollage);
          setOriginalPromiseCollage(JSON.parse(JSON.stringify(defaultPromiseCollage)));
        }
      } catch (err: any) {
        toast.error("Failed to load settings from server");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await apiClient.settings.update("hero_slides", heroSlides);
      await apiClient.settings.update("categories_banners", categoriesBanners);
      await apiClient.settings.update("collections_banners", collectionsBanners);
      await apiClient.settings.update("promise_collage", promiseCollage);
      setOriginalSlides(JSON.parse(JSON.stringify(heroSlides)));
      setOriginalCategoriesBanners(JSON.parse(JSON.stringify(categoriesBanners)));
      setOriginalCollectionsBanners(JSON.parse(JSON.stringify(collectionsBanners)));
      setOriginalPromiseCollage(JSON.parse(JSON.stringify(promiseCollage)));
      toast.success("Settings updated successfully!");
      return true;
    } catch (err: any) {
      toast.error(err?.message || "Failed to save settings");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const addPromiseBanner = () => {
    setPromiseCollage([
      ...promiseCollage,
      {
        key: `promise-${Date.now()}`,
        title: "New Collage Card",
        bg: "",
        to: "/shop"
      }
    ]);
    setSelectedPromiseIdx(promiseCollage.length);
  };

  const removePromiseBanner = (idx: number) => {
    const nextList = promiseCollage.filter((_, i) => i !== idx);
    setPromiseCollage(nextList);
    setSelectedPromiseIdx(Math.max(0, idx - 1));
  };

  const updatePromiseField = (idx: number, field: string, value: any) => {
    setPromiseCollage(
      promiseCollage.map((b, i) => (i === idx ? { ...b, [field]: value } : b))
    );
  };

  const handlePromiseFileChange = async (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      toast.loading("Uploading image...", { id: `promise-upload-${idx}` });
      const token = localStorage.getItem("mocs_token");
      const res = await fetch(`${API_BASE_URL}/api/products/upload`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      const data = await res.json();
      updatePromiseField(idx, "bg", data.url);
      toast.success("Image uploaded successfully!", { id: `promise-upload-${idx}` });
    } catch (err: any) {
      console.error(err);
      toast.dismiss(`promise-upload-${idx}`);
      toast.error("Failed to upload image", { id: `promise-upload-${idx}` });
    }
  };

  const handleBannerFileChange = async (e: React.ChangeEvent<HTMLInputElement>, bannerIdx: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      toast.loading("Uploading background image...", { id: `banner-upload-${bannerIdx}` });
      const token = localStorage.getItem("mocs_token");
      const res = await fetch(`${API_BASE_URL}/api/products/upload`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      const data = await res.json();
      updateBannerField(bannerIdx, "bg", data.url);
      toast.success("Banner background image uploaded successfully!", { id: `banner-upload-${bannerIdx}` });
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to upload banner image", { id: `banner-upload-${bannerIdx}` });
    }
  };

  const updateBannerField = (idx: number, field: string, value: any) => {
    setCategoriesBanners(
      categoriesBanners.map((b, i) => (i === idx ? { ...b, [field]: value } : b))
    );
  };

  const handleHeroFileChange = async (e: React.ChangeEvent<HTMLInputElement>, slideIdx: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      toast.loading("Uploading background image...", { id: `hero-upload-${slideIdx}` });
      const token = localStorage.getItem("mocs_token");
      const res = await fetch(`${API_BASE_URL}/api/products/upload`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      const data = await res.json();
      updateHeroSlideField(slideIdx, "bg", data.url);
      toast.success("Hero slide image uploaded successfully!", { id: `hero-upload-${slideIdx}` });
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to upload hero image", { id: `hero-upload-${slideIdx}` });
    }
  };

  const handleCollectionFileChange = async (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      toast.loading("Uploading background image...", { id: `collection-upload-${idx}` });
      const token = localStorage.getItem("mocs_token");
      const res = await fetch(`${API_BASE_URL}/api/products/upload`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      const data = await res.json();
      updateCollectionField(idx, "bg", data.url);
      toast.success("Collection background image uploaded successfully!", { id: `collection-upload-${idx}` });
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to upload collection image", { id: `collection-upload-${idx}` });
    }
  };

  const updateCollectionField = (idx: number, field: string, value: any) => {
    setCollectionsBanners(
      collectionsBanners.map((c, i) => (i === idx ? { ...c, [field]: value } : c))
    );
  };

  const addCollectionBanner = () => {
    setCollectionsBanners([
      ...collectionsBanners,
      {
        key: `collection-${Date.now()}`,
        title: "NEW COLLECTION",
        bg: "",
        to: "/shop",
        search: { collection: "" }
      }
    ]);
    setSelectedCollectionIdx(collectionsBanners.length);
  };

  const removeCollectionBanner = (idx: number) => {
    const nextList = collectionsBanners.filter((_, i) => i !== idx);
    setCollectionsBanners(nextList);
    setSelectedCollectionIdx(Math.max(0, idx - 1));
  };

  const addHeroSlide = () => {
    setHeroSlides([
      ...heroSlides,
      {
        eyebrow: "New Arrival",
        title: "Model Name",
        subtitle: "Fresh colors and premium quality mesh details.",
        cta: "Explore Now",
        to: "/shop",
        bg: "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
        mobileFocus: "center"
      }
    ]);
  };

  const removeHeroSlide = (idx: number) => {
    setHeroSlides(heroSlides.filter((_, i) => i !== idx));
  };

  const updateHeroSlideField = (idx: number, field: string, value: string) => {
    setHeroSlides(
      heroSlides.map((slide, i) => (i === idx ? { ...slide, [field]: value } : slide))
    );
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 text-left relative">
      <div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">Global Configurations</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">Manage Hero slideshow assets and category banners.</p>
      </div>

      {/* Sticky Sub-Navigation Tabs */}
      <div className="sticky top-[58px] sm:top-[70px] z-30 bg-background/90 backdrop-blur-md border-b border-border py-3 flex gap-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => scrollToSection("hero-slideshow")}
          className={cn(
            "flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold uppercase transition-all cursor-pointer whitespace-nowrap",
            activeSection === "hero-slideshow"
              ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20 scale-105"
              : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          Hero Slideshow
        </button>
        <button
          onClick={() => scrollToSection("promo-banner")}
          className={cn(
            "flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold uppercase transition-all cursor-pointer whitespace-nowrap",
            activeSection === "promo-banner"
              ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20 scale-105"
              : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          Collection Banners
        </button>
        <button
          onClick={() => scrollToSection("collections-banners")}
          className={cn(
            "flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold uppercase transition-all cursor-pointer whitespace-nowrap",
            activeSection === "collections-banners"
              ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20 scale-105"
              : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          Collections Section
        </button>
        <button
          onClick={() => scrollToSection("promise-collage")}
          className={cn(
            "flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold uppercase transition-all cursor-pointer whitespace-nowrap",
            activeSection === "promise-collage"
              ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20 scale-105"
              : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
           Collage
        </button>
      </div>

      <div className="space-y-6">
        <div id="hero-slideshow" className="flex items-center justify-between border-b border-border pb-3 scroll-mt-24">
          <h2 className="font-display text-lg font-bold">
            Hero Slideshow
          </h2>
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
        </div>        {/* Brand Banner Section Config */}
        <div id="promo-banner" className="space-y-6 pt-6 border-t border-border scroll-mt-24 font-sans">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold">
              Category Section Banners 
            </h2>
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

          {(() => {
            const currentBanner = categoriesBanners[selectedBannerIdx] || { title: "", to: "", bg: "", desc: "", cta: "" };

            return (
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
                              src={
                                currentBanner.bg.startsWith("/")
                                  ? `${API_BASE_URL}${currentBanner.bg}`
                                  : currentBanner.bg
                              }
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
                              src={
                                currentBanner.bg.startsWith("/")
                                  ? `${API_BASE_URL}${currentBanner.bg}`
                                  : currentBanner.bg
                              }
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
            );
          })()}
        </div>

        {/* Collections Section Config */}
        <div id="collections-banners" className="space-y-6 pt-6 border-t border-border scroll-mt-24 font-sans">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold">
              Collections Section Banners
            </h2>
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

          {(() => {
            const currentCollection = collectionsBanners[selectedCollectionIdx];
            if (!currentCollection) return null;

            return (
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
                            src={
                              currentCollection.bg.startsWith("/")
                                ? `${API_BASE_URL}${currentCollection.bg}`
                                : currentCollection.bg
                            }
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
            );
          })()}
        </div>

        {/*  Collage Section Config */}
        <div id="promise-collage" className="space-y-6 pt-6 border-t border-border scroll-mt-24 font-sans">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold">
              Promise Section Collage Cards
            </h2>
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

          {(() => {
            const currentBanner = promiseCollage[selectedPromiseIdx] || { title: "", to: "", bg: "", desc: "", cta: "", subtitle: "" };

            return (
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
                                  src={item.bg.startsWith("/") ? `${API_BASE_URL}${item.bg}` : item.bg}
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
            );
          })()}
        </div>

        <div className="flex justify-end pt-4">
          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-sm font-bold uppercase text-primary-foreground transition hover:bg-primary-glow cursor-pointer disabled:opacity-60"
          >
            <Save className="h-4.5 w-4.5" /> {saving ? "Saving Changes..." : "Save Settings"}
          </button>
        </div>
      </div>

      {/* Centered Route Leave Blocker Modal */}
      {blocker.status === "blocked" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-card space-y-4 text-left">
            <h3 className="font-display text-lg font-bold text-foreground">Unsaved Changes</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You have modified global configuration parameters. Would you like to save these changes before leaving the page?
            </p>
            <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-end">
              <button
                onClick={() => {
                  blocker.reset();
                }}
                className="rounded-full border border-border bg-background px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition hover:bg-accent cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setHeroSlides(originalSlides);
                  setCategoriesBanners(originalCategoriesBanners);
                  setCollectionsBanners(originalCollectionsBanners);
                  setPromiseCollage(originalPromiseCollage);
                  blocker.proceed();
                }}
                className="rounded-full border border-destructive/30 bg-destructive/10 text-destructive px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition hover:bg-destructive/20 cursor-pointer"
              >
                Discard & Leave
              </button>
              <button
                onClick={async () => {
                  const saved = await handleSaveSettings();
                  if (saved) {
                    blocker.proceed();
                  } else {
                    blocker.reset();
                  }
                }}
                className="rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition hover:bg-primary-glow cursor-pointer"
              >
                Save & Leave
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
