import { useState, KeyboardEvent } from "react";
import { Idea } from "@/data/defaultIdeas";
import { X, Plus, LayoutGrid, Pencil } from "lucide-react";
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

interface IdeaSidebarProps {
  ideas: Idea[];
  /** null = Übersicht statt einer einzelnen Idee */
  activeId: string | null;
  onSelect: (id: string) => void;
  onOverview: () => void;
  onAdd: (name: string) => Promise<string>;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}

export function IdeaSidebar({ ideas, activeId, onSelect, onOverview, onAdd, onRename, onDelete }: IdeaSidebarProps) {
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

  const startRenaming = (idea: Idea) => {
    setEditingId(idea.id);
    setEditName(idea.name);
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

  const confirmDelete = () => {
    if (!deleteTargetId) return;
    // Wer die offene Idee löscht, landet auf der Nachbar-Idee – sonst auf der Übersicht.
    if (deleteTargetId === activeId) {
      const idx = ideas.findIndex((i) => i.id === deleteTargetId);
      const neighbour = ideas[idx === 0 ? 1 : idx - 1];
      if (neighbour) onSelect(neighbour.id);
      else onOverview();
    }
    onDelete(deleteTargetId);
    setDeleteTargetId(null);
  };

  return (
    <>
      <aside className="w-64 shrink-0 flex flex-col bg-card border-r border-border">
        <div className="p-3 border-b border-border">
          <button
            onClick={onOverview}
            title="Alle Ideen im Ranking"
            className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeId === null
                ? "bg-primary text-primary-foreground shadow-monday"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <LayoutGrid size={16} />
            Übersicht
          </button>
        </div>

        <nav className="flex-1 min-h-0 overflow-y-auto p-3 space-y-1">
          <p className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Ideen ({ideas.length})
          </p>

          {ideas.map((idea) => {
            const isActive = idea.id === activeId;
            return (
              <div
                key={idea.id}
                onClick={() => onSelect(idea.id)}
                title={idea.name}
                className={`group flex items-center gap-2 px-3 py-2 cursor-pointer select-none rounded-lg text-sm font-semibold transition-all ${
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
                    className="flex-1 min-w-0 bg-transparent border-b-2 border-primary text-foreground text-sm font-semibold outline-none"
                  />
                ) : (
                  <span
                    className="flex-1 min-w-0 truncate"
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      startRenaming(idea);
                    }}
                  >
                    {idea.name}
                  </span>
                )}
                {editingId !== idea.id && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startRenaming(idea);
                      }}
                      title="Titel bearbeiten"
                      className={`shrink-0 rounded-full p-0.5 opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity ${
                        isActive ? "hover:bg-primary-foreground/20" : "hover:bg-muted"
                      }`}
                    >
                      <Pencil size={13} />
                    </button>
                    {ideas.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTargetId(idea.id);
                        }}
                        title="Idee löschen"
                        className={`shrink-0 rounded-full p-0.5 opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity ${
                          isActive ? "hover:bg-primary-foreground/20" : "hover:bg-muted"
                        }`}
                      >
                        <X size={14} />
                      </button>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border">
          {adding ? (
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onBlur={() => { if (!newName.trim()) setAdding(false); else handleAdd(); }}
              onKeyDown={handleAddKey}
              placeholder="Name der Idee..."
              className="w-full px-3 py-2 bg-transparent border-b-2 border-primary text-foreground text-sm font-semibold outline-none"
            />
          ) : (
            <button
              onClick={() => setAdding(true)}
              title="Neue Business-Idee anlegen"
              className="flex items-center gap-1.5 w-full px-3 py-2 text-sm font-semibold text-primary hover:bg-primary/10 rounded-lg transition-colors"
            >
              <Plus size={16} />
              Neue Idee
            </button>
          )}
        </div>
      </aside>

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
              onClick={confirmDelete}
            >
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
