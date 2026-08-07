import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Users, Search, Edit3, Trash2, RotateCcw, X, AlertTriangle, Eye, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";
import { AdminDropdown } from "@/components/admin/AdminShell";
import { formatDate } from "@/lib/utils";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/admin/users")({
  head: () => ({
    meta: [
      { title: "Manage Users — MOCS Admin" },
    ],
  }),
  component: AdminUsers,
});

function AdminUsers() {
  const { user } = useStore();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [showDeleted, setShowDeleted] = useState("false");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState("user");
  const [editPhone, setEditPhone] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [saving, setSaving] = useState(false);

  // Add modal state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addName, setAddName] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [addPassword, setAddPassword] = useState("");
  const [addRole, setAddRole] = useState("admin");
  const [addPhone, setAddPhone] = useState("");
  const [addAddress, setAddAddress] = useState("");

  // Delete confirmation modal state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const queryStr = `search=${encodeURIComponent(search)}&role=${roleFilter}&showDeleted=${showDeleted}&page=${page}&limit=10`;
      const res = await apiClient.users.list(queryStr);
      setUsers(res.items);
      setTotalPages(res.pages);
      setTotalItems(res.total);
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to load user list", { id: "load-users-error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter, showDeleted]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const openEditModal = (user: any) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditRole(user.role);
    setEditPhone(user.phone || "");
    setEditAddress(user.address || "");
    setEditModalOpen(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    
    setSaving(true);
    try {
      await apiClient.users.update(editingUser._id, {
        name: editName,
        email: editEmail,
        role: editRole,
        phone: editPhone,
        address: editAddress,
      });
      toast.success("User updated successfully");
      setEditModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      toast.error(err?.message || "Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiClient.users.create({
        name: addName,
        email: addEmail,
        password: addPassword,
        role: addRole,
        phone: addPhone,
        address: addAddress,
      });
      toast.success("User created successfully");
      setAddModalOpen(false);
      setAddName("");
      setAddEmail("");
      setAddPassword("");
      setAddRole("admin");
      setAddPhone("");
      setAddAddress("");
      fetchUsers();
    } catch (err: any) {
      toast.error(err?.message || "Failed to create user");
    } finally {
      setSaving(false);
    }
  };

  const triggerSoftDelete = (user: any) => {
    setUserToDelete(user);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await apiClient.users.delete(userToDelete._id);
      toast.success(`User '${userToDelete.name}' soft-deleted`);
      setDeleteConfirmOpen(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (err: any) {
      toast.error(err?.message || "Failed to soft-delete user");
    }
  };

  const handleRestoreUser = async (user: any) => {
    try {
      await apiClient.users.restore(user._id);
      toast.success(`User '${user.name}' restored successfully`);
      fetchUsers();
    } catch (err: any) {
      toast.error(err?.message || "Failed to restore user");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-foreground flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" /> User Accounts
          </h1>
          <p className="text-muted-foreground text-sm">Review, edit, and deactivate user accounts.</p>
        </div>
        {user?.role === "superadmin" && (
          <button
            onClick={() => setAddModalOpen(true)}
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-bold uppercase tracking-wider text-primary-foreground hover:bg-primary-glow flex items-center gap-2 shadow-md shadow-orange-500/15 cursor-pointer"
          >
            <UserPlus className="h-4 w-4" /> Add
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <button type="submit" className="rounded-full bg-primary px-5 py-2.5 text-sm font-bold uppercase tracking-wider text-primary-foreground hover:bg-primary-glow">
            Search
          </button>

          <div className="flex flex-wrap gap-2 items-center">
            <AdminDropdown
              value={roleFilter}
              onChange={(val) => {
                setRoleFilter(val);
                setPage(1);
              }}
              options={[
                { value: "", label: "All Roles" },
                { value: "user", label: "User" },
                // { value: "admin", label: "Admin" },
                { value: "superadmin", label: "Super Admin" },
              ]}
            />

            <AdminDropdown
              value={showDeleted}
              onChange={(val) => {
                setShowDeleted(val);
                setPage(1);
              }}
              options={[
                { value: "false", label: "Active Accounts" },
                { value: "true", label: "Deleted Accounts" },
                { value: "all", label: "All Accounts" },
              ]}
            />
          </div>
        </form>
      </div>

      {/* Users Data Table */}
      <div className="rounded-2xl border border-border bg-card shadow-soft overflow-hidden">
        {loading ? (
          <div className="flex py-20 justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-sm">No user accounts found matching your query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted text-muted-foreground text-xs font-bold uppercase border-b border-border">
                <tr>
                  <th className="p-4">Customer Details</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Phone / Address</th>
                  <th className="p-4">Created Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((u) => (
                  <tr key={u._id} className={u.isDeleted ? "opacity-60 bg-muted/10" : "hover:bg-muted/10 transition"}>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <span className="grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-primary font-display font-bold uppercase text-sm">
                          {u.name.charAt(0)}
                        </span>
                        <div>
                          <p className="font-semibold text-foreground flex items-center gap-1.5">
                            {u.name}
                            {u.isDeleted && (
                              <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[8px] font-bold uppercase text-destructive tracking-wider">
                                deleted
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        u.role === "superadmin"
                          ? "bg-purple-500/10 text-purple-500"
                          : u.role === "admin"
                            ? "bg-primary/10 text-primary"
                            : "bg-blue-500/10 text-blue-500"
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <p className="font-medium text-xs truncate max-w-[150px]">{u.phone || "—"}</p>
                      <p className="text-muted-foreground text-xs truncate max-w-[200px]">{u.address || "—"}</p>
                    </td>
                    <td className="p-4 text-xs font-semibold text-muted-foreground">
                      {formatDate(u.createdAt)}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex gap-1.5 justify-end">
                        {u.role === "user" ? (
                          <button
                            onClick={() => openEditModal(u)}
                            className="rounded-xl border border-border p-2 text-muted-foreground transition hover:border-primary hover:text-primary"
                            title="View Customer Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => openEditModal(u)}
                            disabled={u.role === "superadmin" && u._id !== editingUser?._id}
                            className="rounded-xl border border-border p-2 text-muted-foreground transition hover:border-primary hover:text-primary"
                            title="Edit User"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                        )}
                        {u.isDeleted ? (
                          <button
                            onClick={() => handleRestoreUser(u)}
                            className="rounded-xl border border-border p-2 text-emerald-500 transition hover:bg-emerald-500/10 hover:border-emerald-500"
                            title="Restore User"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => triggerSoftDelete(u)}
                            disabled={u.role === "superadmin"}
                            className="rounded-xl border border-border p-2 text-destructive transition hover:bg-destructive/10 hover:border-destructive"
                            title="Delete User"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination control */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border p-4 bg-muted/5">
            <span className="text-xs text-muted-foreground font-semibold">
              Showing page {page} of {totalPages} ({totalItems} users total)
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-xl border border-border bg-background px-4 py-2 text-xs font-bold transition hover:bg-accent disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-xl border border-border bg-background px-4 py-2 text-xs font-bold transition hover:bg-accent disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-secondary/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-card animate-in fade-in zoom-in-95 duration-200">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-xl font-bold">
                {editingUser?.role === "user" ? "Customer Details" : "Edit Account Details"}
              </h3>
              <button onClick={() => setEditModalOpen(false)} className="rounded-full p-1.5 hover:bg-accent">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {editingUser?.role === "user" ? (
              <div className="space-y-4 text-left">
                <div className="border-b border-stone-100 pb-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Full Name</p>
                  <p className="text-sm font-semibold text-stone-850 mt-0.5">{editName}</p>
                </div>
                <div className="border-b border-stone-100 pb-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Email Address</p>
                  <p className="text-sm font-semibold text-stone-850 mt-0.5">{editEmail}</p>
                </div>
                <div className="border-b border-stone-100 pb-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Account Role</p>
                  <span className="inline-block rounded-full bg-blue-500/10 text-blue-600 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider mt-1">
                    Customer
                  </span>
                </div>
                <div className="border-b border-stone-100 pb-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Phone Number</p>
                  <p className="text-sm font-semibold text-stone-850 mt-0.5">{editPhone || "—"}</p>
                </div>
                <div className="pb-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Delivery Address</p>
                  <p className="text-sm font-semibold text-stone-850 mt-0.5 whitespace-pre-wrap">{editAddress || "—"}</p>
                </div>
                         <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="w-full rounded-full bg-primary py-3 text-sm font-bold uppercase tracking-wider text-primary-foreground transition hover:bg-primary-glow cursor-pointer shadow-md shadow-orange-500/10"
                >
                  Close View
                </button>
              </div>
            ) : (
              <form onSubmit={handleUpdateUser} className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Full Name</label>
                  <input required value={editName} onChange={(e) => setEditName(e.target.value)} className="input-field disabled:opacity-60 disabled:bg-stone-50" disabled={editingUser?.role === "user"} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Address</label>
                  <input required type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="input-field disabled:opacity-60 disabled:bg-stone-50" disabled={editingUser?.role === "user"} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Account Role</label>
                  <AdminDropdown
                    value={editRole}
                    onChange={setEditRole}
                    className="w-full"
                    options={[
                      { value: "user", label: "User" },
                      { value: "admin", label: "Admin" },
                      { value: "superadmin", label: "Super Admin" },
                    ]}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Phone Number</label>
                  <input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} className="input-field disabled:opacity-60 disabled:bg-stone-50" disabled={editingUser?.role === "user"} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Delivery Address</label>
                  <textarea rows={2} value={editAddress} onChange={(e) => setEditAddress(e.target.value)} className="input-field resize-none disabled:opacity-60 disabled:bg-stone-50" disabled={editingUser?.role === "user"} />
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-full bg-primary py-3 text-sm font-bold uppercase tracking-wider text-primary-foreground transition hover:bg-primary-glow disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-secondary/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-card animate-in fade-in zoom-in-95 duration-200">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-xl font-bold">Add Sub Admin Account</h3>
              <button onClick={() => setAddModalOpen(false)} className="rounded-full p-1.5 hover:bg-accent cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="space-y-4" autoComplete="off">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Full Name</label>
                <input required value={addName} onChange={(e) => setAddName(e.target.value)} className="input-field" placeholder="John Doe" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Address</label>
                <input required type="email" value={addEmail} onChange={(e) => setAddEmail(e.target.value)} className="input-field" placeholder="john@example.com" autoComplete="new-email" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Password</label>
                <input required type="password" value={addPassword} onChange={(e) => setAddPassword(e.target.value)} className="input-field" placeholder="••••••••" minLength={8} autoComplete="new-password" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Account Role</label>
                <AdminDropdown
                  value={addRole}
                  onChange={setAddRole}
                  className="w-full"
                  options={[
                    { value: "admin", label: "Admin" },
                    { value: "superadmin", label: "Super Admin" },
                  ]}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Phone Number</label>
                <input value={addPhone} onChange={(e) => setAddPhone(e.target.value)} className="input-field" placeholder="10-digit number" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Delivery Address</label>
                <textarea rows={2} value={addAddress} onChange={(e) => setAddAddress(e.target.value)} className="input-field resize-none" placeholder="Enter address..." />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-full bg-primary py-3 text-sm font-bold uppercase tracking-wider text-primary-foreground transition hover:bg-primary-glow disabled:opacity-60 cursor-pointer shadow-md shadow-orange-500/10"
              >
                {saving ? "Creating..." : "Create Account"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Soft Delete Confirmation Modal */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-secondary/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-card animate-in fade-in zoom-in-95 duration-200">
            <div className="text-center">
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-destructive/10 text-destructive mb-4">
                <AlertTriangle className="h-6 w-6" />
              </span>
              <h3 className="font-display text-lg font-bold">Deactivate User Account?</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Are you sure you want to soft-delete <strong>{userToDelete?.name}</strong>? They will be logged out and unable to log back in until restored.
              </p>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setDeleteConfirmOpen(false)}
                className="flex-1 rounded-full border border-border bg-background py-2.5 text-sm font-semibold transition hover:bg-accent"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 rounded-full bg-destructive py-2.5 text-sm font-bold uppercase tracking-wider text-destructive-foreground transition hover:bg-destructive/90"
              >
                Deactivate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
