import { categories } from "@/data/criteria";
import { Idea } from "@/data/defaultIdeas";

interface ScoringViewProps {
  idea: Idea;
  onSetScore: (criterionId: string, value: number) => void;
  onSetNotes: (notes: string) => void;
}

export function ScoringView({ idea, onSetScore, onSetNotes }: ScoringViewProps) {
  return (
    <div className="flex-1 overflow-y-auto p-6" style={{ maxHeight: "calc(100vh - 52px)" }}>
      {/* Notes */}
      <div className="mb-8">
        <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.4rem", color: "#FFD600", marginBottom: "8px" }}>
          KONTEXT & NOTIZEN
        </h2>
        <textarea
          value={idea.notes}
          onChange={(e) => onSetNotes(e.target.value)}
          rows={4}
          style={{
            width: "100%",
            background: "hsl(0 0% 6%)",
            border: "1px solid hsl(0 0% 18%)",
            color: "#E0E0E0",
            fontFamily: "'DM Mono', monospace",
            fontSize: "0.85rem",
            padding: "12px",
            resize: "vertical",
            outline: "none",
          }}
        />
      </div>

      {/* Criteria by category */}
      {categories.map((cat) => (
        <div key={cat.id} className="mb-8">
          <div
            className="flex items-center gap-3 mb-4 pb-2"
            style={{ borderBottom: `2px solid ${cat.color}` }}
          >
            <span style={{ fontSize: "1.3rem" }}>{cat.emoji}</span>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.5rem", color: cat.color, margin: 0 }}>
              {cat.name}
            </h2>
            <span
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: "0.75rem",
                color: "#080808",
                background: cat.color,
                padding: "2px 8px",
                fontWeight: 500,
              }}
            >
              {cat.weight}%
            </span>
          </div>

          {cat.criteria.map((cr) => {
            const currentScore = idea.scores[cr.id];
            return (
              <div key={cr.id} className="mb-4">
                <div className="flex items-center gap-3 mb-2">
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.85rem", color: "#E0E0E0", minWidth: "200px" }}>
                    {cr.name}
                  </span>
                  <span
                    style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: "0.65rem",
                      color: "#FFD600",
                      opacity: 0.7,
                    }}
                  >
                    {cr.weight}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      key={val}
                      onClick={() => onSetScore(cr.id, val)}
                      style={{
                        width: "44px",
                        height: "44px",
                        border: currentScore === val ? "2px solid #FFD600" : "1px solid hsl(0 0% 18%)",
                        background: currentScore === val ? "#FFD600" : "transparent",
                        color: currentScore === val ? "#080808" : "#E0E0E0",
                        fontFamily: "'Bebas Neue', sans-serif",
                        fontSize: "1.2rem",
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                    >
                      {val}
                    </button>
                  ))}
                  {currentScore != null && (
                    <span
                      style={{
                        fontFamily: "'DM Mono', monospace",
                        fontSize: "0.75rem",
                        color: "hsl(0 0% 60%)",
                        marginLeft: "8px",
                      }}
                    >
                      {cr.hints[currentScore]}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
