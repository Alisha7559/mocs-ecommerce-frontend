import { createFileRoute, useNavigate, useSearch, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Lock, Mail, User as UserIcon, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { apiClient } from "@/lib/api";
import { cn, getImageUrl } from "@/lib/utils";
import logo from "@/assets/mocs-logo.png";
import { useSignIn, useSignUp } from "@clerk/clerk-react";

type AuthSearch = { redirect?: string; mode?: "login" | "signup" };

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): AuthSearch => ({
    redirect: typeof s.redirect === "string" ? s.redirect : undefined,
    mode: s.mode === "login" || s.mode === "signup" ? s.mode : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign in or create account — MOCS" },
      { name: "description", content: "Sign in to your MOCS account or create one to start shopping." },
    ],
  }),
  component: AuthPage,
});

function cleanErrorMessage(err: any): string {
  let msg = err?.message || "";
  if (msg.includes("API ")) {
    const jsonStart = msg.indexOf("{");
    if (jsonStart !== -1) {
      try {
        const jsonStr = msg.substring(jsonStart);
        const parsed = JSON.parse(jsonStr);
        if (parsed.message) {
          return parsed.message;
        }
      } catch (e) {}
    }
    msg = msg.replace(/^API\s+\d+:\s*/, "");
  }
  return msg || "An unexpected error occurred.";
}

