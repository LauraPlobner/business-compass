import { categories } from "@/data/criteria";
import { Idea } from "@/data/defaultIdeas";

interface ScoringViewProps {
  idea: Idea;
  onSetScore: (criterionId: string, value: number) => void;
  onSetNotes: (notes: string) => void;
}

export function ScoringView({ idea, onSetScore, onSetNotes }: ScoringViewProps) {
  return (
    <div className="flex-1 overflow-y-auto p-6" style={{ maxHeight: "calc(100vh - 110px)" }}>
      {/* Notes */}
      <div className="mb-8">
        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">
          📝 Kontext & Notizen
        </h2>
        <textarea
          value={idea.notes}
          onChange={(e) => onSetNotes(e.target.value)}
          rows={4}
          className="w-full bg-card border border-border rounded-lg text-foreground text-sm p-3 resize-y outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
          placeholder="Notizen zur Idee..."
        />
      </div>

      {/* Criteria by category */}
      {categories.map((cat) => (
        <div key={cat.id} className="mb-8">
          <div
            className="flex items-center gap-3 mb-4 pb-3 border-b-2"
            style={{ borderColor: cat.color }}
          >
            <span className="text-xl">{cat.emoji}</span>
            <h2 className="text-base font-bold" style={{ color: cat.color }}>
              {cat.name}
            </h2>
            <span
              className="text-xs font-bold px-2.5 py-0.5 rounded-full text-white"
              style={{ backgroundColor: cat.color }}
            >
              {cat.weight}%
            </span>
          </div>

          <div className="space-y-4">
            {cat.criteria.map((cr) => {
              const currentScore = idea.scores[cr.id];
              return (
                <div key={cr.id} className="bg-card rounded-lg border border-border p-4 shadow-monday hover:shadow-monday-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-foreground">
                      {cr.name}
                    </span>
                    <span className="text-xs text-muted-foreground font-medium">
                      Gewicht: {cr.weight}%
                    </span>
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
      ))}
    </div>
  );
}
