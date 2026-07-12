import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { MAX_WEIGHT, MIN_WEIGHT } from "@/data/criteria";
import { useCriteria } from "@/hooks/useCriteria";
import { ArrowLeft, Eye, EyeOff, Pencil, Plus, RotateCcw, Scale, Trash2, Undo2 } from "lucide-react";
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

const emptyDraft = { name: "", weight: "5", hint1: "", hint5: "" };

const Settings = () => {
  const {
    categories,
    weights,
    setWeight,
    resetWeights,
    addCriterion,
    deleteCriterion,
    renameCriterion,
    restoreCriterion,
    restoreStandardCriteria,
    hiddenCriteria,
    deletedCount,
  } = useCriteria();
  const [addingIn, setAddingIn] = useState<string | null>(null);
  const [draft, setDraft] = useState(emptyDraft);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string; custom: boolean } | null>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  // Escape darf den Namen nicht speichern – auch nicht über das folgende onBlur.
  const cancelledRef = useRef(false);

  const totalWeight = categories.reduce(
    (sum, cat) => sum + cat.criteria.reduce((s, cr) => s + (weights?.[cr.id] ?? cr.weight), 0),
    0
  );

  const startRenaming = (id: string, name: string) => {
    cancelledRef.current = false;
    setEditingId(id);
    setEditName(name);
  };

  const commitRename = (id: string) => {
    if (cancelledRef.current) {
      cancelledRef.current = false;
      return;
    }
    if (editName.trim()) renameCriterion(id, editName);
    setEditingId(null);
  };

  const cancelRename = () => {
    cancelledRef.current = true;
    setEditingId(null);
  };

  const startAdding = (categoryId: string) => {
    setAddingIn(categoryId);
    setDraft(emptyDraft);
  };

  const submitDraft = (categoryId: string) => {
    if (!draft.name.trim()) return;
    addCriterion({
      categoryId,
      name: draft.name,
      weight: parseInt(draft.weight) || 0,
      hints: { 1: draft.hint1.trim(), 5: draft.hint5.trim() },
    });
    setAddingIn(null);
    setDraft(emptyDraft);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-3 flex items-center gap-4 shadow-monday">
        <Link
          to="/"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
        >
          <ArrowLeft size={14} />
          Zurück
        </Link>
        <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Scale size={18} className="text-primary" />
          Kriterien & Gewichtung
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-sm text-muted-foreground mb-6">
            Diese Einstellungen gelten <span className="font-semibold text-foreground">global für alle Ideen</span>.
            Jedes Kriterium wird hier einmal auf einer Skala von{" "}
            <span className="font-semibold text-foreground">{MIN_WEIGHT}–{MAX_WEIGHT}</span> gewichtet und fliesst
            mit diesem Gewicht in jede Idee und ins Ranking ein. Neue Kriterien erscheinen sofort in allen
            Projekten.
          </p>

          {categories.map((cat) => {
            const catWeight = cat.criteria.reduce((s, cr) => s + (weights?.[cr.id] ?? cr.weight), 0);
            return (
              <div key={cat.id} className="mb-8">
                <div
                  className="flex items-center gap-3 mb-3 pb-2 border-b-2"
                  style={{ borderColor: cat.color }}
                >
                  <h2 className="text-base font-bold" style={{ color: cat.color }}>
                    {cat.name}
                  </h2>
                  <span
                    className="text-xs font-bold px-2.5 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: cat.color }}
                  >
                    {catWeight} Pkt.
                  </span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {totalWeight > 0 ? Math.round((catWeight / totalWeight) * 100) : 0}% des Gesamtscores
                  </span>
                </div>

                <div className="space-y-1.5">
                  {cat.criteria.map((cr) => {
                    const w = weights?.[cr.id] ?? cr.weight;
                    const share = totalWeight > 0 ? (w / totalWeight) * 100 : 0;
                    return (
                      <div key={cr.id} className="flex items-center gap-3">
                        <div className="w-60 shrink-0 min-w-0">
                          {editingId === cr.id ? (
                            <input
                              autoFocus
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              onBlur={() => commitRename(cr.id)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") commitRename(cr.id);
                                if (e.key === "Escape") cancelRename();
                              }}
                              className="w-full h-8 bg-secondary border border-border rounded-md text-foreground text-sm px-2 outline-none focus:ring-2 focus:ring-ring transition-all"
                            />
                          ) : (
                            <button
                              onClick={() => startRenaming(cr.id, cr.name)}
                              title="Kriterium umbenennen"
                              className="group flex items-center gap-1.5 w-full min-w-0 text-left"
                            >
                              <span className="text-sm text-foreground truncate">{cr.name}</span>
                              {cr.custom && (
                                <span className="text-[10px] font-semibold text-muted-foreground uppercase shrink-0">
                                  eigen
                                </span>
                              )}
                              <Pencil
                                size={11}
                                className="shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                              />
                            </button>
                          )}
                        </div>
                        <input
                          type="number"
                          min={MIN_WEIGHT}
                          max={MAX_WEIGHT}
                          value={w}
                          onChange={(e) => setWeight(cr.id, parseInt(e.target.value))}
                          title={`Gewichtung ${MIN_WEIGHT}–${MAX_WEIGHT}`}
                          className="w-14 h-8 text-center text-xs font-bold bg-secondary border border-border rounded-md text-foreground outline-none focus:ring-2 focus:ring-ring transition-all"
                        />
                        <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{ width: `${share}%`, backgroundColor: cat.color }}
                          />
                        </div>
                        <span className="text-[11px] text-muted-foreground w-11 text-right tabular-nums">
                          {share.toFixed(1)}%
                        </span>
                        <button
                          onClick={() => setDeleteTarget({ id: cr.id, name: cr.name, custom: !!cr.custom })}
                          className="text-muted-foreground hover:text-destructive transition-colors p-1"
                          title="Kriterium löschen"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Neues Kriterium */}
                {addingIn === cat.id ? (
                  <div className="mt-3 bg-card border border-border rounded-lg p-3 space-y-2 shadow-monday">
                    <div className="flex gap-2">
                      <input
                        autoFocus
                        value={draft.name}
                        onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                        placeholder="Name des Kriteriums"
                        className="flex-1 bg-secondary border border-border rounded-md text-foreground text-sm p-2 outline-none focus:ring-2 focus:ring-ring transition-all"
                      />
                      <input
                        type="number"
                        min={MIN_WEIGHT}
                        max={MAX_WEIGHT}
                        value={draft.weight}
                        onChange={(e) => setDraft({ ...draft, weight: e.target.value })}
                        title={`Gewichtung ${MIN_WEIGHT}–${MAX_WEIGHT}`}
                        className="w-16 bg-secondary border border-border rounded-md text-foreground text-sm text-center font-bold p-2 outline-none focus:ring-2 focus:ring-ring transition-all"
                      />
                    </div>
                    <div className="flex gap-2">
                      <input
                        value={draft.hint1}
                        onChange={(e) => setDraft({ ...draft, hint1: e.target.value })}
                        placeholder="Bedeutung von 1 (schlecht)"
                        className="flex-1 bg-secondary border border-border rounded-md text-foreground text-xs p-2 outline-none focus:ring-2 focus:ring-ring transition-all"
                      />
                      <input
                        value={draft.hint5}
                        onChange={(e) => setDraft({ ...draft, hint5: e.target.value })}
                        placeholder="Bedeutung von 5 (top)"
                        className="flex-1 bg-secondary border border-border rounded-md text-foreground text-xs p-2 outline-none focus:ring-2 focus:ring-ring transition-all"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => submitDraft(cat.id)}
                        disabled={!draft.name.trim()}
                        className="px-3 py-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity disabled:opacity-40"
                      >
                        Kriterium anlegen
                      </button>
                      <button
                        onClick={() => setAddingIn(null)}
                        className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Abbrechen
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => startAdding(cat.id)}
                    className="mt-3 flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 rounded-md transition-colors"
                  >
                    <Plus size={14} />
                    Kriterium hinzufügen
                  </button>
                )}
              </div>
            );
          })}

          {hiddenCriteria.length > 0 && (
            <div className="mb-8 border-t border-border pt-5">
              <div className="flex items-center gap-2 mb-1">
                <EyeOff size={14} className="text-muted-foreground" />
                <h2 className="text-base font-bold text-foreground">Ausgeblendete Kriterien</h2>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-secondary text-muted-foreground">
                  {hiddenCriteria.length}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Diese Kriterien zählen nicht in den Score. Gewicht und bisherige Bewertungen bleiben
                erhalten – beim Einblenden ist alles wieder da.
              </p>

              <div className="space-y-1.5">
                {hiddenCriteria.map((cr) => (
                  <div
                    key={cr.id}
                    className="flex items-center gap-3 bg-secondary/50 border border-border rounded-lg px-3 py-2"
                  >
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white shrink-0"
                      style={{ backgroundColor: cr.color }}
                    >
                      {cr.categoryName}
                    </span>
                    <span className="text-sm text-muted-foreground truncate">{cr.name}</span>
                    <span className="text-[11px] text-muted-foreground ml-auto shrink-0 tabular-nums">
                      Gewicht {weights?.[cr.id] ?? "–"}
                    </span>
                    <button
                      onClick={() => restoreCriterion(cr.id)}
                      className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-foreground bg-card border border-border rounded-md hover:bg-secondary transition-colors shrink-0"
                      title={`„${cr.name}" wieder einblenden und mitbewerten`}
                    >
                      <Eye size={13} />
                      Einblenden
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-border pt-4">
            <div className="text-sm text-muted-foreground">
              Gesamt: <span className="font-bold text-foreground">{totalWeight} Pkt.</span>
            </div>
            <div className="flex items-center gap-1">
              {deletedCount > 1 && (
                <button
                  onClick={restoreStandardCriteria}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                  title="Alle ausgeblendeten Standard-Kriterien wieder einblenden"
                >
                  <Undo2 size={14} />
                  Alle {deletedCount} einblenden
                </button>
              )}
              <button
                onClick={() => setResetOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
              >
                <RotateCcw size={14} />
                Gewichte auf Standard zurücksetzen
              </button>
            </div>
          </div>
        </div>
      </div>

      <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kriterium „{deleteTarget?.name}" löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Das Kriterium verschwindet aus allen Ideen und aus der Bewertung.
              {deleteTarget?.custom
                ? " Eigene Kriterien lassen sich nicht wiederherstellen."
                : " Standard-Kriterien kannst du unten jederzeit wiederherstellen – die bisherigen Bewertungen sind dann wieder da."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteTarget) deleteCriterion(deleteTarget.id);
                setDeleteTarget(null);
              }}
            >
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={resetOpen} onOpenChange={setResetOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Gewichte zurücksetzen?</AlertDialogTitle>
            <AlertDialogDescription>
              Alle Gewichte gehen auf die Standardwerte zurück. Eigene Kriterien bleiben bestehen und
              erhalten wieder ihr ursprüngliches Gewicht.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                resetWeights();
                setResetOpen(false);
              }}
            >
              Zurücksetzen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Settings;
