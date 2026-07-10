import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ShoppingBag, Search, Plus, Edit3, Trash2, RotateCcw, X, AlertTriangle, Eye, EyeOff, Copy } from "lucide-react";
import { toast } from "sonner";
import { apiClient, API_BASE_URL, getToken } from "@/lib/api";
import { AdminDropdown } from "@/components/admin/AdminShell";
import { cn, getImageUrl } from "@/lib/utils";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/admin/products")({
  head: () => ({
    meta: [
      { title: "Manage Products — MOCS Admin" },
    ],
  }),
  component: AdminProducts,
});

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

function AdminProducts() {
  const router = useRouter();
  const { collections, fetchCollections } = useStore();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [collFilter, setCollFilter] = useState("");
  const [showDeleted, setShowDeleted] = useState("false");
  const [showInactive, setShowInactive] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Add/Edit modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [siblingVariants, setSiblingVariants] = useState<any[]>([]);
  const [shades, setShades] = useState<any[]>([]);
  const [activeShadeIndex, setActiveShadeIndex] = useState(0);
  
  // Form fields
  const [artNumber, setArtNumber] = useState("");
  const [name, setName] = useState("");
  const [collection, setCollection] = useState("Casual");
  const [colorName, setColorName] = useState("Default");
  const [colorHex, setColorHex] = useState("#F46A1E");
  const [price, setPrice] = useState("");
  const [oldPrice, setOldPrice] = useState("");
  const [stock, setStock] = useState("10");
  const [categoryId, setCategoryId] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [additionalImages, setAdditionalImages] = useState<{ label: string; url: string }[]>([]);
  const [description, setDescription] = useState("");
  const [sizesStr, setSizesStr] = useState("7,8,9,10,11,12");
  const [outOfStockSizesStr, setOutOfStockSizesStr] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [isNewProduct, setIsNewProduct] = useState(false);
  const [isTrending, setIsTrending] = useState(false);
  
  // Collection creation & management helper state
  const [manageCollOpen, setManageCollOpen] = useState(false);
  const [newCollName, setNewCollName] = useState("");
  
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<any>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Load categories first if not loaded
      const cats = await apiClient.categories.list().catch(() => []);
      setCategories(cats);

      // Load collections
      await fetchCollections().catch(() => {});

      // Load products
      const queryStr = `search=${encodeURIComponent(search)}&category=${catFilter}&collection=${collFilter}&showDeleted=${showDeleted}&showInactive=${showInactive}&page=${page}&limit=10&sort=-createdAt`;
      const res = await apiClient.products.list(queryStr);
      
      setProducts(res.items);
      setTotalPages(res.pages);
      setTotalItems(res.total);
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to load products list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, catFilter, collFilter, showDeleted, showInactive]);

  useEffect(() => {
    if (!artNumber.trim()) {
      setSiblingVariants([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const queryStr = `artNumber=${encodeURIComponent(artNumber)}&showDeleted=all&showInactive=all&limit=50`;
        const res = await apiClient.products.list(queryStr);
        const filtered = res.items.filter((item: any) => item._id !== editingProduct?._id);
        setSiblingVariants(filtered);
      } catch (err) {
        console.error("Failed to load sibling variants", err);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [artNumber, editingProduct?._id]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchData();
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setArtNumber("");
    setName("");
    setCollection(collections[0]?.name || "Casual");
    setPrice("");
    setOldPrice("");
    setCategoryId(categories[0]?._id || "");
    setDescription("");
    setSizesStr("7,8,9,10,11,12");
    setOutOfStockSizesStr("");
    setIsPublished(true);
    setIsNewProduct(false);
    setIsTrending(false);
    setShades([
      {
        id: `new-${Date.now()}`,
        colorName: "Solar Orange",
        colorHex: "#F46A1E",
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
        isTrending: false,
        price: "",
        oldPrice: "",
        sizesStr: "",
        description: "",
      }
    ]);
    setActiveShadeIndex(0);
    setModalOpen(true);
  };

  const openEditModal = async (product: any) => {
    setEditingProduct(product);
    setArtNumber(product.artNumber || "");
    setName(product.name);
    setCollection(product.collection || "Casual");
    setPrice(String(product.price));
    setOldPrice(product.oldPrice ? String(product.oldPrice) : "");
    setCategoryId(product.category?._id || product.category || "");
    setDescription(product.description || "");
    setSizesStr(product.sizes ? product.sizes.join(",") : "");
    setOutOfStockSizesStr(product.outOfStockSizes ? product.outOfStockSizes.join(",") : "");
    setIsPublished(product.isPublished ?? true);
    setIsNewProduct(product.isNew ?? false);
    setIsTrending(product.isTrending ?? false);
    
    try {
      const queryStr = `artNumber=${encodeURIComponent(product.artNumber)}&showDeleted=all&showInactive=all&limit=50`;
      const res = await apiClient.products.list(queryStr);
      const items = res.items || [];
      const otherVariants = items.filter((item: any) => item._id !== product._id);
      const allItems = [product, ...otherVariants];
      
      const mappedShades = allItems.map((item) => {
        const colorOpt = item.colors?.[0] || { name: "Default", hex: "#000000" };
        const existingImgs = item.additionalImages || [];
        const gallery = existingImgs.map((img: any) => 
          typeof img === "string" ? { label: "Side", url: img } : { label: img.label || "Side", url: img.url || "" }
        );
        while (gallery.length < 4) {
          gallery.push({ label: "Side", url: "" });
        }

        return {
          id: item._id,
          colorName: colorOpt.name,
          colorHex: colorOpt.hex,
          coverImage: item.coverImage || "",
          additionalImages: gallery,
          stock: String(item.stock || 0),
          isPublished: item.isPublished,
          isNew: item.isNew,
          isTrending: item.isTrending || false,
          price: String(item.price || ""),
          oldPrice: item.oldPrice ? String(item.oldPrice) : "",
          sizesStr: item.sizes ? item.sizes.join(",") : "",
          description: item.description || "",
        };
      });
      setShades(mappedShades);
    } catch (err) {
      console.error(err);
      const colorOpt = product.colors?.[0] || { name: "Default", hex: "#000000" };
      const existingImgs = product.additionalImages || [];
      const gallery = existingImgs.map((img: any) => 
        typeof img === "string" ? { label: "Side", url: img } : { label: img.label || "Side", url: img.url || "" }
      );
      while (gallery.length < 4) {
        gallery.push({ label: "Side", url: "" });
      }
      setShades([
        {
          id: product._id,
          colorName: colorOpt.name,
          colorHex: colorOpt.hex,
          coverImage: product.coverImage || "",
          additionalImages: gallery,
          stock: String(product.stock || 0),
          isPublished: product.isPublished,
          isNew: product.isNew,
          isTrending: product.isTrending || false,
          price: String(product.price || ""),
          oldPrice: product.oldPrice ? String(product.oldPrice) : "",
          sizesStr: product.sizes ? product.sizes.join(",") : "",
          description: product.description || "",
        }
      ]);
    }
    setActiveShadeIndex(0);
    setModalOpen(true);
  };

  const openAddVariantModal = async (product: any) => {
    setEditingProduct(null);
    setArtNumber(product.artNumber || "");
    setName(product.name);
    setCollection(product.collection || "Casual");
    setPrice(String(product.price));
    setOldPrice(product.oldPrice ? String(product.oldPrice) : "");
    setCategoryId(product.category?._id || product.category || "");
    setDescription(product.description || "");
    setSizesStr(product.sizes ? product.sizes.join(",") : "7,8,9,10,11,12");

    let existingShades: any[] = [];
    try {
      const queryStr = `artNumber=${encodeURIComponent(product.artNumber)}&showDeleted=all&showInactive=all&limit=50`;
      const res = await apiClient.products.list(queryStr);
      const items = res.items || [];
      existingShades = items.map((item: any) => {
        const colorOpt = item.colors?.[0] || { name: "Default", hex: "#000000" };
        const existingImgs = item.additionalImages || [];
        const gallery = existingImgs.map((img: any) => 
          typeof img === "string" ? { label: "Side", url: img } : { label: img.label || "Side", url: img.url || "" }
        );
        while (gallery.length < 4) {
          gallery.push({ label: "Side", url: "" });
        }
        return {
          id: item._id,
          colorName: colorOpt.name,
          colorHex: colorOpt.hex,
          coverImage: item.coverImage || "",
          additionalImages: gallery,
          stock: String(item.stock || 0),
          isPublished: item.isPublished,
          isNew: item.isNew,
          isTrending: item.isTrending || false,
          price: String(item.price || ""),
          oldPrice: item.oldPrice ? String(item.oldPrice) : "",
          sizesStr: item.sizes ? item.sizes.join(",") : "",
          description: item.description || "",
        };
      });
    } catch (err) {
      console.error(err);
    }

    const newShade = {
      id: `new-${Date.now()}`,
      colorName: "",
      colorHex: "#F46A1E",
      coverImage: "",
      additionalImages: [
        { label: "Front", url: "" },
        { label: "Side", url: "" },
        { label: "Back", url: "" },
        { label: "Sole", url: "" },
      ],
      stock: "10",
      isPublished: product.isPublished,
      isNew: product.isNew || false,
      isTrending: product.isTrending || false,
      price: "",
      oldPrice: "",
      sizesStr: "",
      description: "",
    };

    setShades([...existingShades, newShade]);
    setActiveShadeIndex(existingShades.length);
    setModalOpen(true);
    toast.info(`Adding variant shade to Article: ${product.artNumber}`);
  };

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    const nameTrimmed = newCollName.trim();
    if (!nameTrimmed) return;
    const nameLower = nameTrimmed.toLowerCase();
    if (nameLower === "men" || nameLower === "women" || nameLower === "kids") {
      toast.error("Category names (Men, Women, Kids) cannot be collections");
      return;
    }
    try {
      const coll = await apiClient.collections.create({ name: nameTrimmed });
      await fetchCollections();
      setCollection(coll.name);
      setNewCollName("");
      toast.success("Collection created!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to create collection");
    }
  };

  const handleDeleteCollection = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete the collection "${name}"?`)) return;
    try {
      await apiClient.collections.delete(id);
      await fetchCollections();
      // Reset collection state if the currently selected one was deleted
      if (collection === name) {
        setCollection("");
      }
      toast.success("Collection deleted successfully!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete collection");
    }
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

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      const data = await res.json();
      onUploaded(data.url);
      toast.success("Image uploaded successfully!", { id: "image-upload" });
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to upload image file", { id: "image-upload" });
    }
  };

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId) {
      toast.error("Please select or create a category");
      return;
    }
    
    setSubmitting(true);
    
    try {
      toast.loading("Saving product variants...", { id: "product-save" });

      const sizes = sizesStr
        .split(",")
        .map(s => Number(s.trim()))
        .filter(s => !isNaN(s) && s > 0);

      const outOfStockSizes = outOfStockSizesStr
        .split(",")
        .map(s => Number(s.trim()))
        .filter(s => !isNaN(s) && s > 0);

      const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

      for (const shade of shades) {
        const cleanAdditionalImages = shade.additionalImages.filter((img: any) => img.url.trim() !== "");
        const colorSuffix = (shade.colorName || "default").toLowerCase().replace(/[^a-z0-9]+/g, "-");
        const slug = `${baseSlug}-${colorSuffix}`;

        const shadePrice = shade.price ? Number(shade.price) : Number(price);
        const shadeOldPrice = shade.oldPrice ? Number(shade.oldPrice) : (oldPrice ? Number(oldPrice) : undefined);
        const shadeSizes = shade.sizesStr
          ? shade.sizesStr
              .split(",")
              .map((s: string) => Number(s.trim()))
              .filter((s: number) => !isNaN(s) && s > 0)
          : sizes;
        const shadeDescription = shade.description ? shade.description : description;

        const payload = {
          name,
          artNumber,
          slug,
          price: shadePrice,
          oldPrice: shadeOldPrice,
          stock: Number(shade.stock),
          category: categoryId,
          collection,
          coverImage: shade.coverImage || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600",
          additionalImages: cleanAdditionalImages,
          colors: [{ name: shade.colorName || "Default", hex: shade.colorHex || "#000000", stock: Number(shade.stock) }],
          description: shadeDescription,
          sizes: shadeSizes,
          outOfStockSizes,
          isPublished: isPublished,
          isNew: shade.isNew || false,
          isTrending: shade.isTrending || false,
        };

        if (shade.id && !shade.id.startsWith("new-")) {
          await apiClient.products.update(shade.id, payload);
        } else {
          await apiClient.products.create(payload);
        }
      }

      toast.success("All product variants saved successfully!", { id: "product-save" });
      setModalOpen(false);
      router.invalidate();
      fetchData();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to save product variants", { id: "product-save" });
    } finally {
      setSubmitting(false);
    }
  };

  const triggerSoftDelete = (product: any) => {
    setProductToDelete(product);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    try {
      await apiClient.products.delete(productToDelete._id);
      toast.success(`Product '${productToDelete.name}' soft-deleted`);
      setDeleteConfirmOpen(false);
      setProductToDelete(null);
      router.invalidate();
      fetchData();
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete product");
    }
  };

  const handleRestoreProduct = async (product: any) => {
    try {
      await apiClient.products.restore(product._id);
      toast.success(`Product '${product.name}' restored successfully`);
      router.invalidate();
      fetchData();
    } catch (err: any) {
      toast.error(err?.message || "Failed to restore product");
    }
  };

  const handleTogglePublish = async (product: any) => {
    try {
      await apiClient.products.update(product._id, { isPublished: !product.isPublished });
      toast.success(product.isPublished ? "Product unpublished" : "Product published successfully!");
      router.invalidate();
      fetchData();
    } catch (err: any) {
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-foreground flex items-center gap-2">
            <ShoppingBag className="h-8 w-8 text-primary" /> Product Catalogue
          </h1>
          <p className="text-muted-foreground text-sm">Add footwears, manage stocks, and toggle marketplace visibility.</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold uppercase tracking-wider text-primary-foreground transition hover:bg-primary-glow"
        >
          <Plus className="h-4 w-4" /> Add Product
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap gap-3 items-center justify-between">
          <div className="relative flex-1 min-w-[240px] flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search products by name or brand..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            <button type="submit" className="rounded-full bg-primary px-5 py-2.5 text-sm font-bold uppercase tracking-wider text-primary-foreground hover:bg-primary-glow">
              Search
            </button>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <AdminDropdown
              value={catFilter}
              onChange={(val) => {
                setCatFilter(val);
                setPage(1);
              }}
              options={[
                { value: "", label: "All Categories" },
                ...categories.map((c) => ({ value: c._id, label: c.name }))
              ]}
            />

            <AdminDropdown
              value={collFilter}
              onChange={(val) => {
                setCollFilter(val);
                setPage(1);
              }}
              options={[
                { value: "", label: "All Collections" },
                ...collections.map((c) => ({ value: c.name, label: c.name }))
              ]}
            />

            <AdminDropdown
              value={showInactive}
              onChange={(val) => {
                setShowInactive(val);
                setPage(1);
              }}
              options={[
                { value: "all", label: "All Visibility" },
                { value: "false", label: "Published Only" },
                { value: "true", label: "Unpublished Only" }
              ]}
            />

            <AdminDropdown
              value={showDeleted}
              onChange={(val) => {
                setShowDeleted(val);
                setPage(1);
              }}
              options={[
                { value: "false", label: "Active Catalogue" },
                { value: "true", label: "Deleted Catalogue" },
                { value: "all", label: "Full Listing" }
              ]}
            />
          </div>
        </form>
      </div>

      {/* Products Catalog Table */}
      <div className="rounded-2xl border border-border bg-card shadow-soft overflow-hidden">
        {loading ? (
          <div className="flex py-20 justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-sm">No products found in catalog.</p>
          </div>
        ) : (
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted text-muted-foreground text-xs font-bold uppercase border-b border-border">
                <tr>
                  <th className="p-4 min-w-[240px]">Product Details</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.map((p) => (
                  <tr key={p._id} className={p.isDeleted ? "opacity-60 bg-muted/10" : "hover:bg-muted/10 transition"}>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={getImageUrl(p.coverImage)}
                          alt={p.name}
                          className="h-12 w-12 rounded-xl object-cover bg-muted border border-border shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground flex items-center gap-2 flex-wrap">
                            {p.name}
                            {p.isNew && (
                              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[8px] font-semibold uppercase text-primary">
                                New
                              </span>
                            )}
                          </p>
                          <p className="text-[10px] font-bold text-primary tracking-wide">Art No: {p.artNumber || "N/A"}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Color: {p.colors?.[0]?.name || "Default"}
                          </p>
                          {p.sizes && p.sizes.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1.5 items-center">
                              <span className="text-[10px] font-bold text-muted-foreground uppercase mr-1">Sizes:</span>
                              {p.sizes.map((s: number) => {
                                const isOos = p.outOfStockSizes?.includes(s);
                                return (
                                  <button
                                    key={s}
                                    type="button"
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      if (isOos) {
                                        const updatedOos = (p.outOfStockSizes || []).filter((sz: number) => sz !== s);
                                        try {
                                          toast.loading(`Restoring size ${s}...`, { id: `restore-sz-${p._id}` });
                                          await apiClient.products.update(p._id, { outOfStockSizes: updatedOos });
                                          toast.success(`Size ${s} is now in stock!`, { id: `restore-sz-${p._id}` });
                                          fetchData();
                                        } catch (err: any) {
                                          toast.error(err?.message || "Failed to update size stock", { id: `restore-sz-${p._id}` });
                                        }
                                      } else {
                                        const updatedOos = [...(p.outOfStockSizes || []), s];
                                        try {
                                          toast.loading(`Marking size ${s} as Out of Stock...`, { id: `oos-sz-${p._id}` });
                                          await apiClient.products.update(p._id, { outOfStockSizes: updatedOos });
                                          toast.success(`Size ${s} marked as Out of Stock`, { id: `oos-sz-${p._id}` });
                                          fetchData();
                                        } catch (err: any) {
                                          toast.error(err?.message || "Failed to update size stock", { id: `oos-sz-${p._id}` });
                                        }
                                      }
                                    }}
                                    className={cn(
                                      "inline-flex h-5 items-center justify-center rounded-md px-1.5 text-[9px] font-bold uppercase transition-all cursor-pointer border",
                                      isOos
                                        ? "border-destructive/30 bg-destructive/10 text-destructive line-through hover:bg-destructive/20"
                                        : "border-border bg-stone-50 text-foreground hover:border-primary hover:text-primary"
                                    )}
                                    title={isOos ? `Click to Restore size ${s} (mark in-stock)` : `Click to mark size ${s} as Out of Stock`}
                                  >
                                    {s}
                                  </button>
                                );
                              })}

                              {p.outOfStockSizes && p.outOfStockSizes.length > 0 && (
                                <button
                                  type="button"
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    try {
                                      toast.loading("Marking all sizes as in-stock...", { id: `restore-all-${p._id}` });
                                      await apiClient.products.update(p._id, { outOfStockSizes: [] });
                                      toast.success("All sizes marked as in-stock successfully!", { id: `restore-all-${p._id}` });
                                      fetchData();
                                    } catch (err: any) {
                                      toast.error(err?.message || "Failed to update size stock", { id: `restore-all-${p._id}` });
                                    }
                                  }}
                                  className="ml-1.5 inline-flex h-5 items-center justify-center rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 px-2 text-[8px] font-extrabold uppercase border border-emerald-500/35 transition cursor-pointer"
                                  title="Mark all sizes as In-Stock at once"
                                >
                                  Mark All In-Stock
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-foreground">
                      {p.category?.name || p.category || "General"}
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-foreground">₹{p.price}</span>
                      {p.oldPrice && (
                        <span className="text-xs text-muted-foreground line-through ml-1.5 font-medium">₹{p.oldPrice}</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`font-mono text-sm font-bold ${p.stock <= 5 ? "text-destructive" : "text-foreground"}`}>
                        {p.stock} units
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        p.isDeleted
                          ? "bg-destructive/10 text-destructive"
                          : p.isPublished
                            ? "bg-success/10 text-success"
                            : "bg-muted text-muted-foreground"
                      }`}>
                        {p.isDeleted ? "Deleted" : p.isPublished ? "Active" : "Draft"}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex gap-1.5 justify-end">
                        {!p.isDeleted && (
                          <>
                            <button
                              onClick={() => handleTogglePublish(p)}
                              className="rounded-xl border border-border p-2 text-muted-foreground transition hover:border-primary hover:text-primary"
                              title={p.isPublished ? "Unpublish Product" : "Publish Product"}
                            >
                              {p.isPublished ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => openEditModal(p)}
                          className="rounded-xl border border-border p-2 text-muted-foreground transition hover:border-primary hover:text-primary"
                          title="Edit Product Details"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        {p.isDeleted ? (
                          <button
                            onClick={() => handleRestoreProduct(p)}
                            className="rounded-xl border border-border p-2 text-emerald-500 transition hover:bg-emerald-500/10 hover:border-emerald-500"
                            title="Restore Product"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => triggerSoftDelete(p)}
                            className="rounded-xl border border-border p-2 text-destructive transition hover:bg-destructive/10 hover:border-destructive"
                            title="Soft Delete Product"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border p-4 bg-muted/5">
            <span className="text-xs text-muted-foreground font-semibold">
              Showing page {page} of {totalPages} ({totalItems} products total)
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-xl border border-border bg-background px-4 py-2 text-xs font-bold transition hover:bg-accent disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-xl border border-border bg-background px-4 py-2 text-xs font-bold transition hover:bg-accent disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Product Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-secondary/60 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl border border-border bg-card p-6 shadow-card animate-in fade-in zoom-in-95 duration-200 my-8">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-xl font-bold">
                {editingProduct ? "Edit Product Details" : "Add Footwears to Catalog"}
              </h3>
              <button onClick={() => setModalOpen(false)} className="rounded-full p-1.5 hover:bg-accent">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmitProduct} className="space-y-4 text-left">
              {/* 1. Base Article Details */}
              <div className="rounded-2xl border border-border bg-muted/10 p-4 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-primary">1. Base Article Details</h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Article Number (Art No.)</label>
                    <input required value={artNumber} onChange={(e) => setArtNumber(e.target.value)} className="input-field" placeholder="e.g. ART-909" />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Product Name</label>
                    <input required value={name} onChange={(e) => setName(e.target.value)} className="input-field" placeholder="e.g. MOCS Aero Racer" />
                  </div>
                  
                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Category</label>
                    <AdminDropdown
                      value={categoryId}
                      onChange={setCategoryId}
                      placeholder="Select category"
                      className="w-full"
                      options={categories.map((c) => ({ value: c._id, label: c.name }))}
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Collection</label>
                      <button
                        type="button"
                        onClick={() => setManageCollOpen(true)}
                        className="text-xs font-bold text-primary hover:text-primary-glow"
                      >
                        + Create New
                      </button>
                    </div>
                    <AdminDropdown
                      value={collection}
                      onChange={setCollection}
                      className="w-full"
                      placeholder="Select collection"
                      options={collections.map((c) => ({ value: c.name, label: c.name }))}
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Base Price (INR)</label>
                    <input required type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value)} className="input-field" placeholder="e.g. 5999" />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Strike Price (Old Price, Optional)</label>
                    <input type="number" min={0} value={oldPrice} onChange={(e) => setOldPrice(e.target.value)} className="input-field" placeholder="e.g. 8999" />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Available Sizes (Comma-separated US numbers)</label>
                  <input required value={sizesStr} onChange={(e) => setSizesStr(e.target.value)} className="input-field" placeholder="e.g. 7, 8, 9, 10, 11, 12" />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Out of Stock Sizes (Comma-separated US numbers)</label>
                  <input value={outOfStockSizesStr} onChange={(e) => setOutOfStockSizesStr(e.target.value)} className="input-field border-amber-500/20 focus:border-amber-500" placeholder="e.g. 8, 10 (leave empty if all sizes are in stock)" />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Product Description</label>
                  <textarea required rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className="input-field resize-none" placeholder="Provide detailed styling and build information..." />
                </div>
              </div>

              {/* 2. Color Shades / Variants */}
              <div className="rounded-2xl border border-border bg-muted/10 p-4 space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-primary">2. Color Shades / Variants</h4>
                  <button
                    type="button"
                    onClick={() => {
                      const newId = `new-${Date.now()}`;
                      setShades([
                        ...shades,
                        {
                          id: newId,
                          colorName: "",
                          colorHex: "#F46A1E",
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
                          isTrending: false,
                          price: "",
                          oldPrice: "",
                          sizesStr: "",
                          description: "",
                        }
                      ]);
                      setActiveShadeIndex(shades.length);
                    }}
                    className="rounded-full border border-dashed border-primary/45 hover:border-primary px-3 py-1 text-xs font-bold text-primary hover:bg-primary/5 transition"
                  >
                    + Add Color Shade
                  </button>
                </div>

                {shades.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">No color shades added yet. Click "+ Add Color Shade" to add one.</p>
                ) : (
                  <>
                    {/* Shade selector tabs */}
                    <div className="flex flex-wrap gap-2 pb-2">
                      {shades.map((shade, idx) => (
                        <button
                          key={shade.id || idx}
                          type="button"
                          onClick={() => setActiveShadeIndex(idx)}
                          className={cn(
                            "rounded-xl px-3 py-1.5 text-xs font-semibold transition flex items-center gap-2 border",
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

                    {/* Active Shade Fields */}
                    {shades[activeShadeIndex] && (
                      <div className="space-y-4 p-3 bg-card border border-border rounded-xl">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Color Name</label>
                            <input
                              required
                              value={shades[activeShadeIndex].colorName}
                              onChange={(e) => {
                                const val = e.target.value;
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
                                placeholder="e.g. #F46A1E"
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
                              placeholder="e.g. 10"
                            />
                          </div>

                          <div>
                            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Cover Image (Browse Device)</label>
                            <div className="flex flex-col gap-2">
                              <div className="relative flex items-center justify-center border border-dashed border-primary/30 hover:border-primary bg-primary/5 rounded-2xl p-3.5 text-center cursor-pointer transition group">
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
                                <div className="space-y-0.5">
                                  <p className="text-xs font-bold text-primary group-hover:text-primary-glow">Click to browse file</p>
                                  <p className="text-[9px] text-muted-foreground font-semibold">Supports PNG, JPG, WEBP</p>
                                </div>
                              </div>
                              {shades[activeShadeIndex].coverImage && (
                                <div className="flex items-center gap-2 rounded-xl border border-border p-2 bg-muted/20">
                                  <img src={getImageUrl(shades[activeShadeIndex].coverImage)} className="h-10 w-10 object-cover rounded-lg" />
                                  <span className="text-[10px] truncate max-w-[200px] font-medium text-muted-foreground">{shades[activeShadeIndex].coverImage}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div>
                            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Price (INR, Optional)</label>
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
                              placeholder={`Leave empty to use base: ₹${price || "5999"}`}
                            />
                          </div>

                          <div>
                            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Strike Price (Old Price, Optional)</label>
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
                              placeholder={oldPrice ? `Leave empty to use base: ₹${oldPrice}` : "e.g. 8999"}
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Available Sizes (Optional)</label>
                            <input
                              value={shades[activeShadeIndex].sizesStr || ""}
                              onChange={(e) => {
                                const newShades = [...shades];
                                newShades[activeShadeIndex].sizesStr = e.target.value;
                                setShades(newShades);
                              }}
                              className="input-field"
                              placeholder={sizesStr ? `Leave empty to use base: ${sizesStr}` : "e.g. 7,8,9,10"}
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Description (Optional)</label>
                            <textarea
                              rows={2}
                              value={shades[activeShadeIndex].description || ""}
                              onChange={(e) => {
                                const newShades = [...shades];
                                newShades[activeShadeIndex].description = e.target.value;
                                setShades(newShades);
                              }}
                              className="input-field resize-none"
                              placeholder="Leave empty to use base description"
                            />
                          </div>
                        </div>

                        {/* Product Gallery for active shade */}
                        <div className="border-t border-border/60 pt-3 mt-3">
                          <h5 className="text-xs font-bold text-foreground mb-2">Product Gallery (Extra views)</h5>
                          <div className="grid gap-3 sm:grid-cols-2">
                            {shades[activeShadeIndex].additionalImages.map((img: any, imgIdx: number) => (
                              <div key={imgIdx} className="flex flex-col gap-2 rounded-xl border border-border p-3 bg-background/50 hover:border-primary/50 transition">
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
                                  <div className="relative flex-1 flex items-center justify-center border border-dashed border-primary/30 hover:border-primary bg-primary/5 rounded-xl py-1 text-center cursor-pointer transition group min-w-0">
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
                                    <span className="text-[10px] font-bold text-primary group-hover:text-primary-glow truncate px-2">Browse file</span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newShades = [...shades];
                                      newShades[activeShadeIndex].additionalImages = newShades[activeShadeIndex].additionalImages.filter((_: any, i: number) => i !== imgIdx);
                                      setShades(newShades);
                                    }}
                                    className="p-1 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-lg transition shrink-0"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                                {img.url && (
                                  <div className="flex items-center gap-2 rounded-lg border border-border/40 p-1.5 bg-muted/10">
                                    <img src={getImageUrl(img.url)} className="h-6 w-6 object-cover rounded" />
                                    <span className="text-[9px] truncate text-muted-foreground font-medium flex-1">{img.url}</span>
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
                                className="flex items-center gap-1 text-[10px] font-bold text-primary hover:text-primary-glow border border-primary/20 px-3 py-1 rounded-full hover:bg-primary/5 transition"
                              >
                                <Plus className="h-3.5 w-3.5" /> Add Image field ({shades[activeShadeIndex].additionalImages.length}/8)
                              </button>
                            )}
                          </div>

                          {/* Shade Specific Status flags */}
                          <div className="flex flex-wrap gap-4 border-t border-border/40 pt-4 mt-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={shades[activeShadeIndex].isNew || false} 
                                onChange={(e) => {
                                  const newShades = [...shades];
                                  newShades[activeShadeIndex].isNew = e.target.checked;
                                  setShades(newShades);
                                }} 
                                className="h-4.5 w-4.5 accent-primary" 
                              />
                              <span className="text-sm font-semibold text-foreground">Mark this variant as "New Arrival"</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={shades[activeShadeIndex].isTrending || false} 
                                onChange={(e) => {
                                  const newShades = [...shades];
                                  newShades[activeShadeIndex].isTrending = e.target.checked;
                                  setShades(newShades);
                                }} 
                                className="h-4.5 w-4.5 accent-primary" 
                              />
                              <span className="text-sm font-semibold text-foreground">Mark this variant as "Trending"</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* 3. Global Status Webhook */}
              <div className="flex flex-wrap gap-4 border-t border-border pt-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} className="h-4.5 w-4.5 accent-primary" />
                  <span className="text-sm font-semibold text-foreground">Publish immediately (visible to customers)</span>
                </label>
              </div>

              <div className="flex gap-3 justify-end pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-full border border-border bg-background px-6 py-2.5 text-sm font-bold uppercase tracking-wider transition hover:bg-accent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-full bg-primary px-6 py-2.5 text-sm font-bold uppercase tracking-wider text-primary-foreground transition hover:bg-primary-glow disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Save Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Collection Management Overlay Modal */}
      {manageCollOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-secondary/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-card animate-in fade-in zoom-in-95 duration-200">
            <div className="mb-4 flex items-center justify-between">
              <h4 className="font-display text-lg font-bold">Manage Collections</h4>
              <button onClick={() => setManageCollOpen(false)} className="rounded-full p-1.5 hover:bg-accent">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* List of existing collections */}
            <div className="mb-6">
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Existing Collections</label>
              <div className="max-h-60 overflow-y-auto rounded-2xl border border-border bg-muted/10 p-2 space-y-1">
                {collections.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">No collections found.</p>
                ) : (
                  collections.map((c) => (
                    <div key={c._id} className="flex items-center justify-between rounded-xl px-3 py-2 hover:bg-accent/40 group transition">
                      <span className="text-sm font-semibold">{c.name}</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteCollection(c._id, c.name)}
                        className="p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition"
                        title="Delete collection"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Form to add a new collection */}
            <form onSubmit={handleCreateCollection} className="space-y-4 pt-4 border-t border-border/60">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">New Collection Name</label>
                <input
                  required
                  value={newCollName}
                  onChange={(e) => setNewCollName(e.target.value)}
                  className="input-field"
                  placeholder="e.g. Summer Special"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-full bg-primary py-3 text-sm font-bold uppercase tracking-wider text-primary-foreground transition hover:bg-primary-glow"
              >
                Create Collection
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Product Soft Delete Confirmation Modal */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-secondary/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-card animate-in fade-in zoom-in-95 duration-200">
            <div className="text-center">
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-destructive/10 text-destructive mb-4">
                <AlertTriangle className="h-6 w-6" />
              </span>
              <h3 className="font-display text-lg font-bold">Delete catalog sneaker?</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Are you sure you want to soft-delete <strong>{productToDelete?.name}</strong>? It will be hidden from customer-facing shop pages but can be restored here.
              </p>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setDeleteConfirmOpen(false)}
                className="flex-1 rounded-full border border-border bg-background py-2.5 text-sm font-semibold transition hover:bg-accent"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 rounded-full bg-destructive py-2.5 text-sm font-bold uppercase tracking-wider text-destructive-foreground transition hover:bg-destructive/90"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
