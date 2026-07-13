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

export function formatDate(dateInput: any): string {
  if (!dateInput) return "";
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export function formatDateTime(dateInput: any): string {
  if (!dateInput) return "";
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const seconds = String(d.getSeconds()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  const hoursStr = String(hours).padStart(2, "0");
  
  return `${day}/${month}/${year}, ${hoursStr}:${minutes}:${seconds} ${ampm}`;
}
