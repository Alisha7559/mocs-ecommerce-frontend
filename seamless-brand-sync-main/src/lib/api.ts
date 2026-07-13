// Thin API client for the external MERN backend (see ./mern-reference).
// Set VITE_API_BASE_URL in your env (defaults to http://localhost:5000).
export const API_BASE_URL =
  (import.meta as any).env?.VITE_API_BASE_URL ?? "http://localhost:5000";

const TOKEN_KEY = "mocs_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
}

export async function api<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }
  return res.status === 204 ? (undefined as T) : ((await res.json()) as T);
}

// Endpoints mirror mern-reference/routes/*.js — wire to your Express server.
export const apiClient = {
  auth: {
    login: (email: string, password: string) =>
      api<{ token: string; user: any }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: email.trim(), password }),
      }),
    register: (data: { name: string; email: string; password: string }) =>
      api<{ token: string; user: any }>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ ...data, email: data.email.trim() }),
      }),
    me: () => api<{ user: any }>("/api/auth/me"),
  },
  users: {
    getProfile: () => api<{ id: string; name: string; email: string; phone: string; address: string; role: string; createdAt: string; jobTitle?: string }>("/api/users/profile"),
    updateProfile: (data: { name: string; phone: string; address: string; jobTitle?: string }) =>
      api<any>("/api/users/profile", {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    changePassword: (data: any) =>
      api<any>("/api/users/change-password", {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    list: (q = "") => api<any>(`/api/users${q ? `?${q}` : ""}`),
    create: (data: any) =>
      api("/api/users", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      api(`/api/users/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: string) => api(`/api/users/${id}`, { method: "DELETE" }),
    restore: (id: string) => api(`/api/users/${id}/restore`, { method: "POST" }),
  },
  products: {
    list: (q = "") => api<any>(`/api/products${q ? `?${q}` : ""}`),
    get: (id: string, q = "") => api<any>(`/api/products/${id}${q ? `?${q}` : ""}`),
    create: (data: any) =>
      api("/api/products", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      api<any>(`/api/products/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: string) => api<any>(`/api/products/${id}`, { method: "DELETE" }),
    restore: (id: string) => api<any>(`/api/products/${id}/restore`, { method: "POST" }),
  },
  cart: {
    get: () => api<any>("/api/cart"),
    add: (body: unknown) =>
      api<any>("/api/cart", { method: "POST", body: JSON.stringify(body) }),
    remove: (id: string) => api<any>(`/api/cart/${id}`, { method: "DELETE" }),
  },
  wishlist: {
    get: () => api<any>("/api/wishlist"),
    toggle: (productId: string) =>
      api<any>("/api/wishlist", {
        method: "POST",
        body: JSON.stringify({ productId }),
      }),
  },
  orders: {
    list: () => api<any[]>("/api/orders"),
    listAll: (q = "") => api<any[]>(`/api/orders/all${q ? `?${q}` : ""}`),
    create: (body: unknown) =>
      api<any>("/api/orders", { method: "POST", body: JSON.stringify(body) }),
    updateStatus: (id: string, status: string, note?: string) =>
      api<any>(`/api/orders/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status, note }),
      }),
    updatePaymentStatus: (id: string, paymentStatus: string) =>
      api<any>(`/api/orders/${id}/payment-status`, {
        method: "PATCH",
        body: JSON.stringify({ paymentStatus }),
      }),
    delete: (id: string) => api<any>(`/api/orders/${id}`, { method: "DELETE" }),
    restore: (id: string) => api<any>(`/api/orders/${id}/restore`, { method: "POST" }),
    cancel: (id: string, reason: string) =>
      api<any>(`/api/orders/${id}/cancel`, {
        method: "PATCH",
        body: JSON.stringify({ reason }),
      }),
    returnOrder: (id: string, reason: string) =>
      api<any>(`/api/orders/${id}/return`, {
        method: "PUT",
        body: JSON.stringify({ reason }),
      }),
  },
  queries: {
    create: (data: { name: string; email: string; subject: string; message: string }) =>
      api<any>("/api/queries", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    list: (q = "") => api<any>(`/api/queries${q ? `?${q}` : ""}`),
    update: (id: string, data: { status?: string; adminNotes?: string }) =>
      api<any>(`/api/queries/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: string) => api<any>(`/api/queries/${id}`, { method: "DELETE" }),
    restore: (id: string) => api<any>(`/api/queries/${id}/restore`, { method: "POST" }),
  },
  categories: {
    list: () => api<any[]>("/api/categories"),
    create: (data: any) =>
      api<any>("/api/categories", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },
  collections: {
    list: () => api<any[]>("/api/collections"),
    create: (data: any) =>
      api<any>("/api/collections", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    delete: (id: string) => api<any>(`/api/collections/${id}`, { method: "DELETE" }),
  },
  payments: {
    createOrder: (shippingAddress: any, items?: any[]) =>
      api<{ key: string; amount: number; currency: string; orderId: string; internalOrderId: string; user: any }>("/api/payments/create-order", {
        method: "POST",
        body: JSON.stringify({ shippingAddress, items }),
      }),
    verify: (body: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
      internalOrderId: string;
    }) =>
      api<any>("/api/payments/verify", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    list: (q = "") => api<any>(`/api/payments${q ? `?${q}` : ""}`),
    getStats: () => api<any>("/api/payments/stats"),
    cancel: (orderId: string) =>
      api<any>(`/api/payments/${orderId}/cancel`, {
        method: "POST",
      }),
  },
  reviews: {
    list: (productId: string) => api<any[]>(`/api/reviews/${productId}`),
    create: (data: { productId: string; rating: number; text: string; color?: string; size?: number }) =>
      api<any>("/api/reviews", {
        method: "POST",
        body: JSON.stringify({
          productId: data.productId,
          product: data.productId,
          rating: data.rating,
          text: data.text,
          color: data.color,
          size: data.size,
        }),
      }),
    update: (id: string, data: { rating?: number; text?: string }) =>
      api<any>(`/api/reviews/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: string) => api<any>(`/api/reviews/${id}`, { method: "DELETE" }),
  },
  settings: {
    get: (key: string) => api<{ key: string; value: any }>(`/api/settings/${key}`),
    update: (key: string, value: any) =>
      api<any>(`/api/settings/${key}`, {
        method: "PUT",
        body: JSON.stringify({ value }),
      }),
  },
};
