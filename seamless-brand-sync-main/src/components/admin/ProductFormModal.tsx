import React, { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { AdminDropdown } from "@/components/admin/AdminShell";
import { apiClient, API_BASE_URL, getToken } from "@/lib/api";
import { toast } from "sonner";
import { cn, getImageUrl } from "@/lib/utils";

const colorList = [
  { name: "Black", hex: "#000000" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Red", hex: "#DC2626" },
  { name: "Blue", hex: "#2563EB" },
  { name: "Green", hex: "#16A34A" },
  { name: "Yellow", hex: "#FACC15" },
  { name: "Orange", hex: "#F97316" },
  { name: "Solar Orange", hex: "#F46A1E" },
  { name: "Purple", hex: "#8B5CF6" },
  { name: "Pink", hex: "#EC4899" },
  { name: "Grey", hex: "#6B7280" },
  { name: "Brown", hex: "#78350F" },
  { name: "Navy Blue", hex: "#1E3A8A" },
  { name: "Teal", hex: "#0D9488" },
  { name: "Indigo", hex: "#4F46E5" },
  { name: "Lime", hex: "#84CC16" },
  { name: "Cyan", hex: "#06B6D4" },
  { name: "Olive", hex: "#808000" },
  { name: "Maroon", hex: "#800000" },
  { name: "Beige", hex: "#F5F5DC" },
  { name: "Cream", hex: "#FFFDD0" },
  { name: "Silver", hex: "#C0C0C0" },
  { name: "Gold", hex: "#FFD700" },
];

function hexToRgb(hex: string) {
  const cleanHex = hex.replace("#", "");
  let r = 0, g = 0, b = 0;
  if (cleanHex.length === 3) {
    r = parseInt(cleanHex[0] + cleanHex[0], 16);
    g = parseInt(cleanHex[1] + cleanHex[1], 16);
    b = parseInt(cleanHex[2] + cleanHex[2], 16);
  } else if (cleanHex.length === 6) {
    r = parseInt(cleanHex.substring(0, 2), 16);
    g = parseInt(cleanHex.substring(2, 4), 16);
    b = parseInt(cleanHex.substring(4, 6), 16);
  }
  return { r, g, b };
}

function getClosestColorName(hex: string): string {
  try {
    const { r, g, b } = hexToRgb(hex);
    let minDistance = Infinity;
    let closestName = "Custom Color";
    
    for (const color of colorList) {
      const target = hexToRgb(color.hex);
      const distance = Math.sqrt(
        Math.pow(r - target.r, 2) +
        Math.pow(g - target.g, 2) +
        Math.pow(b - target.b, 2)
      );
      if (distance < minDistance) {
        minDistance = distance;
        closestName = color.name;
      }
    }
    return closestName;
  } catch (err) {
    return "Custom Color";
  }
}

function getHexFromColorName(name: string): string | null {
  const normalized = name.toLowerCase().trim();
  const match = colorList.find(c => c.name.toLowerCase() === normalized);
  if (match) return match.hex;
  
  const substringMatch = colorList.find(c => normalized.includes(c.name.toLowerCase()));
  if (substringMatch) return substringMatch.hex;
  
  return null;
}

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingProduct: any;
  artNumber: string;
  setArtNumber: (val: string) => void;
  name: string;
  setName: (val: string) => void;
  collection: string;
  setCollection: (val: string) => void;
  price: string;
  setPrice: (val: string) => void;
  oldPrice: string;
  setOldPrice: (val: string) => void;
  categoryId: string;
  setCategoryId: (val: string) => void;
  description: string;
  setDescription: (val: string) => void;
  sizesStr: string;
  setSizesStr: (val: string) => void;
  outOfStockSizesStr: string;
  setOutOfStockSizesStr: (val: string) => void;
  shades: any[];
  setShades: (shades: any[]) => void;
  activeShadeIndex: number;
  setActiveShadeIndex: (idx: number) => void;
  isPublished: boolean;
  setIsPublished: (val: boolean) => void;
  isNewProduct: boolean;
  setIsNewProduct: (val: boolean) => void;
  categories: any[];
  handleSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
}

export function ProductFormModal({
  isOpen,
  onClose,
  editingProduct,
  artNumber,
  setArtNumber,
  name,
  setName,
  collection,
  setCollection,
  price,
  setPrice,
  oldPrice,
  setOldPrice,
  categoryId,
  setCategoryId,
  description,
  setDescription,
  sizesStr,
  setSizesStr,
  outOfStockSizesStr,
  setOutOfStockSizesStr,
  shades,
  setShades,
  activeShadeIndex,
  setActiveShadeIndex,
  isPublished,
  setIsPublished,
  isNewProduct,
  setIsNewProduct,
  categories,
  handleSubmit,
  submitting,
}: ProductFormModalProps) {
  if (!isOpen) return null;

  const capitalize = (str: string) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, onUploaded: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      toast.loading("Uploading image file...", { id: "image-upload" });
      const token = getToken();
      const res = await fetch(`${API_BASE_URL}/api/products/upload`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      onUploaded(data.url);
      toast.success("Image uploaded successfully!", { id: "image-upload" });
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to upload image file", { id: "image-upload" });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-secondary/80 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-4xl rounded-3xl border border-border bg-card p-6 shadow-card animate-in fade-in zoom-in-95 duration-200 my-8">
        <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
          <h3 className="font-display text-xl font-bold">
            {editingProduct ? `Edit catalog product: ${editingProduct.name}` : "Create New Footwear Catalog Product"}
          </h3>
          <button onClick={onClose} className="rounded-full p-1.5 hover:bg-accent text-muted-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 text-left">
          {/* Base Product Info */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Article Number (Unique ID)</label>
              <input
                required
                disabled={!!editingProduct}
                value={artNumber}
                onChange={(e) => setArtNumber(e.target.value)}
                className="input-field"
                placeholder="e.g. MOCS-01"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Product Name</label>
              <input
                required
                value={name}
                onChange={(e) => setName(capitalize(e.target.value))}
                className="input-field"
                placeholder="e.g. Lunar Glide Runner"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Base Price (INR)</label>
              <input
                required
                type="number"
                min={0}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="input-field"
                placeholder="e.g. 5999"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Base Strike Price (Old Price, Optional)</label>
              <input
                type="number"
                min={0}
                value={oldPrice}
                onChange={(e) => setOldPrice(e.target.value)}
                className="input-field"
                placeholder="e.g. 8999"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Fulfillment Category</label>
              <AdminDropdown
                value={categoryId}
                onChange={setCategoryId}
                className="w-full"
                options={categories.map((c) => ({ value: c._id, label: c.name }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Collection Title</label>
              <input
                required
                value={collection}
                onChange={(e) => setCollection(capitalize(e.target.value))}
                className="input-field"
                placeholder="e.g. Performance"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Default Sizes (Comma-separated)</label>
              <input
                required
                value={sizesStr}
                onChange={(e) => setSizesStr(e.target.value)}
                className="input-field"
                placeholder="e.g. 7,8,9,10,11,12"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Out of Stock Sizes (Comma-separated)</label>
              <input
                value={outOfStockSizesStr}
                onChange={(e) => setOutOfStockSizesStr(e.target.value)}
                className="input-field border-amber-500/20 focus:border-amber-500"
                placeholder="e.g. 8,10 (leave blank if all in stock)"
              />
            </div>
            <div className="sm:col-span-3">
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Base Product Description</label>
              <textarea
                required
                rows={2}
                value={description}
                onChange={(e) => setDescription(capitalize(e.target.value))}
                className="input-field resize-none"
                placeholder="Describe this silhouette..."
              />
            </div>
          </div>

          {/* Color shade section */}
          <div className="border-t border-border pt-4">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="font-display text-sm font-bold uppercase tracking-wider text-primary">Color shades & stock inventory</h4>
              <button
                type="button"
                onClick={() => {
                  setShades([
                    ...shades,
                    {
                      id: `new-${Date.now()}`,
                      colorName: "",
                      colorHex: "#000000",
                      coverImage: "",
                      additionalImages: [
                        { label: "Front", url: "" },
                        { label: "Side", url: "" },
                        { label: "Back", url: "" },
                        { label: "Sole", url: "" },
                      ],
                      stock: "10",
                      isPublished: true,
                      isNew: false,
                      price: "",
                      oldPrice: "",
                      sizesStr: "",
                      description: "",
                    }
                  ]);
                  setActiveShadeIndex(shades.length);
                }}
                className="rounded-full border border-dashed border-primary/45 hover:border-primary px-3 py-1 text-xs font-bold text-primary hover:bg-primary/5 transition cursor-pointer"
              >
                + Add Color Shade
              </button>
            </div>

            {shades.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">No color shades added yet. Click "+ Add Color Shade" to configure inventory.</p>
            ) : (
              <div className="space-y-4">
                {/* Shade tabs */}
                <div className="flex flex-wrap gap-2 pb-2">
                  {shades.map((shade, idx) => (
                    <button
                      key={shade.id || idx}
                      type="button"
                      onClick={() => setActiveShadeIndex(idx)}
                      className={cn(
                        "rounded-xl px-3 py-1.5 text-xs font-semibold transition flex items-center gap-2 border cursor-pointer",
                        activeShadeIndex === idx
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card text-foreground border-border hover:bg-muted"
                      )}
                    >
                      <span className="h-3 w-3 rounded-full border border-border shrink-0" style={{ backgroundColor: shade.colorHex }} />
                      <span className="truncate max-w-[80px]">{shade.colorName || `Shade ${idx + 1}`}</span>
                      {shades.length > 1 && (
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            const newShades = shades.filter((_, i) => i !== idx);
                            setShades(newShades);
                            setActiveShadeIndex(Math.max(0, idx - 1));
                          }}
                          className="text-white/60 hover:text-white hover:bg-white/10 rounded-full px-1 text-[10px] ml-1 cursor-pointer"
                        >
                          &times;
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Active Shade editor form */}
                {shades[activeShadeIndex] && (
                  <div className="space-y-4 p-4 bg-muted/15 border border-border/80 rounded-2xl">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Color Shade Name</label>
                        <input
                          required
                          value={shades[activeShadeIndex].colorName}
                          onChange={(e) => {
                            const val = capitalize(e.target.value);
                            const newShades = [...shades];
                            newShades[activeShadeIndex].colorName = val;
                            const matchedHex = getHexFromColorName(val);
                            if (matchedHex) {
                              newShades[activeShadeIndex].colorHex = matchedHex;
                            }
                            setShades(newShades);
                          }}
                          className="input-field"
                          placeholder="e.g. Solar Orange"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Color Swatch Hex</label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={shades[activeShadeIndex].colorHex}
                            onChange={(e) => {
                              const val = e.target.value;
                              const newShades = [...shades];
                              newShades[activeShadeIndex].colorHex = val;
                              const closestName = getClosestColorName(val);
                              if (closestName !== "Custom Color") {
                                newShades[activeShadeIndex].colorName = closestName;
                              }
                              setShades(newShades);
                            }}
                            className="h-10 w-12 border border-border rounded-xl cursor-pointer bg-background"
                          />
                          <input
                            required
                            value={shades[activeShadeIndex].colorHex}
                            onChange={(e) => {
                              const val = e.target.value;
                              const newShades = [...shades];
                              newShades[activeShadeIndex].colorHex = val;
                              if (/^#([0-9a-fA-F]{3}){1,2}$/.test(val)) {
                                const closestName = getClosestColorName(val);
                                if (closestName !== "Custom Color") {
                                  newShades[activeShadeIndex].colorName = closestName;
                                }
                              }
                              setShades(newShades);
                            }}
                            className="input-field flex-1"
                            placeholder="#F46A1E"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Variant Stock (Units)</label>
                        <input
                          required
                          type="number"
                          min={0}
                          value={shades[activeShadeIndex].stock}
                          onChange={(e) => {
                            const newShades = [...shades];
                            newShades[activeShadeIndex].stock = e.target.value;
                            setShades(newShades);
                          }}
                          className="input-field"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Cover Image (Browse Device)</label>
                        <div className="flex flex-col gap-2">
                          <div className="relative flex items-center justify-center border border-dashed border-primary/30 hover:border-primary bg-primary/5 rounded-xl p-3 text-center cursor-pointer transition group">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileChange(e, (url) => {
                                const newShades = [...shades];
                                newShades[activeShadeIndex].coverImage = url;
                                setShades(newShades);
                              })}
                              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            />
                            <p className="text-xs font-bold text-primary group-hover:text-primary-glow">Click to browse file</p>
                          </div>
                          {shades[activeShadeIndex].coverImage && (
                            <div className="flex items-center gap-2 rounded-xl border border-border p-2 bg-background">
                              <img
                                src={getImageUrl(shades[activeShadeIndex].coverImage)}
                                className="h-8 w-8 object-cover rounded"
                              />
                              <span className="text-[10px] truncate max-w-[150px] font-medium text-muted-foreground">
                                {shades[activeShadeIndex].coverImage}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Price (INR, Optional override)</label>
                        <input
                          type="number"
                          min={0}
                          value={shades[activeShadeIndex].price || ""}
                          onChange={(e) => {
                            const newShades = [...shades];
                            newShades[activeShadeIndex].price = e.target.value;
                            setShades(newShades);
                          }}
                          className="input-field"
                          placeholder="Uses base product price"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Old Price (INR, Optional override)</label>
                        <input
                          type="number"
                          min={0}
                          value={shades[activeShadeIndex].oldPrice || ""}
                          onChange={(e) => {
                            const newShades = [...shades];
                            newShades[activeShadeIndex].oldPrice = e.target.value;
                            setShades(newShades);
                          }}
                          className="input-field"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Description (Optional override)</label>
                        <textarea
                          rows={2}
                          value={shades[activeShadeIndex].description || ""}
                          onChange={(e) => {
                            const newShades = [...shades];
                            newShades[activeShadeIndex].description = capitalize(e.target.value);
                            setShades(newShades);
                          }}
                          className="input-field resize-none"
                        />
                      </div>
                    </div>

                    {/* Galleries */}
                    <div className="border-t border-border/60 pt-3 mt-3">
                      <h5 className="text-xs font-bold text-foreground mb-2">Product Gallery views for active shade</h5>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {shades[activeShadeIndex].additionalImages.map((img: any, imgIdx: number) => (
                          <div key={imgIdx} className="flex flex-col gap-2 rounded-xl border border-border p-3 bg-background/50">
                            <div className="flex gap-2 items-center">
                              <AdminDropdown
                                value={img.label}
                                onChange={(val) => {
                                  const newShades = [...shades];
                                  newShades[activeShadeIndex].additionalImages[imgIdx].label = val;
                                  setShades(newShades);
                                }}
                                className="w-[100px] shrink-0"
                                options={["Front", "Side", "Back", "Top", "Sole", "Lifestyle"].map((lbl) => ({ value: lbl, label: lbl }))}
                              />
                              <div className="relative flex-1 flex items-center justify-center border border-dashed border-primary/30 hover:border-primary bg-primary/5 rounded-xl py-1 text-center cursor-pointer transition group">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleFileChange(e, (url) => {
                                    const newShades = [...shades];
                                    newShades[activeShadeIndex].additionalImages[imgIdx].url = url;
                                    setShades(newShades);
                                  })}
                                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                />
                                <span className="text-[10px] font-bold text-primary group-hover:text-primary-glow">Browse file</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const newShades = [...shades];
                                  newShades[activeShadeIndex].additionalImages = newShades[activeShadeIndex].additionalImages.filter((_: any, i: number) => i !== imgIdx);
                                  setShades(newShades);
                                }}
                                className="p-1 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-lg transition"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            {img.url && (
                              <div className="flex items-center gap-2 rounded-lg border border-border/40 p-1 bg-background">
                                <img src={getImageUrl(img.url)} className="h-5 w-5 object-cover rounded" />
                                <span className="text-[9px] truncate text-muted-foreground flex-1">{img.url}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 flex justify-end">
                        {shades[activeShadeIndex].additionalImages.length < 8 && (
                          <button
                            type="button"
                            onClick={() => {
                              const newShades = [...shades];
                              newShades[activeShadeIndex].additionalImages.push({ label: "Side", url: "" });
                              setShades(newShades);
                            }}
                            className="text-[10px] font-bold text-primary hover:text-primary-glow border border-primary/20 px-3 py-1 rounded-full transition cursor-pointer"
                          >
                            + Add Image Field
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Published and Feature states */}
          <div className="flex flex-wrap gap-4 border-t border-border pt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} className="h-4.5 w-4.5 accent-primary" />
              <span className="text-sm font-semibold text-foreground">Publish immediately (visible to customers)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={isNewProduct} onChange={(e) => setIsNewProduct(e.target.checked)} className="h-4.5 w-4.5 accent-primary" />
              <span className="text-sm font-semibold text-foreground">Highlight as "New Arrival"</span>
            </label>
          </div>

          <div className="flex gap-3 justify-end pt-2 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-border bg-background px-6 py-2.5 text-sm font-bold uppercase tracking-wider transition hover:bg-accent cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-primary px-6 py-2.5 text-sm font-bold uppercase tracking-wider text-primary-foreground transition hover:bg-primary-glow disabled:opacity-50 cursor-pointer"
            >
              {submitting ? "Saving..." : "Save Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
