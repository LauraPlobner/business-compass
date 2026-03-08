export interface Criterion {
  id: string;
  name: string;
  weight: number;
  hints: Record<number, string>;
}

export interface Category {
  id: string;
  name: string;
  emoji: string;
  weight: number;
  color: string;
  lightColor: string;
  criteria: Criterion[];
}

export const categories: Category[] = [
  {
    id: "finanzen",
    name: "Finanzen",
    emoji: "",
    weight: 35,
    color: "hsl(152, 69%, 43%)",
    lightColor: "hsl(152, 69%, 94%)",
    criteria: [
      { id: "time_to_revenue", name: "Time to Revenue", weight: 10, hints: { 1: ">12 Monate", 2: "6–12 Monate", 3: "3–6 Monate", 4: "1–3 Monate", 5: "<30 Tage" } },
      { id: "revenue_ceiling", name: "Revenue Ceiling", weight: 8, hints: { 1: "<20k CHF/Jahr", 2: "20–50k", 3: "50–150k", 4: "150–500k", 5: ">500k CHF/Jahr" } },
      { id: "recurring_revenue", name: "Recurring Revenue", weight: 8, hints: { 1: "100% projektbasiert", 2: "Wenig wiederkehrend", 3: "Mix", 4: "Überwiegend Retainer", 5: "100% Retainer/Abo" } },
      { id: "marge", name: "Marge", weight: 5, hints: { 1: "<20% netto", 2: "20–40%", 3: "40–55%", 4: "55–75%", 5: ">75% netto" } },
      { id: "break_even", name: "Break-Even Zeitraum", weight: 2, hints: { 1: ">24 Monate", 2: "12–24 Monate", 3: "6–12 Monate", 4: "3–6 Monate", 5: "<3 Monate" } },
      { id: "exit_potenzial", name: "Exit-Potenzial", weight: 2, hints: { 1: "Kein Exit möglich", 2: "Schwer verkaufbar", 3: "Evtl. möglich", 4: "Gut verkaufbar", 5: "Klar verkaufbar" } },
    ],
  },
  {
    id: "lifestyle",
    name: "Lifestyle",
    emoji: "",
    weight: 15,
    color: "hsl(20, 95%, 55%)",
    lightColor: "hsl(20, 95%, 94%)",
    criteria: [
      { id: "motivation", name: "Motivation 2–3 Jahre", weight: 7, hints: { 1: "Würde ich hassen", 2: "Ungern", 3: "Geht so", 4: "Gerne", 5: "Würde ich lieben" } },
      { id: "zeitaufwand", name: "Zeiteffizienz", weight: 5, hints: { 1: "Vollzeit+", 2: "Vollzeit", 3: "30–40h/Woche", 4: "20–30h/Woche", 5: "<20h/Woche" } },
      { id: "learning_curve", name: "Learning Curve", weight: 3, hints: { 1: "Alles neu lernen", 2: "Vieles neu", 3: "Einiges bekannt", 4: "Meist bekannt", 5: "Können wir bereits" } },
    ],
  },
  {
    id: "markt",
    name: "Markt & Wettbewerb",
    emoji: "",
    weight: 20,
    color: "hsl(211, 100%, 50%)",
    lightColor: "hsl(211, 100%, 94%)",
    criteria: [
      { id: "nachfrage", name: "Bestehende Nachfrage", weight: 7, hints: { 1: "Muss erst geschaffen werden", 2: "Gering", 3: "Moderat", 4: "Gut vorhanden", 5: "Klar vorhanden" } },
      { id: "marktsaettigung", name: "Marktsättigung", weight: 5, hints: { 1: "Übersättigt", 2: "Viel Wettbewerb", 3: "Mittel", 4: "Wenig Wettbewerb", 5: "Blue Ocean" } },
      { id: "usp", name: "USP Stärke", weight: 5, hints: { 1: "Kein USP", 2: "Schwacher USP", 3: "Durchschnitt", 4: "Guter USP", 5: "Starkes Alleinstellungsmerkmal" } },
      { id: "marktgroesse", name: "Marktgrösse CH/DACH", weight: 3, hints: { 1: "Mikro-Nische", 2: "Kleine Nische", 3: "Mittelgross", 4: "Grosser Markt", 5: "Massiver Markt" } },
    ],
  },
  {
    id: "operations",
    name: "Operations",
    emoji: "",
    weight: 15,
    color: "hsl(264, 70%, 62%)",
    lightColor: "hsl(264, 70%, 94%)",
    criteria: [
      { id: "time_to_launch", name: "Time to Launch", weight: 5, hints: { 1: ">12 Monate", 2: "6–12 Monate", 3: "2–6 Monate", 4: "1–2 Monate", 5: "<4 Wochen" } },
      { id: "abhaengigkeiten", name: "Abhängigkeiten", weight: 3, hints: { 1: "Viele externe Abhängigkeiten", 2: "Einige externe", 3: "Wenige", 4: "Kaum", 5: "Vollständig autonom" } },
      { id: "selbst_baubar", name: "Eigenleistung möglich", weight: 4, hints: { 1: "Alles outsourcen", 2: "Vieles outsourcen", 3: "Mix", 4: "Vieles selbst", 5: "Alles selbst machbar" } },
      { id: "support", name: "Support & Maintenance", weight: 3, hints: { 1: "Sehr hoher laufender Aufwand", 2: "Hoher Aufwand", 3: "Moderate Pflege", 4: "Wenig Pflege", 5: "Läuft selbständig" } },
    ],
  },
  {
    id: "risiken",
    name: "Risiken & Strategie",
    emoji: "",
    weight: 15,
    color: "hsl(0, 80%, 60%)",
    lightColor: "hsl(0, 80%, 94%)",
    criteria: [
      { id: "worst_case", name: "Worst-Case-Szenario", weight: 5, hints: { 1: "Existenzbedrohend", 2: "Schwerer Schaden", 3: "Spürbarer Verlust", 4: "Geringer Schaden", 5: "Minimaler Schaden" } },
      { id: "opportunity_cost", name: "Opportunity Cost", weight: 4, hints: { 1: "Verpassen wir viel", 2: "Einiges verpasst", 3: "Moderate Kosten", 4: "Wenig Verlust", 5: "Kein relevanter Verlust" } },
      { id: "tueroeffner", name: "Türöffner / Folgeprojekte", weight: 3, hints: { 1: "Sackgasse", 2: "Wenig Potenzial", 3: "Einige Optionen", 4: "Gute Optionen", 5: "Öffnet viele neue Wege" } },
      { id: "initial_investment", name: "Initial Investment", weight: 3, hints: { 1: "Weit über verfügbarem Kapital", 2: "Über Budget", 3: "Am Limit", 4: "Im Budget", 5: "Innerhalb Budget" } },
    ],
  },
];

export function getAllCriteriaIds(): string[] {
  return categories.flatMap((c) => c.criteria.map((cr) => cr.id));
}

export function getTotalWeight(): number {
  return categories.reduce((sum, cat) => sum + cat.criteria.reduce((s, cr) => s + cr.weight, 0), 0);
}
