export interface Idea {
  id: string;
  name: string;
  notes: string;
  scores: Record<string, number>; // criterionId -> 1-5
}

export const defaultIdeas: Idea[] = [
  {
    id: "recruiting",
    name: "Recruiting-Agentur",
    notes: `Zielgruppe: Architekten, Zahnärzte, KMU CH.
Pricing: 6–15k Setup + auto-Retainer.
Ø 15–25k CHF/Jahr pro Kunde.
System steht zu 90%, validiert.`,
    scores: {},
  },
  {
    id: "it-digi",
    name: "IT-Digitalisierung",
    notes: `KMU, Handwerk, Agenturen.
Projekt 3–13k, Retainer 2–8k/Mo.
Fragen offen: Lizenz- oder personengebunden?`,
    scores: {},
  },
  {
    id: "saas-laura",
    name: "SaaS-Automation (Laura)",
    notes: `Option A: 700€/Mo individuell.
Option B: 355€/Mo Standardlizenz.
Fragen: Churn-Rate, Sales-Komplexität?`,
    scores: {},
  },
];