function AuthPage() {
  const navigate = useNavigate();
  const { redirect, mode: initialMode } = useSearch({ from: "/auth" });
  const { login, user } = useStore();
  const [mode, setMode] = useState<"login" | "signup">(initialMode ?? "login");
  const [loading, setLoading] = useState(false);
  const [errorModal, setErrorModal] = useState<{ isOpen: boolean; title: string; message: string }>({
    isOpen: false,
    title: "",
    message: ""
  });

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Email verification step for Clerk Sign Up
  const [verifyingEmail, setVerifyingEmail] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");

  // Clerk hooks
  const isClerkEnabled = 
    !!(import.meta as any).env?.VITE_CLERK_PUBLISHABLE_KEY && 
    (import.meta as any).env?.VITE_CLERK_PUBLISHABLE_KEY !== "pk_test_ZmFrZS1jbGVyay1rZXktNTAuY2xlcmsuYWNjb3VudHMuZGV2JA==";

  const clerkSignIn = isClerkEnabled ? useSignIn() : { signIn: null, isLoaded: true, setActive: null };
  const clerkSignUp = isClerkEnabled ? useSignUp() : { signUp: null, isLoaded: true, setActive: null };

  const signIn = clerkSignIn.signIn;
  const signInLoaded = clerkSignIn.isLoaded;
  const setSignInActive = clerkSignIn.setActive;

  const signUp = clerkSignUp.signUp;
  const signUpLoaded = clerkSignUp.isLoaded;
  const setSignUpActive = clerkSignUp.setActive;

  // Dynamic Auth Visual Slides Config
  const [authSlides, setAuthSlides] = useState<any[]>([
    { image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800", title: "Discover Your Style", subtitle: "Explore premium MOCS collections tailored just for you." },
    { image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800", title: "Create Your Vision", subtitle: "Join our community to unlock custom footwear and personalized styles." },
    { image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=800", title: "Crafted For Comfort", subtitle: "Every pair is built for active lifestyles and durable comfort." }
  ]);

  // Continuous auto-slideshow state (runs in the background independently of Log In/Sign Up state)
  const [activeSlide, setActiveSlide] = useState(0);

  // Auto-slide transition effect every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % authSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [authSlides.length]);

  // Load Auth custom settings / slideshow fallbacks / product fallbacks
  useEffect(() => {
    const loadAuthAssets = async () => {
      try {
        const res = await apiClient.settings.get("auth_settings").catch(() => null);
        if (res && res.value) {
          let val = res.value;
          if (val.slides && Array.isArray(val.slides) && val.slides.length > 0) {
            setAuthSlides(val.slides);
            return;
          }
          if (val.loginImage || val.signupImage) {
            // Old format fallback
            setAuthSlides([
              { image: val.loginImage || "", title: val.loginTitle || "Discover Your Style", subtitle: val.loginSubtitle || "Explore premium MOCS collections tailored just for you." },
              { image: val.signupImage || "", title: val.signupTitle || "Create Your Vision", subtitle: val.signupSubtitle || "Join our community to unlock custom footwear and personalized styles." },
              { image: "", title: "Crafted For Comfort", subtitle: "Every pair is built for active lifestyles and durable comfort." }
            ]);
            return;
          }
        }

        const heroRes = await apiClient.settings.get("hero_slides").catch(() => null);
        const slides = heroRes && (Array.isArray(heroRes) ? heroRes : (heroRes.value && Array.isArray(heroRes.value) ? heroRes.value : null));
        if (slides && slides.length > 0) {
          const lImg = getImageUrl(slides[0]?.bg) || authSlides[0].image;
          const sImg = getImageUrl(slides[1]?.bg || slides[0]?.bg) || authSlides[1].image;
          const tImg = getImageUrl(slides[2]?.bg || slides[0]?.bg) || authSlides[2].image;
          setAuthSlides([
            { image: lImg, title: "Discover Your Style", subtitle: "Explore premium MOCS collections tailored just for you." },
            { image: sImg, title: "Create Your Vision", subtitle: "Join our community to unlock custom footwear and personalized styles." },
            { image: tImg, title: "Crafted For Comfort", subtitle: "Every pair is built for active lifestyles and durable comfort." }
          ]);
          return;
        }

        const prodRes = await apiClient.products.list("limit=3").catch(() => null);
        if (prodRes && prodRes.items && prodRes.items.length > 0) {
          const lImg = getImageUrl(prodRes.items[0]?.coverImage) || authSlides[0].image;
          const sImg = getImageUrl(prodRes.items[1]?.coverImage || prodRes.items[0]?.coverImage) || authSlides[1].image;
          const tImg = getImageUrl(prodRes.items[2]?.coverImage || prodRes.items[0]?.coverImage) || authSlides[2].image;
          setAuthSlides([
            { image: lImg, title: "Discover Your Style", subtitle: "Explore premium MOCS collections tailored just for you." },
            { image: sImg, title: "Create Your Vision", subtitle: "Join our community to unlock custom footwear and personalized styles." },
            { image: tImg, title: "Crafted For Comfort", subtitle: "Every pair is built for active lifestyles and durable comfort." }
          ]);
        }
      } catch (err) {
        console.warn("Failed to load auth settings, using defaults.", err);
      }
    };
    loadAuthAssets();
  }, []);

  // Preload slides
  useEffect(() => {
    authSlides.forEach(slide => {
      if (slide.image) new Image().src = getImageUrl(slide.image);
    });
  }, [authSlides]);

  // Handle local state redirects
  useEffect(() => {
    if (user) {
      if (user.role === "admin" || user.role === "superadmin") {
        navigate({ to: "/admin/dashboard" });
      } else {
        navigate({ to: redirect ?? "/" });
      }
    }
  }, [user, navigate, redirect]);

  // Social Login handler
  const handleSocialLogin = async (strategy: "oauth_google" | "oauth_facebook" | "oauth_apple") => {
    if (!isClerkEnabled) {
      toast.info("Configure Clerk in your .env file to enable social logins.");
      return;
    }

    if (!signInLoaded || !signIn) {
      toast.error("Clerk is still loading, please wait.");
      return;
    }

    try {
      setLoading(true);
      await signIn.authenticateWithRedirect({
        strategy,
        redirectUrl: "/",
        redirectUrlComplete: "/",
      });
    } catch (err: any) {
      setErrorModal({
        isOpen: true,
        title: "Social Authentication Failed",
        message: cleanErrorMessage(err)
      });
      setLoading(false);
    }
  };

  // Submit Handler
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "").trim();
    const password = String(fd.get("password") ?? "");
    const firstName = String(fd.get("firstName") ?? "").trim();
    const lastName = String(fd.get("lastName") ?? "").trim();
    const confirmPassword = String(fd.get("confirmPassword") ?? "");

    if (!email) {
      toast.error("Please enter your email address", { id: "auth-toast" });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address", { id: "auth-toast" });
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters", { id: "auth-toast" });
      return;
    }

    if (mode === "signup" && password !== confirmPassword) {
      toast.error("Passwords do not match", { id: "auth-toast" });
      return;
    }

    setLoading(true);

    // 1. Clerk Flow
    if (isClerkEnabled) {
      try {
        if (mode === "login") {
          if (!signInLoaded || !signIn) throw new Error("Clerk not ready");
          const result = await signIn.create({ identifier: email, password });
          if (result.status === "complete") {
            if (setSignInActive) {
              await setSignInActive({ session: result.createdSessionId });
            }
            toast.success("Welcome back!", { id: "auth-toast" });
          } else {
            console.warn("Unexpected login result status:", result.status);
            toast.error("Login verification required.", { id: "auth-toast" });
          }
        } else {
          if (!signUpLoaded || !signUp) throw new Error("Clerk not ready");
          const result = await signUp.create({
            emailAddress: email,
            password,
            firstName,
            lastName,
          });

          if (result.status === "complete") {
            if (setSignUpActive) {
              await setSignUpActive({ session: result.createdSessionId });
            }
            toast.success("Account created successfully!", { id: "auth-toast" });
          } else {
            // Clerk requires email address OTP verification by default
            await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
            setVerifyingEmail(true);
            toast.success("Verification code sent to your email!", { id: "auth-toast" });
          }
        }
      } catch (err: any) {
        setErrorModal({
          isOpen: true,
          title: mode === "login" ? "Login Failed" : "Registration Failed",
          message: cleanErrorMessage(err)
        });
      } finally {
        setLoading(false);
      }
      return;
    }

    // 2. Custom MERN local database login flow
    try {
      const name = `${firstName} ${lastName}`.trim() || "Local User";
      const res =
        mode === "login"
          ? await apiClient.auth.login(email, password)
          : await apiClient.auth.register({ name, email, password });
      
      login(res.token, res.user);
      toast.success(mode === "login" ? "Welcome back" : "Account created", { id: "auth-toast" });
    } catch (err: any) {
      const msg = err?.message ?? "Sign-in failed";
      if (msg.includes("Failed to fetch") || msg.includes("NetworkError")) {
        const dummyUser = { id: `guest-${Date.now()}`, name: "Guest User", email: "guest@example.com", role: "user" };
        login(`guest-${Date.now()}`, dummyUser);
        toast.success("Signed in (offline mode)", { id: "auth-toast" });
      } else {
        setErrorModal({
          isOpen: true,
          title: mode === "login" ? "Login Failed" : "Registration Failed",
          message: cleanErrorMessage(err)
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Clerk Email Verification Submission
  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUpLoaded || !signUp) return;

    setLoading(true);
    try {
      if (!signUp) throw new Error("Clerk Sign-up not ready");
      const result = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      });

      if (result.status === "complete") {
        if (setSignUpActive) {
          await setSignUpActive({ session: result.createdSessionId });
        }
        toast.success("Account created successfully!", { id: "auth-toast" });
        setVerifyingEmail(false);
      } else {
        setErrorModal({
          isOpen: true,
          title: "Verification Failed",
          message: "Invalid verification code. Please check and try again."
        });
      }
    } catch (err: any) {
      setErrorModal({
        isOpen: true,
        title: "Verification Failed",
        message: cleanErrorMessage(err)
      });
    } finally {
      setLoading(false);
    }
  };

  // Motion animation config for opposing horizontal slideshow transitions
  const slideVariants = {
    enter: {
      x: 80,
      opacity: 0,
    },
    center: {
      x: 0,
      opacity: 1,
    },
    exit: {
      x: -80,
      opacity: 0,
    },
  };

  return (
    <div className="mx-auto flex max-w-3xl items-center justify-center p-1.5 font-sans bg-[#f3ebd7]/40 rounded-[26px] border border-stone-200/35 shadow-xs my-1 sm:my-2">
      <div className="w-full rounded-[22px] bg-white border border-stone-200/60 flex flex-col md:flex-row overflow-hidden shadow-card">
        
        {/* Left Visual Pane - Kept side-by-side even on mobile via proportional sizing/shrinkage */}
        <div className="relative w-full md:w-[45%] h-[150px] md:h-auto overflow-hidden border-b md:border-b-0 md:border-r border-stone-150 select-none bg-stone-950">
          <AnimatePresence initial={false}>
            <motion.div
              key={activeSlide}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 h-full w-full"
            >
              {/* Cover Background Image */}
              <img
                src={getImageUrl(authSlides[activeSlide]?.image)}
                alt="Auth visual"
                className="absolute inset-0 h-full w-full object-cover filter brightness-[0.7] saturate-[0.85]"
              />

              {/* Glowing Dark Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-black/60 pointer-events-none" />

              {/* Title & Description overlay on Desktop/Tablet viewports */}
              <div className="absolute bottom-8 left-8 right-8 z-10 hidden md:block">
                <motion.h2
                  initial={{ y: 15, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.15, duration: 0.4 }}
                  className="font-display text-2xl font-black text-white leading-tight"
                >
                  {authSlides[activeSlide]?.title}
                </motion.h2>
                <motion.p
                  initial={{ y: 15, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.25, duration: 0.4 }}
                  className="mt-2 text-xs leading-relaxed text-zinc-300 max-w-[90%]"
                >
                  {authSlides[activeSlide]?.subtitle}
                </motion.p>

                {/* Slideshow dot indicators */}
                <div className="mt-5 flex gap-1.5">
                  {authSlides.map((_, idx) => (
                    <span
                      key={idx}
                      className={cn(
                        "h-1 rounded-full transition-all duration-300",
                        activeSlide === idx ? "w-6 bg-primary" : "w-2 bg-neutral-600"
                      )}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Logo Brand Overlay */}
          <div className="absolute top-6 left-6 z-20 flex items-center gap-2 drop-shadow-md">
            <img src={logo} alt="MOCS" className="h-6.5 w-auto" />
          </div>
        </div>

        {/* Right Form Pane - Light Theme */}
        <div className="w-full md:w-[55%] p-5 sm:p-7 flex flex-col justify-center text-stone-900 bg-white">
          
          {/* Email Verification Box */}
          {verifyingEmail ? (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div>
                <h1 className="font-display text-2xl font-black tracking-tight text-stone-900">Verify Your Email</h1>
                <p className="mt-1.5 text-xs text-stone-500">
                  We've sent a 6-digit confirmation code. Please enter it below.
                </p>
              </div>

              <form onSubmit={handleVerifyEmail} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Verification Code</label>
                  <label className="flex items-center gap-3 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 focus-within:border-primary focus-within:bg-white transition duration-200">
                    <input
                      type="text"
                      required
                      placeholder="e.g. 123456"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      className="w-full bg-transparent text-sm font-semibold tracking-widest outline-none text-stone-900 placeholder-stone-400"
                    />
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl font-bold uppercase tracking-wider text-white bg-primary hover:bg-primary-glow active:scale-[0.98] transition-all disabled:opacity-60 cursor-pointer shadow-sm shadow-orange-500/10"
                >
                  {loading ? "Verifying..." : "Confirm & Activate"}
                </button>

                <button
                  type="button"
                  onClick={() => setVerifyingEmail(false)}
                  className="w-full text-center text-xs font-semibold text-stone-400 hover:text-stone-600 transition"
                >
                  Back to Sign Up
                </button>
              </form>
            </div>
          ) : (
            <>
              {/* Sliding Tab Mode Selector - Light styling */}
              <div className="flex mb-4">
                <div className="relative flex rounded-full bg-stone-100 border border-stone-200/80 p-0.5 text-[11px] font-bold w-fit">
                  {(["signup", "login"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMode(m)}
                      className={cn(
                        "relative rounded-full px-5 py-2 uppercase tracking-wider transition-colors duration-300 z-10 cursor-pointer",
                        mode === m ? "text-white font-extrabold" : "text-stone-500 hover:text-stone-800"
                      )}
                    >
                      {mode === m && (
                        <motion.div
                          layoutId="activeTabPill"
                          className="absolute inset-0 rounded-full bg-primary z-[-1]"
                          transition={{ type: "spring", stiffness: 350, damping: 28 }}
                        />
                      )}
                      {m === "login" ? "Log In" : "Sign Up"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Title & Subtitle */}
              <div className="mb-4">
                <h1 className="font-display text-2xl font-black tracking-tight text-stone-900">
                  {mode === "login" ? "Welcome Back" : "Create An Account"}
                </h1>
                <p className="mt-1.5 text-xs text-stone-500">
                  {mode === "login"
                    ? "Sign in to continue your order and save changes."
                    : "Become a member to get early shoe drops, coupons, and orders track."}
                </p>
              </div>

              <form onSubmit={onSubmit} className="space-y-2.5">
                
                {/* Sign up Mode: First / Last Name side-by-side */}
                <AnimatePresence initial={false}>
                  {mode === "signup" && (
                    <motion.div
                      initial={{ height: 0, opacity: 0, y: -15 }}
                      animate={{ height: "auto", opacity: 1, y: 0 }}
                      exit={{ height: 0, opacity: 0, y: -15 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="grid grid-cols-2 gap-3 overflow-hidden"
                    >
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">First Name</label>
                        <label className="flex items-center gap-2 rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2 focus-within:border-primary focus-within:bg-white transition duration-200">
                          <UserIcon className="h-4 w-4 text-stone-400" />
                          <input
                            name="firstName"
                            required={mode === "signup"}
                            placeholder="e.g. Ethan"
                            className="w-full bg-transparent text-sm outline-none text-stone-900 placeholder-stone-400"
                          />
                        </label>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Last Name</label>
                        <label className="flex items-center gap-2 rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2 focus-within:border-primary focus-within:bg-white transition duration-200">
                          <UserIcon className="h-4 w-4 text-stone-400" />
                          <input
                            name="lastName"
                            required={mode === "signup"}
                            placeholder="e.g. Walker"
                            className="w-full bg-transparent text-sm outline-none text-stone-900 placeholder-stone-400"
                          />
                        </label>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Email input */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Email Address</label>
                  <label className="flex items-center gap-3.5 rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 focus-within:border-primary focus-within:bg-white transition duration-200">
                    <Mail className="h-4 w-4 text-stone-400" />
                    <input
                      name="email"
                      type="email"
                      required
                      placeholder="enter your email"
                      autoComplete="off"
                      className="w-full bg-transparent text-sm outline-none text-stone-900 placeholder-stone-400"
                    />
                  </label>
                </div>

                {/* Password input */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400 font-semibold">Password</label>
                  <label className="flex items-center gap-3.5 rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 focus-within:border-primary focus-within:bg-white transition duration-200">
                    <Lock className="h-4 w-4 text-stone-400" />
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Password"
                      autoComplete="current-password"
                      className="w-full bg-transparent text-sm outline-none text-stone-900 placeholder-stone-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-stone-400 hover:text-stone-600 transition cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </label>
                </div>

                {/* Confirm Password input for Sign up */}
                <AnimatePresence initial={false}>
                  {mode === "signup" && (
                    <motion.div
                      initial={{ height: 0, opacity: 0, y: -10 }}
                      animate={{ height: "auto", opacity: 1, y: 0 }}
                      exit={{ height: 0, opacity: 0, y: -10 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className="space-y-1 overflow-hidden"
                    >
                      <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Confirm Password</label>
                      <label className="flex items-center gap-3.5 rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 focus-within:border-primary focus-within:bg-white transition duration-200">
                        <Lock className="h-4 w-4 text-stone-400" />
                        <input
                          name="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          required={mode === "signup"}
                          placeholder="Confirm Password"
                          autoComplete="new-password"
                          className="w-full bg-transparent text-sm outline-none text-stone-900 placeholder-stone-400"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="text-stone-400 hover:text-stone-600 transition cursor-pointer"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </label>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3 rounded-xl font-bold uppercase tracking-wider text-white bg-primary hover:bg-primary-glow active:scale-[0.98] transition-all disabled:opacity-60 cursor-pointer shadow-md shadow-orange-500/10"
                >
                  {loading ? "Please wait..." : mode === "login" ? "Log In" : "Create Account"}
                </button>
              </form>

              {/* OR Social Login Divider */}
              <div className="relative my-4 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-stone-200"></div>
                </div>
                <span className="relative bg-white px-4 text-[10px] font-bold uppercase tracking-widest text-stone-400">Or</span>
              </div>

              {/* Social Login Buttons (Google, Facebook, Apple) */}
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => handleSocialLogin("oauth_google")}
                  className="bg-stone-50 border border-stone-200 hover:border-stone-300 hover:bg-stone-100/60 rounded-xl py-2 flex justify-center items-center cursor-pointer transition"
                  title="Sign in with Google"
                >
                  {/* Google Custom Clean Icon */}
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => handleSocialLogin("oauth_facebook")}
                  className="bg-stone-50 border border-stone-200 hover:border-stone-300 hover:bg-stone-100/60 rounded-xl py-2 flex justify-center items-center cursor-pointer transition"
                  title="Sign in with Facebook"
                >
                  {/* Facebook Clean Icon */}
                  <svg className="h-4.5 w-4.5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => handleSocialLogin("oauth_apple")}
                  className="bg-stone-50 border border-stone-200 hover:border-stone-300 hover:bg-stone-100/60 rounded-xl py-2 flex justify-center items-center cursor-pointer transition"
                  title="Sign in with Apple"
                >
                  {/* Apple Clean Icon */}
                  <svg className="h-4.5 w-4.5 text-stone-900" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.05-2.033.03-3.905 1.185-4.953 3.004-2.112 3.663-.54 9.07 1.511 12.032 1.003 1.45 2.188 3.072 3.757 3.013 1.512-.06 2.083-.974 3.91-.974 1.824 0 2.342.974 3.92.943 1.606-.03 2.637-1.464 3.628-2.903 1.139-1.666 1.61-3.276 1.637-3.357-.036-.015-3.151-1.21-3.183-4.786-.027-2.983 2.44-4.417 2.55-4.484-1.397-2.05-3.553-2.28-4.316-2.336-1.99-.163-3.504 1.078-4.502 1.078zm3.013-3.69c.846-1.025 1.41-2.455 1.254-3.876-1.22.05-2.697.81-3.57 1.836-.763.882-1.43 2.33-1.25 3.722 1.36.106 2.72-.756 3.566-1.682z"/>
                  </svg>
                </button>
              </div>

              {/* Footer Policy text */}
              <p className="mt-4 text-center text-[10px] text-stone-400 leading-normal font-medium">
                By continuing you agree to the MOCS{" "}
                <Link to="/about" className="font-semibold text-primary underline">Terms of Use</Link> and{" "}
                <a href="/about" className="font-semibold text-primary underline">Privacy Policy</a>.
              </p>
            </>
          )}
        </div>
      </div>

      {/* Error Modal */}
      <AnimatePresence>
        {errorModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-6 shadow-xl space-y-4 text-left font-sans"
            >
              <div className="flex items-center gap-3 text-red-500">
                <div className="rounded-full bg-red-50 p-2">
                  <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="font-display text-lg font-black text-stone-900">{errorModal.title}</h3>
              </div>
              
              <p className="text-sm text-stone-600 leading-relaxed break-words">
                {errorModal.message}
              </p>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setErrorModal({ isOpen: false, title: "", message: "" })}
                  className="rounded-xl bg-primary px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-primary-glow cursor-pointer shadow-sm shadow-orange-500/10"
                >
                  Dismiss
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
