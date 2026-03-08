import { useState, KeyboardEvent } from "react";
import { Idea } from "@/data/defaultIdeas";
import { X, Plus } from "lucide-react";

interface IdeaTabsProps {
  ideas: Idea[];
  activeId: string;
  onSelect: (id: string) => void;
  onAdd: (name: string) => string;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  compareMode: boolean;
  onToggleCompare: () => void;
}

export function IdeaTabs({ ideas, activeId, onSelect, onAdd, onRename, onDelete, compareMode, onToggleCompare }: IdeaTabsProps) {
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const handleAdd = () => {
    if (newName.trim()) {
      const id = onAdd(newName.trim());
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
    <div style={{ borderBottom: "1px solid hsl(0 0% 18%)" }} className="flex items-center gap-0 overflow-x-auto">
      {ideas.map((idea) => (
        <div
          key={idea.id}
          onClick={() => { if (!compareMode) onSelect(idea.id); }}
          className="flex items-center gap-2 px-4 py-3 cursor-pointer select-none shrink-0 transition-colors"
          style={{
            borderRight: "1px solid hsl(0 0% 18%)",
            background: !compareMode && idea.id === activeId ? "#FFD600" : "transparent",
            color: !compareMode && idea.id === activeId ? "#080808" : "#E0E0E0",
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "1.1rem",
            letterSpacing: "0.08em",
          }}
        >
          {editingId === idea.id ? (
            <input
              autoFocus
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleRename}
              onKeyDown={handleRenameKey}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "transparent",
                border: "none",
                borderBottom: "2px solid #FFD600",
                color: !compareMode && idea.id === activeId ? "#080808" : "#E0E0E0",
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: "1.1rem",
                outline: "none",
                width: "120px",
              }}
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
                if (idea.id === activeId && ideas.length > 1) {
                  const idx = ideas.findIndex((i) => i.id === idea.id);
                  onSelect(ideas[idx === 0 ? 1 : idx - 1].id);
                }
                onDelete(idea.id);
              }}
              className="opacity-50 hover:opacity-100 transition-opacity"
              style={{ color: !compareMode && idea.id === activeId ? "#080808" : "#E0E0E0" }}
            >
              <X size={14} />
            </button>
          )}
        </div>
      ))}

      {adding ? (
        <div className="px-3 py-3 shrink-0">
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onBlur={() => { if (!newName.trim()) setAdding(false); else handleAdd(); }}
            onKeyDown={handleAddKey}
            placeholder="Name..."
            style={{
              background: "transparent",
              border: "none",
              borderBottom: "2px solid #FFD600",
              color: "#E0E0E0",
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "1.1rem",
              outline: "none",
              width: "120px",
            }}
          />
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="px-3 py-3 shrink-0 transition-colors"
          style={{ color: "#FFD600" }}
        >
          <Plus size={18} />
        </button>
      )}

      <div className="ml-auto shrink-0 px-4 py-3">
        <button
          onClick={onToggleCompare}
          style={{
            background: compareMode ? "#FFD600" : "transparent",
            color: compareMode ? "#080808" : "#FFD600",
            border: "1px solid #FFD600",
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "0.95rem",
            padding: "4px 16px",
            letterSpacing: "0.08em",
            cursor: "pointer",
          }}
        >
          {compareMode ? "← ZURÜCK" : "VERGLEICH"}
        </button>
      </div>
    </div>
  );
}
