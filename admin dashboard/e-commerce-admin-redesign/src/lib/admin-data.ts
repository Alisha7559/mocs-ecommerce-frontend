import shoe1 from "@/assets/shoe-1.jpg";
import shoe2 from "@/assets/shoe-2.jpg";
import shoe3 from "@/assets/shoe-3.jpg";
import shoe4 from "@/assets/shoe-4.jpg";
import shoe5 from "@/assets/shoe-5.jpg";
import shoe6 from "@/assets/shoe-6.jpg";

export type AdminProduct = {
  id: string;
  sku: string;
  name: string;
  category: "Men" | "Women" | "Kids";
  collection: "Sports" | "Casual" | "Formal" | "Trending";
  price: number;
  stock: number;
  sold: number;
  status: "Live" | "Low Stock" | "Draft";
  image: string;
};

export const adminProducts: AdminProduct[] = [
  { id: "velocity-pro", sku: "MOCS-VP-001", name: "Velocity Pro Runner", category: "Men", collection: "Sports", price: 159, stock: 12, sold: 312, status: "Low Stock", image: shoe1 },
  { id: "aero-glide", sku: "MOCS-AG-014", name: "Aero Glide Knit", category: "Women", collection: "Sports", price: 139, stock: 48, sold: 268, status: "Live", image: shoe2 },
  { id: "metro-low", sku: "MOCS-ML-022", name: "Metro Low Top", category: "Men", collection: "Casual", price: 119, stock: 64, sold: 201, status: "Live", image: shoe3 },
  { id: "court-classic", sku: "MOCS-CC-031", name: "Court Classic '92", category: "Women", collection: "Casual", price: 129, stock: 22, sold: 187, status: "Live", image: shoe4 },
  { id: "trail-spire", sku: "MOCS-TS-040", name: "Trail Spire GTX", category: "Men", collection: "Sports", price: 189, stock: 7, sold: 154, status: "Low Stock", image: shoe5 },
  { id: "atelier-oxford", sku: "MOCS-AO-052", name: "Atelier Oxford", category: "Men", collection: "Formal", price: 219, stock: 31, sold: 96, status: "Live", image: shoe6 },
];

export type AdminOrder = {
  id: string;
  customer: string;
  email: string;
  product: string;
  productImage: string;
  qty: number;
  total: number;
  status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Refunded";
  channel: "Web" | "App" | "Retail";
  placedAt: string;
};

export const adminOrders: AdminOrder[] = [
  { id: "#MO-10481", customer: "Priya Sharma", email: "priya@hey.com", product: "Velocity Pro Runner", productImage: shoe1, qty: 1, total: 159, status: "Pending", channel: "App", placedAt: "Today, 09:42" },
  { id: "#MO-10480", customer: "Jordan Reyes", email: "jordan@reyes.co", product: "Aero Glide Knit", productImage: shoe2, qty: 2, total: 278, status: "Processing", channel: "Web", placedAt: "Today, 09:18" },
  { id: "#MO-10479", customer: "Sana Iqbal", email: "sana.i@studio.com", product: "Court Classic '92", productImage: shoe4, qty: 1, total: 129, status: "Shipped", channel: "Web", placedAt: "Today, 08:55" },
  { id: "#MO-10478", customer: "Mateo Rossi", email: "mateo@rossi.it", product: "Trail Spire GTX", productImage: shoe5, qty: 1, total: 189, status: "Shipped", channel: "Web", placedAt: "Yesterday" },
  { id: "#MO-10477", customer: "Ava Chen", email: "ava@chen.design", product: "Metro Low Top", productImage: shoe3, qty: 3, total: 357, status: "Delivered", channel: "Retail", placedAt: "Yesterday" },
  { id: "#MO-10476", customer: "Liam O'Connor", email: "liam@oc.io", product: "Atelier Oxford", productImage: shoe6, qty: 1, total: 219, status: "Delivered", channel: "Web", placedAt: "2d ago" },
  { id: "#MO-10475", customer: "Noor Hassan", email: "noor@hassan.me", product: "Velocity Pro Runner", productImage: shoe1, qty: 1, total: 159, status: "Refunded", channel: "App", placedAt: "3d ago" },
];

export const salesByDay = [
  { d: "Mon", revenue: 4820, orders: 38 },
  { d: "Tue", revenue: 5210, orders: 41 },
  { d: "Wed", revenue: 6190, orders: 49 },
  { d: "Thu", revenue: 5980, orders: 47 },
  { d: "Fri", revenue: 8420, orders: 66 },
  { d: "Sat", revenue: 11280, orders: 88 },
  { d: "Sun", revenue: 9870, orders: 76 },
];

export const channelSplit = [
  { name: "Web", value: 58, color: "oklch(0.702 0.21 47)" },
  { name: "App", value: 31, color: "oklch(0.22 0.006 286)" },
  { name: "Retail", value: 11, color: "oklch(0.78 0.18 55)" },
];

export const adminCustomers = [
  { name: "Priya Sharma", email: "priya@hey.com", orders: 14, spent: 2180, tier: "VIP", joined: "Mar 2024", city: "Mumbai" },
  { name: "Jordan Reyes", email: "jordan@reyes.co", orders: 9, spent: 1495, tier: "Loyal", joined: "Aug 2024", city: "Austin" },
  { name: "Sana Iqbal", email: "sana.i@studio.com", orders: 6, spent: 884, tier: "Loyal", joined: "Jan 2025", city: "Lahore" },
  { name: "Mateo Rossi", email: "mateo@rossi.it", orders: 4, spent: 612, tier: "New", joined: "Apr 2025", city: "Milan" },
  { name: "Ava Chen", email: "ava@chen.design", orders: 11, spent: 1742, tier: "VIP", joined: "Nov 2023", city: "Singapore" },
  { name: "Liam O'Connor", email: "liam@oc.io", orders: 3, spent: 489, tier: "New", joined: "May 2025", city: "Dublin" },
];
