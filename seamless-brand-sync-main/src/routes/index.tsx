import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { apiClient } from "@/lib/api";
import { getImageUrl } from "@/lib/utils";

// Home Components
import { Hero } from "@/components/Hero";
import { TrendingProducts } from "@/components/TrendingProducts";
import { NewArrivals } from "@/components/NewArrivals";
import { CategoriesSection } from "@/components/CategoriesSection";
import { ProductsCarousel } from "@/components/ProductsCarousel";
import { ScrollBrandReveal } from "@/components/ScrollBrandReveal";
import { AdCarousel } from "@/components/AdCarousel";
import { SandalsCarousel } from "@/components/SandalsCarousel";
import { QualityPromise } from "@/components/QualityPromise";
import { ReviewsMarquee } from "@/components/ReviewsMarquee";

export const Route = createFileRoute("/")({
  loader: async () => {
    try {
      const res = await apiClient.products.list("limit=100");
      if (res && res.items) {
        const apiProducts = res.items.map((p: any) => ({
          id: p._id,
          artNumber: p.artNumber || "",
          name: p.name,
          category: (p.category?.name || p.category || "Men") as any,
          collection: (p.collection || "Casual") as any,
          type: "Running",
          price: p.price,
          oldPrice: p.oldPrice,
          rating: p.rating || 5,
          reviews: p.reviewCount || 0,
          stock: p.stock || 0,
          image: getImageUrl(p.coverImage),
          colors: p.colors && p.colors.length > 0
            ? p.colors.map((c: any) => ({ name: c.name, hex: c.hex }))
            : [{ name: "Default", hex: "#000000" }],
          sizes: p.sizes || [7, 8, 9, 10, 11, 12],
          description: p.description,
          isNew: p.isNew,
          isTrending: p.isTrending,
          views: p.additionalImages && p.additionalImages.length > 0
            ? [
              { label: "Front", src: getImageUrl(p.coverImage) },
              ...p.additionalImages.map((img: any) => ({
                label: img.label || "Side",
                src: getImageUrl(img.url)
              }))
            ]
            : [{ label: "Front", src: getImageUrl(p.coverImage) }]
        }));
        return { products: apiProducts };
      }
    } catch (err) {
      console.warn("Failed to load products for homepage", err);
    }
    return { products: [] };
  },
  shouldReload: true,
  head: () => ({
    meta: [
      { title: "MOCS — Premium Footwear" },
      {
        name: "description",
        content:
          "MOCS — premium footwear for Men, Women and Kids. Engineered for performance, crafted for everyday style.",
      },
      { property: "og:title", content: "MOCS — Premium Footwear" },
      {
        property: "og:description",
        content: "Premium footwear engineered for performance.",
      },
    ],
  }),
  component: Home,
});

const reviews = [
  {
    name: "Gokul Nair",
    text: "Best footwear our boutique has stocked. Customers love them, returns are negligible.",
    rating: 5,
  },
  {
    name: "Anjali Kurup",
    text: "MOCS handled a custom run for our brand and delivered on time, on spec, on budget.",
    rating: 5,
  },
  {
    name: "Mathew Joseph",
    text: "Comfortable from the first wear. Build quality you don't expect at this price.",
    rating: 5,
  },
  {
    name: "Hiba",
    text: "Good and comfortable to wear.",
    rating: 5,
  },
];

