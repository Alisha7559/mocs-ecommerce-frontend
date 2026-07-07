import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { API_BASE_URL } from "./api";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getImageUrl(url?: any): string {
  if (typeof url !== "string" || !url) return "";
  const normalizedUrl = url.trim().replace(/\\/g, "/");
  if (normalizedUrl.includes("/kids/shoes.jpg") || normalizedUrl.includes("kids/shoes.jpg")) {
    return "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600";
  }
  if (normalizedUrl.startsWith("http://") || normalizedUrl.startsWith("https://") || normalizedUrl.startsWith("data:")) {
    return normalizedUrl;
  }
  const cleanBase = API_BASE_URL.replace(/\/+$/, "");
  let cleanUrl = normalizedUrl.replace(/^\/+/, "");
  if (cleanUrl.startsWith("src/uploads/")) {
    cleanUrl = cleanUrl.slice(4);
  }
  return `${cleanBase}/${cleanUrl}`;
}
