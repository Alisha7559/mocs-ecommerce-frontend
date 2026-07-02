import React from "react";
import { X, Trash2 } from "lucide-react";

interface CollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  newCollName: string;
  setNewCollName: (val: string) => void;
  handleCreateCollection: (e: React.FormEvent) => void;
  collections: any[];
  handleDeleteCollection: (id: string, name: string) => void;
}

export function CollectionModal({
  isOpen,
  onClose,
  newCollName,
  setNewCollName,
  handleCreateCollection,
  collections,
  handleDeleteCollection,
}: CollectionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-secondary/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-card animate-in fade-in zoom-in-95 duration-200">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-xl font-bold">Manage Collections</h3>
          <button onClick={onClose} className="rounded-full p-1.5 hover:bg-accent text-muted-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Existing Collections list */}
        <div className="mb-6 max-h-48 overflow-y-auto rounded-2xl border border-border bg-muted/10 p-3 space-y-2">
          {collections.map((coll) => (
            <div key={coll._id} className="flex items-center justify-between rounded-xl bg-card border border-border/50 p-2.5">
              <span className="text-sm font-semibold">{coll.name}</span>
              <button
                onClick={() => handleDeleteCollection(coll._id, coll.name)}
                className="text-destructive hover:bg-destructive/10 p-1.5 rounded-lg transition"
                title="Delete Collection"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          {collections.length === 0 && (
            <p className="text-center text-xs text-muted-foreground py-4">No collections created yet.</p>
          )}
        </div>

        {/* Create collection form */}
        <form onSubmit={handleCreateCollection} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
              New Collection Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Winter Edition"
              value={newCollName}
              onChange={(e) => {
                const val = e.target.value;
                setNewCollName(val.charAt(0).toUpperCase() + val.slice(1));
              }}
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-full bg-primary py-2.5 text-sm font-bold uppercase tracking-wider text-primary-foreground transition hover:bg-primary-glow"
          >
            Create Collection
          </button>
        </form>
      </div>
    </div>
  );
}
