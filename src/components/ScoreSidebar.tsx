import { useEffect, useState } from "react";
import { categories } from "@/data/criteria";
import { Idea } from "@/data/defaultIdeas";
import { computeCategoryScore, computeTotalScore, getGrade, getBarColor, getUnansweredCriteria } from "@/lib/scoring";
import { AlertCircle } from "lucide-react";
import { CustomWeights } from "@/hooks/useWeights";

function AnimatedNumber({ value, decimals = 1 }: { value: number; decimals?: number }) {
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const start = display;
    const diff = value - start;
    if (Math.abs(diff) < 0.01) { setDisplay(value); return; }
    const duration = 400;
    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(start + diff * eased);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value]);

  return <>{display.toFixed(decimals)}</>;
}

export function ScoreSidebar({ idea, weights }: { idea: Idea; weights: CustomWeights }) {
  const totalScore = computeTotalScore(idea, weights);
  const grade = getGrade(totalScore);
  const unanswered = getUnansweredCriteria(idea);
  const totalCriteria = categories.reduce((s, c) => s + c.criteria.length, 0);
  const answered = totalCriteria - unanswered.length;

  return (
    <div
      className="shrink-0 overflow-y-auto p-5 bg-card border-l border-border"
      style={{ width: "320px", maxHeight: "calc(100vh - 110px)" }}
    >
      {/* Total score */}
      <div className="text-center mb-6">
        <div className="text-6xl font-black leading-none" style={{ color: grade.color }}>
          <AnimatedNumber value={totalScore} />
        </div>
        <div
          className="inline-block mt-2 px-5 py-1 rounded-full text-sm font-bold text-white"
          style={{ backgroundColor: grade.color }}
        >
          {grade.label}
        </div>
        <div className="text-xs text-muted-foreground mt-2 font-medium">
          {answered}/{totalCriteria} bewertet
        </div>
        <div className="mt-3 mx-auto w-full h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${(answered / totalCriteria) * 100}%`, backgroundColor: grade.color }}
          />
        </div>
      </div>

      {/* Category breakdown */}
      <div className="mb-6">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
          Kategorien
        </h3>
        <div className="space-y-3">
          {categories.map((cat) => {
            const catScore = computeCategoryScore(idea, cat.id, weights);
            return (
              <div key={cat.id} className="bg-background rounded-lg p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-foreground">
                    {cat.name}
                  </span>
                  <span className="text-sm font-bold" style={{ color: cat.color }}>
                    <AnimatedNumber value={catScore} />
                  </span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${(catScore / 5) * 100}%`, backgroundColor: cat.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Per-criterion bars */}
      <div className="mb-6">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
          Einzelbewertungen
        </h3>
        <div className="space-y-2">
          {categories.map((cat) =>
            cat.criteria.map((cr) => {
              const score = idea.scores[cr.id] || 0;
              const w = weights?.[cr.id] ?? cr.weight;
              return (
                <div key={cr.id}>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground truncate mr-2">
                      {cr.name}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-muted-foreground/60">
                        w{w}
                      </span>
                      <span
                        className="text-xs font-bold"
                        style={{ color: score > 0 ? getBarColor(score) : "hsl(var(--muted-foreground))" }}
                      >
                        {score > 0 ? score : "–"}
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden mt-0.5">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${(score / 5) * 100}%`,
                        background: score > 0 ? getBarColor(score) : "transparent",
                      }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Unanswered */}
      {unanswered.length > 0 && (
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 text-destructive">
            <AlertCircle size={14} />
            Offen ({unanswered.length})
          </h3>
          <div className="space-y-1">
            {unanswered.map((u, i) => (
              <div key={i} className="text-[11px] text-muted-foreground">
                {u.criterionName}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
