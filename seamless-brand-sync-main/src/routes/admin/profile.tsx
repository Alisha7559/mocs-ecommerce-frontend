import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { User, Phone, MapPin, Key, Save, ShieldCheck, Mail, Calendar, Briefcase } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";
import { useStore } from "@/lib/store";
import { formatDate } from "@/lib/utils";

export const Route = createFileRoute("/admin/profile")({
  head: () => ({
    meta: [
      { title: "My Profile — MOCS Admin" },
    ],
  }),
  component: AdminProfilePage,
});

function AdminProfilePage() {
  const { user, login } = useStore();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"general" | "security">("general");

  // Form states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [updating, setUpdating] = useState(false);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const data = await apiClient.users.getProfile();
      setProfile(data);
      setName(data.name);
      setPhone(data.phone || "");
      setAddress(data.address || "");
      setJobTitle(data.jobTitle || "");
    } catch (err: any) {
      toast.error(err?.message || "Failed to load admin profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) {
      toast.error("Name must contain at least 2 characters");
      return;
    }
    setUpdating(true);
    try {
      const updated = await apiClient.users.updateProfile({ name, phone, address, jobTitle });
      setProfile((prev: any) => ({ ...prev, ...updated }));
      
      // Update global user store
      if (user) {
        login(localStorage.getItem("mocs_token") || "", { ...user, name: updated.name, jobTitle: updated.jobTitle });
      }
      toast.success("Profile details updated successfully");
    } catch (err: any) {
      toast.error(err?.message || "Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    setUpdating(true);
    try {
      await apiClient.users.changePassword({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password updated successfully");
    } catch (err: any) {
      toast.error(err?.message || "Failed to change password");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-foreground flex items-center gap-2">
          <ShieldCheck className="h-8 w-8 text-primary" /> Admin Profile Settings
        </h1>
        <p className="text-muted-foreground text-sm">Manage your personal credentials, contact info, and security details.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_2.2fr]">
        {/* Left Side: Summary Card */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft text-center">
            <div className="relative mx-auto w-24 h-24">
              <span className="grid h-full w-full place-items-center rounded-full bg-primary/10 text-primary font-display text-4xl font-bold uppercase border border-primary/20">
                {profile.name.charAt(0)}
              </span>
              <span className="absolute bottom-0 right-0 h-6 w-6 rounded-full bg-primary border-4 border-card flex items-center justify-center text-[10px] text-primary-foreground font-black">✓</span>
            </div>
            
            <h2 className="mt-4 font-display text-xl font-bold text-foreground truncate">{profile.name}</h2>
            {profile.jobTitle && (
              <p className="text-xs font-semibold text-primary uppercase tracking-wider truncate mt-1">{profile.jobTitle}</p>
            )}
            <p className="text-xs text-muted-foreground truncate mt-1">{profile.email}</p>
            
            <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
              {profile.role}
            </div>

            <div className="mt-6 border-t border-border/60 pt-6 text-left space-y-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-primary shrink-0" />
                <span className="truncate">{profile.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-primary shrink-0" />
                <span>{profile.phone || "No phone added"}</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-primary shrink-0" />
                <span>Registered: {formatDate(profile.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Tabbed Form Panels */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card shadow-soft overflow-hidden">
            {/* Tabs Header */}
            <div className="flex border-b border-border bg-muted/20 text-sm font-semibold">
              <button
                onClick={() => setActiveTab("general")}
                className={`flex-1 py-3.5 text-center transition border-b-2 outline-none ${
                  activeTab === "general"
                    ? "border-primary text-primary bg-background/50 font-bold"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/10"
                }`}
              >
                Profile Details
              </button>
              <button
                onClick={() => setActiveTab("security")}
                className={`flex-1 py-3.5 text-center transition border-b-2 outline-none ${
                  activeTab === "security"
                    ? "border-primary text-primary bg-background/50 font-bold"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/10"
                }`}
              >
                Security & Password
              </button>
            </div>

            {/* General Profile Tab */}
            {activeTab === "general" && (
              <form onSubmit={handleUpdateProfile} className="p-6 space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Display Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        required
                        type="text"
                        minLength={2}
                        maxLength={80}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="input-field pl-10"
                        placeholder="Your full name"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Job Title</label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        maxLength={80}
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        className="input-field pl-10"
                        placeholder="e.g. Senior Administrator"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Contact Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="input-field pl-10"
                        placeholder="+91 XXXXX XXXXX"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Official Address (Optional)</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-4 h-4 w-4 text-muted-foreground" />
                    <textarea
                      rows={4}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="input-field pl-10 pt-3 resize-none"
                      placeholder="Enter official/delivery address details..."
                    />
                  </div>
                </div>

                <div className="border-t border-border/60 pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={updating}
                    className="flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-bold uppercase tracking-wider text-primary-foreground transition hover:bg-primary-glow disabled:opacity-60"
                  >
                    <Save className="h-4.5 w-4.5" />
                    {updating ? "Saving..." : "Save Profile Details"}
                  </button>
                </div>
              </form>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <form onSubmit={handleChangePassword} className="p-6 space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Current Password</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      required
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="input-field pl-10"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">New Password</label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        required
                        type="password"
                        minLength={8}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="input-field pl-10"
                        placeholder="Min 8 characters"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Confirm New Password</label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        required
                        type="password"
                        minLength={8}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="input-field pl-10"
                        placeholder="Confirm new password"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-border/60 pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={updating}
                    className="flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-bold uppercase tracking-wider text-primary-foreground transition hover:bg-primary-glow disabled:opacity-60"
                  >
                    <Key className="h-4.5 w-4.5" />
                    {updating ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
