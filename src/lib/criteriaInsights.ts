import { Category, Criterion, categories as standardCategories } from "@/data/criteria";
import { Idea } from "@/data/defaultIdeas";
import { CustomWeights } from "@/hooks/useCriteria";

/**
 * Die Frage, die ein Kriterium in Klartext beantwortet ("Mit welchem Projekt … ?").
 * Nur für die Standard-Kriterien unter ihrem Originalnamen – umbenannte und eigene
 * Kriterien laufen über ihren Namen, damit hier nie eine Beschriftung steht,
 * die dem widerspricht, was in den Einstellungen gepflegt wurde.
 */
const superlatives: Record<string, string> = {
  time_to_revenue: "Am schnellsten Geld verdienen",
  revenue_ceiling: "Grösste finanzielle Luft nach oben",
  recurring_revenue: "Am meisten wiederkehrender Umsatz",
  marge: "Beste Marge & Skalierbarkeit",
  break_even: "Am schnellsten im Break-Even",
  exit_potenzial: "Bestes Exit-Potenzial",
  motivation: "Höchste Motivation über 2–3 Jahre",
  zeitaufwand: "Wenigster Zeitaufwand",
  learning_curve: "Am wenigsten Neues zu lernen",
  nachfrage: "Stärkste bestehende Nachfrage",
  marktsaettigung: "Wenigster Wettbewerb",
  usp: "Stärkster USP",
  vertriebsaufwand: "Wenigster Vertriebsaufwand",
  marktgroesse: "Grösster Markt (CH/DACH)",
  time_to_launch: "Am schnellsten gelauncht",
  abhaengigkeiten: "Wenigste externe Abhängigkeiten",
  selbst_baubar: "Am meisten selbst machbar",
  fulfillment: "Wenigster Fulfillmentaufwand",
  support: "Wenigster Support & Wartung",
  worst_case: "Harmlosester Worst Case",
  opportunity_cost: "Geringste Opportunitätskosten",
  tueroeffner: "Bester Türöffner für Folgeprojekte",
  initial_investment: "Geringstes Startkapital nötig",
};

const standardNames = new Map(
  standardCategories.flatMap((cat) => cat.criteria.map((cr) => [cr.id, cr.name] as const))
);

export function criterionWeight(cr: Criterion, weights: CustomWeights): number {
  return weights?.[cr.id] ?? cr.weight;
}

export interface CriterionLeader {
  criterion: Criterion;
  category: Category;
  weight: number;
  /** Klartext-Frage bei unveränderten Standard-Kriterien, sonst der Kriteriumsname. */
  headline: string;
  /** true, wenn headline die Klartext-Frage ist (und der Name separat gezeigt werden soll). */
  hasPhrase: boolean;
  /** Die Idee(n) mit der höchsten Punktzahl. Leer, solange niemand bewertet ist. */
  leaders: Idea[];
  /** Die höchste vergebene Punktzahl – null, wenn keine Idee bewertet ist. */
  topScore: number | null;
  /** Was diese Punktzahl im Klartext heisst, falls für die Stufe eine Hilfe hinterlegt ist. */
  topHint?: string;
  /** Wie viele Ideen dieses Kriterium überhaupt bewertet haben. */
  ratedCount: number;
}

function headlineFor(cr: Criterion): { headline: string; hasPhrase: boolean } {
  const phrase = superlatives[cr.id];
  const isUnrenamedStandard = !cr.custom && standardNames.get(cr.id) === cr.name;
  if (phrase && isUnrenamedStandard) return { headline: phrase, hasPhrase: true };
  return { headline: cr.name, hasPhrase: false };
}

/**
 * Pro Kriterium: welche Idee führt, mit wie vielen Punkten und was das im Klartext heisst.
 * Der Sieger ergibt sich allein aus der Punktzahl – die Gewichtung sagt, wie wichtig dir
 * das Kriterium ist, nicht wer darin am besten abschneidet.
 * Kriterien sind nach Kategorie gruppiert, innerhalb der Kategorie nach Gewicht absteigend.
 */
export function getCriterionLeaders(
  ideas: Idea[],
  categories: Category[],
  weights: CustomWeights
): CriterionLeader[] {
  const leaders: CriterionLeader[] = [];

  for (const category of categories) {
    const byWeight = [...category.criteria].sort(
      (a, b) => criterionWeight(b, weights) - criterionWeight(a, weights)
    );

    for (const criterion of byWeight) {
      const rated = ideas.filter((idea) => idea.scores[criterion.id] != null);
      const topScore = rated.length
        ? Math.max(...rated.map((idea) => idea.scores[criterion.id]))
        : null;

      leaders.push({
        criterion,
        category,
        weight: criterionWeight(criterion, weights),
        ...headlineFor(criterion),
        leaders:
          topScore == null ? [] : rated.filter((idea) => idea.scores[criterion.id] === topScore),
        topScore,
        topHint: topScore == null ? undefined : criterion.hints[topScore],
        ratedCount: rated.length,
      });
    }
  }

  return leaders;
}

/** Die Ideen, die dieses Kriterium mit der Höchstpunktzahl anführen – für das Hervorheben in der Matrix. */
export function leaderIdsByCriterion(leaders: CriterionLeader[]): Map<string, Set<string>> {
  return new Map(
    leaders.map((l) => [l.criterion.id, new Set(l.leaders.map((idea) => idea.id))])
  );
}
