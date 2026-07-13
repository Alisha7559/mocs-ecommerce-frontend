import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { User, Phone, MapPin, Calendar, Edit3, Key, Save, Mail } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { apiClient } from "@/lib/api";
import { isAuthed } from "@/lib/auth";
import { formatDate } from "@/lib/utils";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "My Profile — MOCS" },
      { name: "description", content: "View and edit your MOCS account details." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const navigate = useNavigate();
  const { logout, setUser } = useStore();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Forms state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [currPwd, setCurrPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [updating, setUpdating] = useState(false);
  const [pwdUpdating, setPwdUpdating] = useState(false);

  const [feedbackSubject, setFeedbackSubject] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  useEffect(() => {
    if (!isAuthed()) {
      navigate({ to: "/auth", search: { redirect: "/profile" } });
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        const profRes = await apiClient.users.getProfile();
        setProfile(profRes);
        setName(profRes.name);
        setPhone(profRes.phone || "");
        setAddress(profRes.address || "");
      } catch (err: any) {
        console.error("Failed to load profile details", err);
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const updated = await apiClient.users.updateProfile({ name, phone, address });
      setProfile((prev: any) => ({ ...prev, ...updated }));
      setUser(updated);
      toast.success("Profile details updated successfully");
    } catch (err: any) {
      toast.error(err?.message || "Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPwd !== confirmPwd) {
      toast.error("New passwords do not match");
      return;
    }
    setPwdUpdating(true);
    try {
      await apiClient.users.changePassword({ currentPassword: currPwd, newPassword: newPwd });
      setCurrPwd("");
      setNewPwd("");
      setConfirmPwd("");
      toast.success("Password changed successfully");
    } catch (err: any) {
      toast.error(err?.message || "Failed to change password");
    } finally {
      setPwdUpdating(false);
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackLoading(true);
    try {
      await apiClient.queries.create({
        name: profile?.name || name,
        email: profile?.email || "",
        subject: feedbackSubject,
        message: feedbackMessage,
      });
      setFeedbackSubject("");
      setFeedbackMessage("");
      toast.success("Feedback submitted successfully!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to submit feedback");
    } finally {
      setFeedbackLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#FAF9F6] text-stone-900">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-stone-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8 text-left animate-in fade-in duration-300">
        <div>
          <h1 className="font-display text-4xl font-extrabold text-stone-900">My Account</h1>
          <p className="mt-2 text-stone-500 font-medium">Manage your personal information and security preferences.</p>
        </div>

        {/* side-by-side grid of 3 cards */}
        <div className="grid gap-6 md:grid-cols-3 items-stretch">
          {/* Card 1: User Summary */}
          <div className="rounded-3xl border border-stone-200/80 bg-white p-6 flex flex-col justify-between shadow-soft">
            <div className="space-y-6">
              <div className="flex flex-col items-center text-center">
                <span className="grid h-20 w-20 place-items-center rounded-full bg-primary/10 text-primary font-display text-3xl font-bold uppercase">
                  {profile.name.charAt(0)}
                </span>
                <h2 className="mt-4 font-display text-xl font-bold text-stone-900 truncate max-w-full">{profile.name}</h2>
                <p className="text-sm text-stone-500 truncate max-w-full">{profile.email}</p>
                <span className="mt-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
                  {profile.role}
                </span>
              </div>

              <div className="space-y-4 border-t border-stone-100 pt-6 text-sm">
                <div className="flex items-center gap-3 text-stone-700">
                  <Phone className="h-4 w-4 text-primary shrink-0" />
                  <span className="truncate">{profile.phone || "No phone added"}</span>
                </div>
                <div className="flex items-center gap-3 text-stone-700">
                  <MapPin className="h-4 w-4 text-primary shrink-0" />
                  <span className="line-clamp-2">{profile.address || "No address added"}</span>
                </div>
                <div className="flex items-center gap-3 text-stone-500">
                  <Calendar className="h-4 w-4 text-primary shrink-0" />
                  <span>Registered: {formatDate(profile.createdAt)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                logout();
                navigate({ to: "/" });
              }}
              className="mt-8 w-full rounded-full bg-destructive/10 py-2.5 text-sm font-semibold text-destructive transition hover:bg-destructive/20 cursor-pointer"
            >
              Log Out
            </button>
          </div>

          {/* Card 2: Update Profile Info */}
          <div className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-soft text-left flex flex-col justify-between">
            <div>
              <h3 className="font-display text-lg font-bold text-stone-900 flex items-center gap-2 mb-4">
                <Edit3 className="h-5 w-5 text-primary" /> Update Profile
              </h3>
              <form id="profile-form" onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-stone-500">Full Name</label>
                  <input
                    required
                    value={name}
                    onChange={(e) => {
                      const val = e.target.value;
                      setName(val.charAt(0).toUpperCase() + val.slice(1));
                    }}
                    className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm text-stone-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-stone-500">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    maxLength={10}
                    onKeyPress={(e) => {
                      if (!/[0-9]/.test(e.key)) e.preventDefault();
                    }}
                    onChange={(e) => {
                      setPhone(e.target.value.replace(/[^0-9]/g, "").slice(0, 10));
                    }}
                    className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm text-stone-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    placeholder="10-digit number"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-stone-500">Address</label>
                  <textarea
                    rows={2}
                    value={address}
                    onChange={(e) => {
                      const val = e.target.value;
                      setAddress(val.charAt(0).toUpperCase() + val.slice(1));
                    }}
                    className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm text-stone-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
                    placeholder="Enter delivery address"
                  />
                </div>
              </form>
            </div>
            <button
              type="submit"
              form="profile-form"
              disabled={updating}
              className="mt-6 w-full rounded-full bg-primary py-3 text-sm font-bold uppercase tracking-wider text-primary-foreground transition hover:bg-primary-glow disabled:opacity-60 cursor-pointer"
            >
              {updating ? "Saving..." : "Save Details"}
            </button>
          </div>

          {/* Card 3: Change Password */}
          <div className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-soft text-left flex flex-col justify-between">
            <div>
              <h3 className="font-display text-lg font-bold text-stone-900 flex items-center gap-2 mb-4">
                <Key className="h-5 w-5 text-primary" /> Security
              </h3>
              <form id="pwd-form" onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-stone-500">Current Password</label>
                  <input
                    required
                    type="password"
                    value={currPwd}
                    onChange={(e) => setCurrPwd(e.target.value)}
                    className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm text-stone-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-stone-500">New Password</label>
                  <input
                    required
                    type="password"
                    value={newPwd}
                    onChange={(e) => setNewPwd(e.target.value)}
                    className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm text-stone-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    minLength={8}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-stone-500">Confirm Password</label>
                  <input
                    required
                    type="password"
                    value={confirmPwd}
                    onChange={(e) => setConfirmPwd(e.target.value)}
                    className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm text-stone-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    minLength={8}
                  />
                </div>
              </form>
            </div>
            <button
              type="submit"
              form="pwd-form"
              disabled={pwdUpdating}
              className="mt-6 w-full rounded-full bg-stone-900 py-3 text-sm font-bold uppercase tracking-wider text-white transition hover:bg-stone-850 disabled:opacity-60 cursor-pointer"
            >
              {pwdUpdating ? "Updating..." : "Update Password"}
            </button>
          </div>
        </div>

        {/* Feedback & Support Card */}
        <div className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-soft max-w-2xl text-left">
          <h3 className="font-display text-lg font-bold text-stone-900 flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" /> Feedback & Support
          </h3>
          <p className="mt-1 text-sm text-stone-500 mb-4">Have queries or suggestions? Send a query directly to our support desk.</p>
          <form onSubmit={handleFeedbackSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                required
                placeholder="Subject"
                value={feedbackSubject}
                onChange={(e) => {
                  const val = e.target.value;
                  setFeedbackSubject(val.charAt(0).toUpperCase() + val.slice(1));
                }}
                className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm text-stone-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <textarea
              required
              placeholder="Explain your query or feedback in detail..."
              value={feedbackMessage}
              onChange={(e) => {
                const val = e.target.value;
                setFeedbackMessage(val.charAt(0).toUpperCase() + val.slice(1));
              }}
              rows={3}
              className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm text-stone-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
            />
            <button
              type="submit"
              disabled={feedbackLoading}
              className="rounded-full bg-primary px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-primary-foreground transition hover:bg-primary-glow disabled:opacity-60 cursor-pointer"
            >
              {feedbackLoading ? "Sending..." : "Submit Inquiry"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
