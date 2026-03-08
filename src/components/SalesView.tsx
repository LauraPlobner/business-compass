import { useState } from "react";
import { Idea } from "@/data/defaultIdeas";
import { salesModels, salesChannels, salesCriteria, comboKey } from "@/data/salesModels";
import { useSalesScores } from "@/hooks/useSalesScores";
import { getGrade } from "@/lib/scoring";

interface SalesViewProps {
  ideas: Idea[];
}

export function SalesView({ ideas }: SalesViewProps) {
  const { scores, setScore, getComboAverage } = useSalesScores();
  const [selectedIdea, setSelectedIdea] = useState(ideas[0]?.id || "");
  const [selectedModel, setSelectedModel] = useState(salesModels[0]?.id || "");
  const [selectedChannel, setSelectedChannel] = useState(salesChannels[0]?.id || "");

  const currentKey = comboKey(selectedIdea, selectedModel, selectedChannel);
  const currentScores = scores[currentKey] || {};
  const avg = getComboAverage(currentKey, salesCriteria.length);
  const grade = avg > 0 ? getGrade(avg) : null;

  // Build ranking of all combos for selected idea
  const combos = salesModels.flatMap((m) =>
    salesChannels.map((ch) => {
      const key = comboKey(selectedIdea, m.id, ch.id);
      const a = getComboAverage(key, salesCriteria.length);
      return { model: m, channel: ch, key, avg: a };
    })
  ).filter((c) => c.avg > 0).sort((a, b) => b.avg - a.avg);

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Main scoring area */}
      <div className="flex-1 overflow-y-auto p-6" style={{ maxHeight: "calc(100vh - 110px)" }}>
        {/* Selectors */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Idee</label>
            <select
              value={selectedIdea}
              onChange={(e) => setSelectedIdea(e.target.value)}
              className="w-full bg-card border border-border rounded-lg text-foreground text-sm p-2.5 outline-none focus:ring-2 focus:ring-ring transition-all"
            >
              {ideas.map((idea) => (
                <option key={idea.id} value={idea.id}>{idea.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Sales-Modell</label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full bg-card border border-border rounded-lg text-foreground text-sm p-2.5 outline-none focus:ring-2 focus:ring-ring transition-all"
            >
              {salesModels.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Vertriebskanal</label>
            <select
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value)}
              className="w-full bg-card border border-border rounded-lg text-foreground text-sm p-2.5 outline-none focus:ring-2 focus:ring-ring transition-all"
            >
              {salesChannels.map((ch) => (
                <option key={ch.id} value={ch.id}>{ch.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Current combo header */}
        <div className="bg-card border border-border rounded-lg p-4 mb-6 shadow-monday">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-foreground">
                {ideas.find((i) => i.id === selectedIdea)?.name} + {salesModels.find((m) => m.id === selectedModel)?.name} + {salesChannels.find((c) => c.id === selectedChannel)?.name}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {Object.keys(currentScores).length}/{salesCriteria.length} bewertet
              </div>
            </div>
            {grade && (
              <div className="text-right">
                <div className="text-3xl font-black" style={{ color: grade.color }}>{avg.toFixed(1)}</div>
                <div className="inline-block px-3 py-0.5 rounded-full text-xs font-bold text-white mt-1" style={{ backgroundColor: grade.color }}>
                  {grade.label}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Criteria cards */}
        <div className="space-y-4">
          {salesCriteria.map((cr) => {
            const currentScore = currentScores[cr.id];
            return (
              <div key={cr.id} className="bg-card rounded-lg border border-border p-4 shadow-monday hover:shadow-monday-md transition-shadow">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-foreground">{cr.name}</span>
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
                        onClick={() => setScore(currentKey, cr.id, val)}
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

      {/* Sidebar: Ranking */}
      <div className="shrink-0 overflow-y-auto p-5 bg-card border-l border-border" style={{ width: "320px", maxHeight: "calc(100vh - 110px)" }}>
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
          Ranking: {ideas.find((i) => i.id === selectedIdea)?.name}
        </h3>
        {combos.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">Noch keine Kombination bewertet.</p>
        ) : (
          <div className="space-y-2">
            {combos.map(({ model, channel, avg: a }, idx) => {
              const g = getGrade(a);
              const isActive = model.id === selectedModel && channel.id === selectedChannel;
              return (
                <div
                  key={`${model.id}-${channel.id}`}
                  onClick={() => { setSelectedModel(model.id); setSelectedChannel(channel.id); }}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    isActive ? "border-primary bg-primary/5" : "border-border bg-background hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-foreground">
                      #{idx + 1} {model.name}
                    </span>
                    <span className="text-sm font-black" style={{ color: g.color }}>
                      {a.toFixed(1)}
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-foreground">{channel.name}</div>
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden mt-1.5">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${(a / 5) * 100}%`, backgroundColor: g.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Cross-idea comparison */}
        {ideas.length > 1 && (
          <div className="mt-6">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
              Beste Kombination pro Idee
            </h3>
            <div className="space-y-2">
              {ideas.map((idea) => {
                const best = salesModels.flatMap((m) =>
                  salesChannels.map((ch) => {
                    const key = comboKey(idea.id, m.id, ch.id);
                    return { model: m, channel: ch, avg: getComboAverage(key, salesCriteria.length) };
                  })
                ).filter((c) => c.avg > 0).sort((a, b) => b.avg - a.avg)[0];

                if (!best) return (
                  <div key={idea.id} className="p-2 text-[11px] text-muted-foreground italic">
                    {idea.name}: noch nicht bewertet
                  </div>
                );

                const g = getGrade(best.avg);
                return (
                  <div
                    key={idea.id}
                    onClick={() => setSelectedIdea(idea.id)}
                    className="p-3 rounded-lg border border-border bg-background cursor-pointer hover:border-primary/40 transition-all"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-foreground">{idea.name}</span>
                      <span className="text-sm font-black" style={{ color: g.color }}>{best.avg.toFixed(1)}</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {best.model.name} + {best.channel.name}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
