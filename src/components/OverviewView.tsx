import { categories } from "@/data/criteria";
import { Idea } from "@/data/defaultIdeas";
import { computeTotalScore, computeCategoryScore, getGrade, getUnansweredCriteria } from "@/lib/scoring";
import { CustomWeights } from "@/hooks/useWeights";

interface OverviewViewProps {
  ideas: Idea[];
  weights: CustomWeights;
  onSelectIdea: (id: string) => void;
}

export function OverviewView({ ideas, weights, onSelectIdea }: OverviewViewProps) {
  const sorted = [...ideas].sort((a, b) => computeTotalScore(b, weights) - computeTotalScore(a, weights));
  const totalCriteria = categories.reduce((s, c) => s + c.criteria.length, 0);

  return (
    <div className="flex-1 overflow-y-auto p-6" style={{ maxHeight: "calc(100vh - 110px)" }}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {sorted.map((idea, index) => {
          const score = computeTotalScore(idea, weights);
          const grade = getGrade(score);
          const unanswered = getUnansweredCriteria(idea);
          const answered = totalCriteria - unanswered.length;

          return (
            <button
              key={idea.id}
              onClick={() => onSelectIdea(idea.id)}
              className="bg-card border border-border rounded-xl p-5 text-left shadow-monday hover:shadow-monday-md hover:border-primary/30 transition-all group"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-muted-foreground/50">#{index + 1}</span>
                  <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">
                    {idea.name}
                  </h3>
                </div>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white shrink-0"
                  style={{ backgroundColor: grade.color }}
                >
                  {grade.label}
                </span>
              </div>

              {/* Score */}
              <div className="flex items-end gap-2 mb-4">
                <span className="text-3xl font-black leading-none" style={{ color: grade.color }}>
                  {score.toFixed(1)}
                </span>
                <span className="text-xs text-muted-foreground mb-0.5">/ 5.0</span>
              </div>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-muted-foreground">{answered}/{totalCriteria} bewertet</span>
                  <span className="text-[10px] text-muted-foreground">{Math.round((answered / totalCriteria) * 100)}%</span>
                </div>
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${(answered / totalCriteria) * 100}%`, backgroundColor: grade.color }}
                  />
                </div>
              </div>

              {/* Category mini bars */}
              <div className="space-y-1.5">
                {categories.map((cat) => {
                  const catScore = computeCategoryScore(idea, cat.id, weights);
                  return (
                    <div key={cat.id} className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground w-24 truncate">{cat.name}</span>
                      <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{ width: `${(catScore / 5) * 100}%`, backgroundColor: cat.color }}
                        />
                      </div>
                      <span className="text-[10px] font-bold w-6 text-right" style={{ color: cat.color }}>
                        {catScore > 0 ? catScore.toFixed(1) : "–"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
