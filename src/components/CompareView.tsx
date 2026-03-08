import { useRef } from "react";
import { categories } from "@/data/criteria";
import { Idea } from "@/data/defaultIdeas";
import { computeCategoryScore, computeTotalScore, getGrade } from "@/lib/scoring";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from "recharts";
import html2canvas from "html2canvas";
import { Download, Trophy } from "lucide-react";
import { CustomWeights } from "@/hooks/useWeights";

interface CompareViewProps {
  ideas: Idea[];
  weights: CustomWeights;
  onSelectIdea: (id: string) => void;
}

export function CompareView({ ideas, weights, onSelectIdea }: CompareViewProps) {
  const exportRef = useRef<HTMLDivElement>(null);

  const ranked = [...ideas]
    .map((idea) => ({ idea, score: computeTotalScore(idea, weights) }))
    .sort((a, b) => b.score - a.score);

  const radarData = categories.map((cat) => {
    const entry: Record<string, string | number> = { category: cat.name };
    ideas.forEach((idea) => {
      entry[idea.name] = parseFloat(computeCategoryScore(idea, cat.id, weights).toFixed(2));
    });
    return entry;
  });

  const radarColors = ["hsl(211,100%,50%)", "hsl(152,69%,43%)", "hsl(264,70%,62%)", "hsl(20,95%,55%)", "hsl(0,80%,60%)"];

  const handleExport = async () => {
    if (!exportRef.current) return;
    const canvas = await html2canvas(exportRef.current, { backgroundColor: "#f5f6f8", scale: 2 });
    const link = document.createElement("a");
    link.download = "idea-ranking.png";
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="overflow-y-auto p-6" style={{ maxHeight: "calc(100vh - 110px)" }}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          Vergleich & Ranking
        </h1>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold shadow-monday hover:shadow-monday-md transition-all"
        >
          <Download size={16} />
          Export PNG
        </button>
      </div>

      <div ref={exportRef}>
        <div className="mb-8 space-y-3">
          {ranked.map(({ idea, score }, idx) => {
            const grade = getGrade(score);
            return (
              <div
                key={idea.id}
                onClick={() => onSelectIdea(idea.id)}
                className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border cursor-pointer shadow-monday hover:shadow-monday-md transition-all hover:border-primary/40"
              >
                <div className="text-2xl font-black text-primary w-10 text-center">
                  #{idx + 1}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-foreground mb-2">
                    {idea.name}
                  </div>
                  <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${(score / 5) * 100}%`, backgroundColor: grade.color }}
                    />
                  </div>
                  <div className="flex gap-1.5 mt-2">
                    {categories.map((cat) => {
                      const catScore = computeCategoryScore(idea, cat.id, weights);
                      return (
                        <div key={cat.id} className="flex-1">
                          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${(catScore / 5) * 100}%`, backgroundColor: cat.color }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black" style={{ color: grade.color }}>
                    {score.toFixed(1)}
                  </div>
                  <div
                    className="inline-block px-3 py-0.5 rounded-full text-xs font-bold text-white mt-1"
                    style={{ backgroundColor: grade.color }}
                  >
                    {grade.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-card rounded-xl border border-border p-6 shadow-monday">
          <h2 className="text-base font-bold text-foreground mb-4">
            Kategorie-Radar
          </h2>
          <div style={{ width: "100%", height: "400px" }}>
            <ResponsiveContainer>
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(220, 13%, 90%)" />
                <PolarAngleAxis
                  dataKey="category"
                  tick={{ fill: "hsl(220, 20%, 40%)", fontSize: 12, fontFamily: "'Figtree', sans-serif" }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 5]}
                  tick={{ fill: "hsl(220, 10%, 60%)", fontSize: 10 }}
                />
                {ideas.map((idea, i) => (
                  <Radar
                    key={idea.id}
                    name={idea.name}
                    dataKey={idea.name}
                    stroke={radarColors[i % radarColors.length]}
                    fill={radarColors[i % radarColors.length]}
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                ))}
                <Legend
                  wrapperStyle={{ fontSize: "0.8rem", fontFamily: "'Figtree', sans-serif" }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
