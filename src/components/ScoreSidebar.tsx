import { useEffect, useState } from "react";
import { categories } from "@/data/criteria";
import { Idea } from "@/data/defaultIdeas";
import { computeCategoryScore, computeTotalScore, getGrade, getBarColor, getUnansweredCriteria } from "@/lib/scoring";

interface ScoreSidebarProps {
  idea: Idea;
}

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

export function ScoreSidebar({ idea }: ScoreSidebarProps) {
  const totalScore = computeTotalScore(idea);
  const grade = getGrade(totalScore);
  const unanswered = getUnansweredCriteria(idea);
  const totalCriteria = categories.reduce((s, c) => s + c.criteria.length, 0);
  const answered = totalCriteria - unanswered.length;

  return (
    <div
      className="shrink-0 overflow-y-auto p-5"
      style={{
        width: "320px",
        borderLeft: "1px solid hsl(0 0% 18%)",
        maxHeight: "calc(100vh - 52px)",
      }}
    >
      {/* Total score */}
      <div className="text-center mb-6">
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "4rem", color: grade.color, lineHeight: 1 }}>
          <AnimatedNumber value={totalScore} />
        </div>
        <div
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "1.5rem",
            color: "#080808",
            background: grade.color,
            display: "inline-block",
            padding: "2px 20px",
            letterSpacing: "0.1em",
            marginTop: "4px",
          }}
        >
          {grade.label}
        </div>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.75rem", color: "hsl(0 0% 60%)", marginTop: "8px" }}>
          {answered}/{totalCriteria} bewertet
        </div>
      </div>

      {/* Category breakdown */}
      <div className="mb-6">
        <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.1rem", color: "#FFD600", marginBottom: "12px" }}>
          KATEGORIEN
        </h3>
        {categories.map((cat) => {
          const catScore = computeCategoryScore(idea, cat.id);
          return (
            <div key={cat.id} className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.75rem", color: cat.color }}>
                  {cat.emoji} {cat.name}
                </span>
                <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1rem", color: cat.color }}>
                  <AnimatedNumber value={catScore} />
                </span>
              </div>
              <div style={{ height: "6px", background: "hsl(0 0% 12%)", width: "100%" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${(catScore / 5) * 100}%`,
                    background: cat.color,
                    transition: "width 0.4s ease-out",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Per-criterion bars */}
      <div className="mb-6">
        <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.1rem", color: "#FFD600", marginBottom: "12px" }}>
          EINZELBEWERTUNGEN
        </h3>
        {categories.map((cat) =>
          cat.criteria.map((cr) => {
            const score = idea.scores[cr.id] || 0;
            return (
              <div key={cr.id} className="mb-2">
                <div className="flex items-center justify-between">
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", color: "hsl(0 0% 60%)" }}>
                    {cr.name}
                  </span>
                  <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "0.85rem", color: score > 0 ? getBarColor(score) : "hsl(0 0% 30%)" }}>
                    {score > 0 ? score : "–"}
                  </span>
                </div>
                <div style={{ height: "3px", background: "hsl(0 0% 12%)", width: "100%" }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${(score / 5) * 100}%`,
                      background: score > 0 ? getBarColor(score) : "transparent",
                      transition: "width 0.3s ease-out",
                    }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Unanswered */}
      {unanswered.length > 0 && (
        <div>
          <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.1rem", color: "#FF4444", marginBottom: "8px" }}>
            OFFEN ({unanswered.length})
          </h3>
          {unanswered.map((u, i) => (
            <div
              key={i}
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: "0.65rem",
                color: "hsl(0 0% 45%)",
                marginBottom: "2px",
              }}
            >
              {u.criterionName}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
