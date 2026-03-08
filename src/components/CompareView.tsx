import { useRef } from "react";
import { categories } from "@/data/criteria";
import { Idea } from "@/data/defaultIdeas";
import { computeCategoryScore, computeTotalScore, getGrade, getBarColor } from "@/lib/scoring";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from "recharts";
import html2canvas from "html2canvas";
import { Download } from "lucide-react";

interface CompareViewProps {
  ideas: Idea[];
  onSelectIdea: (id: string) => void;
}

export function CompareView({ ideas, onSelectIdea }: CompareViewProps) {
  const exportRef = useRef<HTMLDivElement>(null);

  const ranked = [...ideas]
    .map((idea) => ({ idea, score: computeTotalScore(idea) }))
    .sort((a, b) => b.score - a.score);

  const radarData = categories.map((cat) => {
    const entry: Record<string, string | number> = { category: cat.emoji + " " + cat.name };
    ideas.forEach((idea) => {
      entry[idea.name] = parseFloat(computeCategoryScore(idea, cat.id).toFixed(2));
    });
    return entry;
  });

  const radarColors = ["#FFD600", "#00FF87", "#00B4FF", "#CC88FF", "#FF6B35"];

  const handleExport = async () => {
    if (!exportRef.current) return;
    const canvas = await html2canvas(exportRef.current, { backgroundColor: "#080808", scale: 2 });
    const link = document.createElement("a");
    link.download = "idea-ranking.png";
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="overflow-y-auto p-6" style={{ maxHeight: "calc(100vh - 52px)" }}>
      <div className="flex items-center justify-between mb-6">
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2rem", color: "#FFD600", margin: 0 }}>
          VERGLEICH & RANKING
        </h1>
        <button
          onClick={handleExport}
          className="flex items-center gap-2"
          style={{
            border: "1px solid #FFD600",
            color: "#FFD600",
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "0.95rem",
            padding: "6px 16px",
            cursor: "pointer",
            background: "transparent",
            letterSpacing: "0.08em",
          }}
        >
          <Download size={16} />
          EXPORT PNG
        </button>
      </div>

      <div ref={exportRef}>
        {/* Ranking list */}
        <div className="mb-8">
          {ranked.map(({ idea, score }, idx) => {
            const grade = getGrade(score);
            return (
              <div
                key={idea.id}
                onClick={() => onSelectIdea(idea.id)}
                className="flex items-center gap-4 p-4 mb-2 cursor-pointer transition-colors"
                style={{
                  border: "1px solid hsl(0 0% 18%)",
                  background: "hsl(0 0% 6%)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#FFD600")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "hsl(0 0% 18%)")}
              >
                {/* Rank */}
                <div
                  style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: "2rem",
                    color: "#FFD600",
                    width: "40px",
                    textAlign: "center",
                  }}
                >
                  #{idx + 1}
                </div>

                {/* Name + bar */}
                <div className="flex-1">
                  <div
                    style={{
                      fontFamily: "'Bebas Neue', sans-serif",
                      fontSize: "1.3rem",
                      color: "#E0E0E0",
                      marginBottom: "6px",
                    }}
                  >
                    {idea.name}
                  </div>
                  <div style={{ height: "8px", background: "hsl(0 0% 12%)", width: "100%" }}>
                    <div
                      style={{
                        height: "100%",
                        width: `${(score / 5) * 100}%`,
                        background: grade.color,
                        transition: "width 0.4s ease-out",
                      }}
                    />
                  </div>

                  {/* Mini category bars */}
                  <div className="flex gap-1 mt-2">
                    {categories.map((cat) => {
                      const catScore = computeCategoryScore(idea, cat.id);
                      return (
                        <div key={cat.id} className="flex-1">
                          <div style={{ height: "3px", background: "hsl(0 0% 12%)" }}>
                            <div
                              style={{
                                height: "100%",
                                width: `${(catScore / 5) * 100}%`,
                                background: cat.color,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Score + Badge */}
                <div className="text-right">
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2rem", color: grade.color }}>
                    {score.toFixed(1)}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Bebas Neue', sans-serif",
                      fontSize: "0.8rem",
                      color: "#080808",
                      background: grade.color,
                      padding: "1px 10px",
                      display: "inline-block",
                      letterSpacing: "0.08em",
                    }}
                  >
                    {grade.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Radar Chart */}
        <div className="mb-8">
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.5rem", color: "#FFD600", marginBottom: "16px" }}>
            KATEGORIE-RADAR
          </h2>
          <div style={{ width: "100%", height: "400px" }}>
            <ResponsiveContainer>
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(0 0% 18%)" />
                <PolarAngleAxis
                  dataKey="category"
                  tick={{ fill: "#E0E0E0", fontFamily: "'DM Mono', monospace", fontSize: 11 }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 5]}
                  tick={{ fill: "hsl(0 0% 40%)", fontFamily: "'DM Mono', monospace", fontSize: 10 }}
                />
                {ideas.map((idea, i) => (
                  <Radar
                    key={idea.id}
                    name={idea.name}
                    dataKey={idea.name}
                    stroke={radarColors[i % radarColors.length]}
                    fill={radarColors[i % radarColors.length]}
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                ))}
                <Legend
                  wrapperStyle={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: "0.8rem",
                    color: "#E0E0E0",
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
