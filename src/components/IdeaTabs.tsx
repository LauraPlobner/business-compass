import { useState, KeyboardEvent } from "react";
import { Idea } from "@/data/defaultIdeas";
import { X, Plus, GitCompareArrows, ShoppingCart } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface IdeaTabsProps {
  ideas: Idea[];
  activeId: string;
  onSelect: (id: string) => void;
  onAdd: (name: string) => Promise<string>;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  compareMode: boolean;
  salesMode: boolean;
  onToggleCompare: () => void;
  onToggleSales: () => void;
}

export function IdeaTabs({ ideas, activeId, onSelect, onAdd, onRename, onDelete, compareMode, salesMode, onToggleCompare, onToggleSales }: IdeaTabsProps) {
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const handleAdd = async () => {
    if (newName.trim()) {
      const id = await onAdd(newName.trim());
      onSelect(id);
      setNewName("");
      setAdding(false);
    }
  };

  const handleAddKey = (e: KeyboardEvent) => {
    if (e.key === "Enter") handleAdd();
    if (e.key === "Escape") { setAdding(false); setNewName(""); }
  };

  const handleRename = () => {
    if (editingId && editName.trim()) {
      onRename(editingId, editName.trim());
    }
    setEditingId(null);
  };

  const handleRenameKey = (e: KeyboardEvent) => {
    if (e.key === "Enter") handleRename();
    if (e.key === "Escape") setEditingId(null);
  };

  return (
    <>
    <div className="flex items-center gap-1 px-4 py-2 bg-card border-b border-border overflow-x-auto">
      {ideas.map((idea) => {
        const isActive = !compareMode && idea.id === activeId;
        return (
          <div
            key={idea.id}
            onClick={() => { if (!compareMode) onSelect(idea.id); }}
            className={`flex items-center gap-2 px-4 py-2 cursor-pointer select-none shrink-0 rounded-lg text-sm font-semibold transition-all ${
              isActive
                ? "bg-primary text-primary-foreground shadow-monday"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            {editingId === idea.id ? (
              <input
                autoFocus
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={handleRename}
                onKeyDown={handleRenameKey}
                onClick={(e) => e.stopPropagation()}
                className="bg-transparent border-b-2 border-primary text-foreground text-sm font-semibold outline-none w-28"
              />
            ) : (
              <span
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  setEditingId(idea.id);
                  setEditName(idea.name);
                }}
              >
                {idea.name}
              </span>
            )}
            {ideas.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteTargetId(idea.id);
                }}
                className={`opacity-40 hover:opacity-100 transition-opacity rounded-full p-0.5 ${
                  isActive ? "hover:bg-primary-foreground/20" : "hover:bg-muted"
                }`}
              >
                <X size={14} />
              </button>
            )}
          </div>
        );
      })}

      {adding ? (
        <div className="px-2 shrink-0">
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onBlur={() => { if (!newName.trim()) setAdding(false); else handleAdd(); }}
            onKeyDown={handleAddKey}
            placeholder="Name..."
            className="bg-transparent border-b-2 border-primary text-foreground text-sm font-semibold outline-none w-28"
          />
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="p-2 shrink-0 text-primary hover:bg-secondary rounded-lg transition-colors"
        >
          <Plus size={18} />
        </button>
      )}

      <div className="ml-auto shrink-0 flex items-center gap-2">
        <button
          onClick={onToggleSales}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            salesMode
              ? "bg-primary text-primary-foreground shadow-monday"
              : "text-primary border border-primary/30 hover:bg-primary/10"
          }`}
        >
          <ShoppingCart size={16} />
          {salesMode ? "← Zurück" : "Sales"}
        </button>
        <button
          onClick={onToggleCompare}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            compareMode
              ? "bg-primary text-primary-foreground shadow-monday"
              : "text-primary border border-primary/30 hover:bg-primary/10"
          }`}
        >
          <GitCompareArrows size={16} />
          {compareMode ? "← Zurück" : "Vergleich"}
        </button>
      </div>
    </div>

    <AlertDialog open={deleteTargetId !== null} onOpenChange={(open) => { if (!open) setDeleteTargetId(null); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Idee löschen?</AlertDialogTitle>
          <AlertDialogDescription>
            Diese Idee und alle zugehörigen Daten werden unwiderruflich gelöscht.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Abbrechen</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={() => {
              if (deleteTargetId) {
                if (deleteTargetId === activeId && ideas.length > 1) {
                  const idx = ideas.findIndex((i) => i.id === deleteTargetId);
                  onSelect(ideas[idx === 0 ? 1 : idx - 1].id);
                }
                onDelete(deleteTargetId);
                setDeleteTargetId(null);
              }
            }}
          >
            Löschen
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
