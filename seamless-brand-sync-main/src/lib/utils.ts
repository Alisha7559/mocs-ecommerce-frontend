import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { API_BASE_URL } from "./api";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getImageUrl(url?: any): string {
  if (typeof url !== "string" || !url) return "";
  let normalizedUrl = url.trim().replace(/\\/g, "/");
  if (normalizedUrl.startsWith("http://") || normalizedUrl.startsWith("https://") || normalizedUrl.startsWith("data:")) {
    if (normalizedUrl.includes("images.unsplash.com")) {
      try {
        const u = new URL(normalizedUrl);
        u.searchParams.set("w", "1920");
        u.searchParams.set("q", "90");
        u.searchParams.set("fit", "crop");
        normalizedUrl = u.toString();
      } catch (e) {}
    } else if (normalizedUrl.includes("res.cloudinary.com") && normalizedUrl.includes("/image/upload/")) {
      if (!normalizedUrl.includes("/q_")) {
        normalizedUrl = normalizedUrl.replace("/image/upload/", "/image/upload/q_auto:best,f_auto,w_1920,c_limit/");
      }
    }
    return normalizedUrl;
  }
  const cleanBase = API_BASE_URL.replace(/\/+$/, "");
  let cleanUrl = normalizedUrl.replace(/^\/+/, "");
  if (cleanUrl.startsWith("src/uploads/")) {
    cleanUrl = cleanUrl.slice(4);
  }
  return `${cleanBase}/${cleanUrl}`;
}
