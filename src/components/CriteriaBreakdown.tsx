import { Fragment, useState } from "react";
import { Category } from "@/data/criteria";
import { Idea } from "@/data/defaultIdeas";
import { CustomWeights } from "@/hooks/useCriteria";
import { computeCategoryScore, computeTotalScore, getBarColor } from "@/lib/scoring";
import { getCriterionLeaders, leaderIdsByCriterion, CriterionLeader } from "@/lib/criteriaInsights";

interface CriteriaBreakdownProps {
  ideas: Idea[];
  weights: CustomWeights;
  categories: Category[];
  onSelectIdea: (id: string) => void;
  /** Für den PDF-Export: alle Kategorien untereinander statt Tabs, Tabelle ohne Scroll-Container. */
  exportMode?: boolean;
}

/** "Idee A", "Idee A & Idee B", "Idee A +2 weitere" */
function leaderLabel(leaders: Idea[]): string {
  if (leaders.length === 1) return leaders[0].name;
  if (leaders.length === 2) return `${leaders[0].name} & ${leaders[1].name}`;
  return `${leaders[0].name} +${leaders.length - 1} weitere`;
}

function StrengthCard({ leader }: { leader: CriterionLeader }) {
  const { criterion, category, weight, headline, hasPhrase, leaders, topScore, topHint } = leader;
  const unrated = topScore == null;

  return (
    <div
      className={`rounded-lg border p-3 ${
        unrated ? "border-dashed border-border bg-secondary/30" : "border-border bg-card"
      }`}
    >
      <div className="flex items-start gap-2 mb-2">
        <span
          className="w-1.5 h-1.5 rounded-full mt-1 shrink-0"
          style={{ backgroundColor: unrated ? "hsl(var(--muted-foreground))" : category.color }}
        />
        <span
          className={`text-[11px] font-semibold leading-tight ${
            unrated ? "text-muted-foreground" : "text-foreground"
          }`}
        >
          {headline}
        </span>
      </div>

      {unrated ? (
        <p className="text-[11px] text-muted-foreground pl-3.5">Noch keine Idee bewertet</p>
      ) : (
        <div className="pl-3.5">
          <p className="text-sm font-bold text-foreground truncate" title={leaderLabel(leaders)}>
            {leaderLabel(leaders)}
          </p>
          <div className="flex items-center gap-1.5 mt-1">
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded text-white shrink-0"
              style={{ backgroundColor: getBarColor(topScore) }}
            >
              {topScore}/5
            </span>
            {topHint && (
              <span className="text-[11px] text-muted-foreground truncate" title={topHint}>
                {topHint}
              </span>
            )}
          </div>
        </div>
      )}

      <p className="text-[10px] text-muted-foreground/70 mt-2 pl-3.5 truncate">
        {hasPhrase ? `${criterion.name} · Gewicht ${weight}` : `Gewicht ${weight}`}
      </p>
    </div>
  );
}

/** Im PDF stehen die Stärken als Liste – Karten verschenken dort zu viel Platz. */
function StrengthRow({ leader }: { leader: CriterionLeader }) {
  const { criterion, category, weight, headline, leaders, topScore, topHint } = leader;
  const unrated = topScore == null;

  return (
    <div className="flex items-center gap-3 px-4 py-2 border-b border-border/50 last:border-0">
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ backgroundColor: unrated ? "hsl(var(--muted-foreground))" : category.color }}
      />
      <span
        className={`text-[11px] font-semibold w-56 shrink-0 ${
          unrated ? "text-muted-foreground" : "text-foreground"
        }`}
      >
        {headline}
      </span>

      {unrated ? (
        <span className="text-[11px] text-muted-foreground flex-1">Noch keine Idee bewertet</span>
      ) : (
        <>
          <span className="text-sm font-bold text-foreground w-96 shrink-0 break-words">
            {leaderLabel(leaders)}
          </span>
          <span
            className="text-[10px] font-bold px-1.5 py-0.5 rounded text-white shrink-0"
            style={{ backgroundColor: getBarColor(topScore) }}
          >
            {topScore}/5
          </span>
          <span className="text-[11px] text-muted-foreground flex-1">{topHint}</span>
        </>
      )}

      <span className="text-[10px] text-muted-foreground/70 w-56 shrink-0 text-right">
        {criterion.name} · Gewicht {weight}
      </span>
    </div>
  );
}