function Home() {
  const { products } = Route.useLoaderData();
  const [allProducts, setAllProducts] = useState<any[]>(products);
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

  const [collectionsBanners, setCollectionsBanners] = useState<any[]>([
    { key: "sports", title: "SPORTS", bg: "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=70&auto=format&fit=crop&w=400", to: "/shop", search: { collection: "Sports" } },
    { key: "casual", title: "CASUAL", bg: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=70&auto=format&fit=crop&w=400", to: "/shop", search: { collection: "Casual" } },
    { key: "formal", title: "FORMAL", bg: "https://images.unsplash.com/photo-1486308512493-ae6a625e368a?q=70&auto=format&fit=crop&w=400", to: "/shop", search: { collection: "Formal" } }
  ]);

  const [promiseCollage, setPromiseCollage] = useState<any[]>([]);
  const [advertisements, setAdvertisements] = useState<string[]>([]);

  useEffect(() => {
    const fetchBannersSettings = async () => {
      try {
        const res = await apiClient.settings.get("categories_banners");
        if (res && res.value && Array.isArray(res.value) && res.value.length === 5) {
          setCategoriesBanners(res.value);
        }
      } catch (err) {
        console.warn("Failed to load categories banners settings", err);
      }
    };
    const fetchCollectionsSettings = async () => {
      try {
        const res = await apiClient.settings.get("collections_banners");
        if (res && res.value && Array.isArray(res.value) && res.value.length > 0) {
          setCollectionsBanners(res.value);
        }
      } catch (err) {
        console.warn("Failed to load collections banners settings", err);
      }
    };
    const fetchPromiseSettings = async () => {
      try {
        const res = await apiClient.settings.get("promise_collage");
        if (res && res.value && Array.isArray(res.value) && res.value.length > 0) {
          setPromiseCollage(res.value);
        }
      } catch (err) {
        console.warn("Failed to load collage settings", err);
      }
    };
    const fetchAdsSettings = async () => {
      try {
        const res = await apiClient.settings.get("advertisements");
        if (res && res.value && Array.isArray(res.value) && res.value.length > 0) {
          setAdvertisements(res.value);
        }
      } catch (err) {
        console.warn("Failed to load advertisements settings", err);
      }
    };
    fetchBannersSettings();
    fetchCollectionsSettings();
    fetchPromiseSettings();
    fetchAdsSettings();
  }, []);

  useEffect(() => {
    setAllProducts(products);
  }, [products]);

  const trendingProducts = useMemo(() => {
    const list = allProducts.filter((p: any) => p.isTrending);
    const seen = new Set();
    return list.filter((p: any) => {
      const key = p.artNumber || p.name;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [allProducts]);

  const processedProducts = useMemo(() => {
    const newProducts = allProducts.filter((p: any) => p.isNew);
    const regularProducts = allProducts.filter((p: any) => !p.isNew);
    const shuffled = [...regularProducts].sort(() => Math.random() - 0.5);
    return [...newProducts, ...shuffled];
  }, [allProducts]);

  const newArrivals = useMemo(() => {
    const list = allProducts.filter((p: any) => p.isNew);
    const seen = new Set();
    return list.filter((p: any) => {
      const key = p.artNumber || p.name;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [allProducts]);

  const sandalsProducts = useMemo(() => {
    const firstFourTrending = processedProducts.slice(0, 4).map((p: any) => p.id || p._id || p.artNumber);
    const firstFourNewArrivals = newArrivals.slice(0, 4).map((p: any) => p.id || p._id || p.artNumber);
    const firstFourTrendingList = trendingProducts.slice(0, 4).map((p: any) => p.id || p._id || p.artNumber);

    const forbiddenIds = new Set([...firstFourTrending, ...firstFourNewArrivals, ...firstFourTrendingList]);

    const allSandals = allProducts.filter((p: any) => {
      const cat = (p.category || "").toLowerCase();
      const name = (p.name || "").toLowerCase();
      return cat.includes("sandal") || name.includes("sandal") || cat.includes("chappal") || cat.includes("slide");
    });

    const differentSandals = allSandals.filter((p: any) => {
      const pid = p.id || p._id || p.artNumber;
      return !forbiddenIds.has(pid);
    });

    if (differentSandals.length < 4) {
      const differentOthers = allProducts.filter((p: any) => {
        const pid = p.id || p._id || p.artNumber;
        const cat = (p.category || "").toLowerCase();
        const name = (p.name || "").toLowerCase();
        const isSandal = cat.includes("sandal") || name.includes("sandal") || cat.includes("chappal") || cat.includes("slide");
        return !isSandal && !forbiddenIds.has(pid);
      });
      differentSandals.push(...differentOthers);
    }

    const firstFour = differentSandals.slice(0, 4);
    const firstFourIds = new Set(firstFour.map((p: any) => p.id || p._id || p.artNumber));

    const remainingSandals = allSandals.filter((p: any) => {
      const pid = p.id || p._id || p.artNumber;
      return !firstFourIds.has(pid);
    });

    const remainingOthers = allProducts.filter((p: any) => {
      const pid = p.id || p._id || p.artNumber;
      if (firstFourIds.has(pid)) return false;
      const cat = (p.category || "").toLowerCase();
      const name = (p.name || "").toLowerCase();
      const isSandal = cat.includes("sandal") || name.includes("sandal") || cat.includes("chappal") || cat.includes("slide");
      return !isSandal;
    });

    const combined = [...firstFour, ...remainingSandals, ...remainingOthers];
    const seen = new Set();
    return combined.filter((p: any) => {
      const key = p.id || p._id;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [allProducts, processedProducts, newArrivals, trendingProducts]);

  return (
    <>
      <Hero />
      <TrendingProducts products={trendingProducts} />
      <NewArrivals products={newArrivals} />
      <CategoriesSection categoriesBanners={categoriesBanners} />
      <ProductsCarousel products={processedProducts} />
      <div className="my-2">
        <ScrollBrandReveal collections={collectionsBanners} />
      </div>
      <AdCarousel advertisements={advertisements} />
      <SandalsCarousel products={sandalsProducts} />
      <QualityPromise collage={promiseCollage} />
      <ReviewsMarquee reviews={reviews} />
    </>
  );
}
