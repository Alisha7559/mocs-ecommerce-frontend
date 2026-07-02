import { createFileRoute, useNavigate, useSearch, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Lock, Mail, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { apiClient } from "@/lib/api";
import { cn } from "@/lib/utils";

type AuthSearch = { redirect?: string };

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): AuthSearch => ({
    redirect: typeof s.redirect === "string" ? s.redirect : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign in or create account — MOCS" },
      { name: "description", content: "Sign in to your MOCS account or create one to start shopping." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { redirect } = useSearch({ from: "/auth" });
  const { login, user } = useStore();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      if (user.role === "admin" || user.role === "superadmin") {
        navigate({ to: "/admin/dashboard" });
      } else {
        navigate({ to: redirect ?? "/" });
      }
    }
  }, [user, navigate, redirect]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "").trim();
    const password = String(fd.get("password") ?? "");
    const name = String(fd.get("name") ?? "");

    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      const res =
        mode === "login"
          ? await apiClient.auth.login(email, password)
          : await apiClient.auth.register({ name, email, password });
      
      login(res.token, res.user);
      toast.success(mode === "login" ? "Welcome back" : "Account created");
      
      // Role-based redirect
      if (res.user.role === "admin" || res.user.role === "superadmin") {
        navigate({ to: "/admin/dashboard" });
      } else {
        navigate({ to: redirect ?? "/" });
      }
    } catch (err: any) {
      // Offline / no backend — fall back to a local "guest" token so the user
      // can keep shopping. Real auth requires the Express server running.
      const msg = err?.message ?? "Sign-in failed";
      if (msg.includes("Failed to fetch") || msg.includes("NetworkError")) {
        const dummyUser = { id: `guest-${Date.now()}`, name: "Guest User", email: "guest@example.com", role: "user" };
        login(`guest-${Date.now()}`, dummyUser);
        toast.success("Signed in (offline mode)");
        navigate({ to: redirect ?? "/" });
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto grid min-h-[80vh] max-w-md place-items-center px-4 pb-12 pt-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full rounded-3xl border border-border bg-card p-8 shadow-card"
      >
        <h1 className="font-display text-3xl font-extrabold">
          {mode === "login" ? "Welcome back" : "Join MOCS"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {mode === "login"
            ? "Sign in to continue your order."
            : "Create an account to save your cart, wishlist and orders."}
        </p>

        <div className="mt-6 grid grid-cols-2 rounded-full bg-muted p-1 text-sm font-semibold">
          {(["login", "signup"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={cn(
                "rounded-full py-2 transition",
                mode === m ? "bg-primary text-primary-foreground shadow-soft" : "text-muted-foreground",
              )}
            >
              {m === "login" ? "Log in" : "Sign up"}
            </button>
          ))}
        </div>

        <form onSubmit={onSubmit} className="mt-6 space-y-3">
          {mode === "signup" && (
            <Field icon={<UserIcon className="h-4 w-4" />} name="name" placeholder="Full name" required minLength={2} maxLength={80} />
          )}
          <Field icon={<Mail className="h-4 w-4" />} name="email" type="email" placeholder="Email" required autoComplete="off" />
          <Field icon={<Lock className="h-4 w-4" />} name="password" type="password" placeholder="Password" required minLength={8} maxLength={120} autoComplete="new-password" />
          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-full bg-primary py-3.5 text-sm font-bold uppercase tracking-wide text-primary-foreground transition hover:bg-primary-glow disabled:opacity-60"
          >
            {loading ? "Please wait..." : mode === "login" ? "Log in" : "Create account"}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-muted-foreground">
          By continuing you agree to our{" "}
          <Link to="/about" className="font-semibold text-primary">Terms</Link>.
        </p>
      </motion.div>
    </div>
  );
}

function Field({
  icon,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { icon: React.ReactNode }) {
  return (
    <label className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3 focus-within:border-primary">
      <span className="text-muted-foreground">{icon}</span>
      <input {...props} className="w-full bg-transparent text-sm outline-none" />
    </label>
  );
}
