import { categories } from "@/data/criteria";
import { Idea, IdeaNotesType } from "@/data/defaultIdeas";
import { CustomWeights } from "@/hooks/useWeights";
import { Plus, Trash2, ExternalLink } from "lucide-react";

interface ScoringViewProps {
  idea: Idea;
  weights: CustomWeights;
  onSetScore: (criterionId: string, value: number) => void;
  onSetStructuredNote: (field: keyof IdeaNotesType, value: string) => void;
  onSetCompetitorLinks: (links: { name: string; url: string }[]) => void;
  onSetWeight: (criterionId: string, value: number) => void;
}

const noteFields: { key: "zielgruppe" | "pricing" | "status" | "fragen"; label: string; placeholder: string }[] = [
  { key: "zielgruppe", label: "Zielgruppe", placeholder: "Wer sind die Kunden?" },
  { key: "pricing", label: "Pricing", placeholder: "Preismodell, Umsatz pro Kunde..." },
  { key: "status", label: "Status / Fortschritt", placeholder: "Wie weit ist die Idee?" },
  { key: "fragen", label: "Offene Fragen", placeholder: "Was muss noch geklärt werden?" },
];

export function ScoringView({ idea, weights, onSetScore, onSetStructuredNote, onSetCompetitorLinks, onSetWeight }: ScoringViewProps) {
  const konkurrenz = idea.structuredNotes?.konkurrenz ?? [];

  const addRow = () => {
    onSetCompetitorLinks([...konkurrenz, { name: "", url: "" }]);
  };

  const updateRow = (index: number, field: "name" | "url", value: string) => {
    onSetCompetitorLinks(konkurrenz.map((e, i) => (i === index ? { ...e, [field]: value } : e)));
  };

  const removeRow = (index: number) => {
    onSetCompetitorLinks(konkurrenz.filter((_, i) => i !== index));
  };

  return (
    <div className="flex-1 overflow-y-auto p-6" style={{ maxHeight: "calc(100vh - 110px)" }}>
      {/* Structured Notes */}
      <div className="mb-8">
        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">
          Kontext & Notizen
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {noteFields.map((field) => (
            <div key={field.key}>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                {field.label}
              </label>
              <textarea
                value={idea.structuredNotes?.[field.key] ?? ""}
                onChange={(e) => onSetStructuredNote(field.key, e.target.value)}
                rows={2}
                className="w-full bg-card border border-border rounded-lg text-foreground text-sm p-2.5 resize-y outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                placeholder={field.placeholder}
              />
            </div>
          ))}
          {/* Konkurrenz-Links */}
          <div className="col-span-2">
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">
              Konkurrenz-Websites
            </label>
            <div className="bg-card border border-border rounded-lg p-2.5 space-y-2">
              {konkurrenz.map((entry, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={entry.name}
                    onChange={(e) => updateRow(i, "name", e.target.value)}
                    placeholder="Name"
                    className="w-1/3 bg-secondary border border-border rounded-md text-foreground text-sm p-1.5 outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                  />
                  <input
                    type="text"
                    value={entry.url}
                    onChange={(e) => updateRow(i, "url", e.target.value)}
                    placeholder="https://konkurrent.de"
                    className="flex-1 bg-secondary border border-border rounded-md text-foreground text-sm p-1.5 outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                  />
                  {entry.url && (
                    <a
                      href={entry.url.startsWith("http") ? entry.url : `https://${entry.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-400 p-1"
                    >
                      <ExternalLink size={14} />
                    </a>
                  )}
                  <button
                    onClick={() => removeRow(i)}
                    className="text-muted-foreground hover:text-destructive transition-all p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              <button
                onClick={addRow}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
              >
                <Plus size={14} />
                Hinzufügen
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Criteria by category */}
      {categories.map((cat) => {
        const catTotalWeight = cat.criteria.reduce((s, cr) => s + (weights?.[cr.id] ?? cr.weight), 0);
        return (
          <div key={cat.id} className="mb-8">
            <div
              className="flex items-center gap-3 mb-4 pb-3 border-b-2"
              style={{ borderColor: cat.color }}
            >
              {cat.emoji && <span className="text-xl">{cat.emoji}</span>}
              <h2 className="text-base font-bold" style={{ color: cat.color }}>
                {cat.name}
              </h2>
              <span
                className="text-xs font-bold px-2.5 py-0.5 rounded-full text-white"
                style={{ backgroundColor: cat.color }}
              >
                {catTotalWeight} Pkt.
              </span>
            </div>

            <div className="space-y-4">
              {cat.criteria.map((cr) => {
                const currentScore = idea.scores[cr.id];
                const currentWeight = weights?.[cr.id] ?? cr.weight;
                return (
                  <div key={cr.id} className="bg-card rounded-lg border border-border p-4 shadow-monday hover:shadow-monday-md transition-shadow">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-foreground">
                        {cr.name}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-muted-foreground">Gewicht:</span>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={currentWeight}
                          onChange={(e) => onSetWeight(cr.id, parseInt(e.target.value) || 0)}
                          className="w-12 h-7 text-center text-xs font-bold bg-secondary border border-border rounded-md text-foreground outline-none focus:ring-2 focus:ring-ring transition-all"
                        />
                      </div>
                    </div>
                    <div className="text-[11px] text-muted-foreground mb-3">
                      1 = {cr.hints[1]} · 5 = {cr.hints[5]}
                    </div>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((val) => {
                        const isSelected = currentScore === val;
                        const getScoreColor = (v: number) => {
                          if (v <= 2) return { bg: "hsl(0, 80%, 60%)", light: "hsl(0, 80%, 95%)" };
                          if (v === 3) return { bg: "hsl(39, 100%, 50%)", light: "hsl(39, 100%, 94%)" };
                          return { bg: "hsl(152, 69%, 43%)", light: "hsl(152, 69%, 94%)" };
                        };
                        const colors = getScoreColor(val);
                        return (
                          <button
                            key={val}
                            onClick={() => onSetScore(cr.id, val)}
                            className="w-10 h-10 rounded-lg text-sm font-bold transition-all"
                            style={{
                              background: isSelected ? colors.bg : colors.light,
                              color: isSelected ? "white" : colors.bg,
                              border: `2px solid ${isSelected ? colors.bg : "transparent"}`,
                              transform: isSelected ? "scale(1.1)" : "scale(1)",
                            }}
                          >
                            {val}
                          </button>
                        );
                      })}
                      {currentScore != null && (
                        <span className="text-xs text-muted-foreground ml-3 italic">
                          {cr.hints[currentScore]}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