export function CriteriaBreakdown({
  ideas,
  weights,
  categories,
  onSelectIdea,
  exportMode = false,
}: CriteriaBreakdownProps) {
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

  if (ideas.length === 0) return null;

  const leaders = getCriterionLeaders(ideas, categories, weights);
  const leaderIds = leaderIdsByCriterion(leaders);

  // Nur Kategorien mit Kriterien bekommen einen Tab.
  const tabs = categories
    .map((category) => ({
      category,
      leaders: leaders.filter((l) => l.category.id === category.id),
    }))
    .filter((tab) => tab.leaders.length > 0);

  // Fällt zurück auf den ersten Tab, wenn die aktive Kategorie ausgeblendet wurde.
  const activeTab = tabs.find((tab) => tab.category.id === activeCategoryId) ?? tabs[0];

  const totals = new Map(
    ideas.map((idea) => [idea.id, computeTotalScore(idea, weights, categories)])
  );
  const bestTotal = Math.max(...totals.values());

  // Gleiche Reihenfolge wie die Karten oben: bestes Gesamtergebnis zuerst.
  const sortedIdeas = [...ideas].sort(
    (a, b) => (totals.get(b.id) ?? 0) - (totals.get(a.id) ?? 0)
  );

  // Summe der Gewichte aller sichtbaren Kriterien – Bezugsgrösse des gewichteten Schnitts.
  const totalWeight = leaders.reduce((sum, l) => sum + l.weight, 0);

  // Im PDF wird nicht gescrollt – die Kriteriumsspalte braucht dort kein sticky.
  const stickyCol = exportMode ? "" : "sticky left-0 z-10";

  const ratedIdeas = ideas.filter((idea) => Object.keys(idea.scores).length > 0).length;

  return (
    <div className="space-y-10">
      {/* ---------- Stärken auf einen Blick ---------- */}
      <section>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground">Stärken auf einen Blick</h2>
          <span className="text-[11px] text-muted-foreground">
            {ratedIdeas} von {ideas.length} Ideen bewertet
          </span>
        </div>

        {exportMode ? (
          // Im PDF hilft kein Tab – dort stehen alle Kategorien untereinander.
          <div className="space-y-4">
            {tabs.map(({ category, leaders: catLeaders }) => (
              <div key={category.id}>
                <div className="flex items-center gap-1.5 mb-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span
                    className="text-[11px] font-bold uppercase tracking-wide"
                    style={{ color: category.color }}
                  >
                    {category.name}
                  </span>
                </div>
                <div className="bg-card border border-border rounded-xl shadow-monday overflow-hidden">
                  {catLeaders.map((l) => (
                    <StrengthRow key={l.criterion.id} leader={l} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          activeTab && (
          <>
            <div
              role="tablist"
              aria-label="Kategorien"
              className="flex items-stretch gap-1 border-b border-border mb-3 overflow-x-auto"
            >
              {tabs.map(({ category, leaders: catLeaders }) => {
                const active = category.id === activeTab.category.id;
                return (
                  <button
                    key={category.id}
                    role="tab"
                    aria-selected={active}
                    onClick={() => setActiveCategoryId(category.id)}
                    className={`flex items-center gap-1.5 whitespace-nowrap px-3 py-2 border-b-2 -mb-px text-[11px] font-bold uppercase tracking-wide transition-colors ${
                      active
                        ? ""
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                    style={active ? { borderColor: category.color, color: category.color } : undefined}
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: active ? category.color : "hsl(var(--muted-foreground))" }}
                    />
                    {category.name}
                    <span className="text-[10px] font-semibold text-muted-foreground/70">
                      {catLeaders.length}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
              {activeTab.leaders.map((l) => (
                <StrengthCard key={l.criterion.id} leader={l} />
              ))}
            </div>
          </>
          )
        )}
      </section>

      {/* ---------- Vollständige Matrix ---------- */}
      <section>
        <h2 className="text-lg font-bold text-foreground mb-3">Alle Kriterien im Vergleich</h2>

        <div
          className={`bg-card border border-border rounded-xl shadow-monday ${
            exportMode ? "" : "overflow-x-auto"
          }`}
        >
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-border">
                <th
                  className={`${stickyCol} bg-card px-4 py-3 text-[11px] font-bold text-muted-foreground min-w-[200px]`}
                >
                  Kriterium
                </th>
                <th className="px-2 py-3 text-[10px] font-bold text-muted-foreground/70 text-center w-14">
                  Gew.
                </th>
                {sortedIdeas.map((idea) => (
                  <th key={idea.id} className="px-2 py-3 min-w-[80px]">
                    <button
                      onClick={() => onSelectIdea(idea.id)}
                      className={`text-[11px] font-bold text-foreground hover:text-primary transition-colors text-center w-full ${
                        exportMode ? "break-words" : "truncate"
                      }`}
                      title={idea.name}
                    >
                      {idea.name}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {categories.map((cat) => {
                const catLeaders = leaders.filter((l) => l.category.id === cat.id);
                if (catLeaders.length === 0) return null;

                return (
                  <Fragment key={cat.id}>
                    {/* Kategorie-Kopfzeile */}
                    <tr style={{ backgroundColor: cat.lightColor }}>
                      <td
                        className={`${stickyCol} px-4 py-1.5 text-[10px] font-bold uppercase tracking-wide`}
                        style={{ backgroundColor: cat.lightColor, color: cat.color }}
                      >
                        {cat.name}
                      </td>
                      <td style={{ backgroundColor: cat.lightColor }} />
                      {sortedIdeas.map((idea) => (
                        <td
                          key={idea.id}
                          className="px-2 py-1.5 text-center text-[10px] font-bold"
                          style={{ backgroundColor: cat.lightColor, color: cat.color }}
                        >
                          {(() => {
                            const s = computeCategoryScore(idea, cat.id, weights, categories);
                            return s > 0 ? s.toFixed(1) : "–";
                          })()}
                        </td>
                      ))}
                    </tr>

                    {/* Kriterien der Kategorie */}
                    {catLeaders.map((l) => {
                      const winners = leaderIds.get(l.criterion.id) ?? new Set<string>();

                      return (
                        <tr
                          key={l.criterion.id}
                          className="border-b border-border/50 last:border-0 hover:bg-secondary/40"
                        >
                          <td className={`${stickyCol} bg-card px-4 py-2`}>
                            <span className="text-xs text-foreground">{l.criterion.name}</span>
                            {l.criterion.custom && (
                              <span className="ml-1.5 text-[9px] font-bold text-muted-foreground/60">
                                EIGEN
                              </span>
                            )}
                          </td>
                          <td className="px-2 py-2 text-center text-[10px] font-bold text-muted-foreground/70">
                            {l.weight}
                          </td>

                          {sortedIdeas.map((idea) => {
                            const score = idea.scores[l.criterion.id];
                            if (score == null) {
                              return (
                                <td
                                  key={idea.id}
                                  className="px-2 py-2 text-center text-xs text-muted-foreground/40"
                                >
                                  –
                                </td>
                              );
                            }

                            const isWinner = winners.has(idea.id);
                            const color = getBarColor(score);

                            return (
                              <td key={idea.id} className="px-2 py-2 text-center">
                                <span
                                  className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs tabular-nums ${
                                    isWinner ? "font-black text-white" : "font-medium text-foreground"
                                  }`}
                                  style={
                                    isWinner
                                      ? { backgroundColor: color }
                                      : { backgroundColor: "hsl(var(--secondary))" }
                                  }
                                  title={l.criterion.hints[score] ?? `${score} von 5`}
                                >
                                  {score}
                                </span>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </Fragment>
                );
              })}
            </tbody>

            <tfoot>
              <tr className="border-t-2 border-border bg-secondary/50">
                <td className={`${stickyCol} bg-secondary/50 px-4 py-3 text-xs font-bold text-foreground`}>
                  Gesamt
                </td>
                <td className="px-2 py-3 text-center text-[10px] font-bold text-muted-foreground/70">
                  {totalWeight}
                </td>
                {sortedIdeas.map((idea) => {
                  const total = totals.get(idea.id) ?? 0;
                  if (total === 0) {
                    return (
                      <td
                        key={idea.id}
                        className="px-2 py-3 text-center text-xs text-muted-foreground/40"
                      >
                        –
                      </td>
                    );
                  }

                  const isBest = total === bestTotal;

                  return (
                    <td key={idea.id} className="px-2 py-3 text-center">
                      <span
                        className={`inline-flex items-center justify-center px-2 h-7 rounded-lg text-xs tabular-nums ${
                          isBest ? "font-black text-white" : "font-bold text-foreground"
                        }`}
                        style={
                          isBest
                            ? { backgroundColor: getBarColor(total) }
                            : { backgroundColor: "hsl(var(--card))" }
                        }
                        title={`Gewichteter Durchschnitt über alle bewerteten Kriterien`}
                      >
                        {total.toFixed(1)}
                      </span>
                    </td>
                  );
                })}
              </tr>
            </tfoot>
          </table>
        </div>
      </section>
    </div>
  );
}
