export interface IdeaNotes {
  zielgruppe: string;
  pricing: string;
  status: string;
  fragen: string;
  sonstiges: string;
}

export interface Idea {
  id: string;
  name: string;
  notes: string; // legacy, kept for migration
  structuredNotes: IdeaNotes;
  scores: Record<string, number>;
}

const emptyNotes: IdeaNotes = {
  zielgruppe: "",
  pricing: "",
  status: "",
  fragen: "",
  sonstiges: "",
};

export const defaultIdeas: Idea[] = [
  {
    id: "recruiting",
    name: "Recruiting-Agentur",
    notes: "",
    structuredNotes: {
      zielgruppe: "Architekten, Zahnärzte, KMU CH",
      pricing: "6–15k Setup + auto-Retainer. Ø 15–25k CHF/Jahr pro Kunde.",
      status: "System steht zu 90%, validiert.",
      fragen: "",
      sonstiges: "",
    },
    scores: {},
  },
  {
    id: "it-digi",
    name: "IT-Digitalisierung",
    notes: "",
    structuredNotes: {
      zielgruppe: "KMU, Handwerk, Agenturen",
      pricing: "Projekt 3–13k, Retainer 2–8k/Mo.",
      status: "",
      fragen: "Lizenz- oder personengebunden?",
      sonstiges: "",
    },
    scores: {},
  },
  {
    id: "saas-laura",
    name: "SaaS-Automation (Laura)",
    notes: "",
    structuredNotes: {
      zielgruppe: "",
      pricing: "Option A: 700€/Mo individuell. Option B: 355€/Mo Standardlizenz.",
      status: "",
      fragen: "Churn-Rate, Sales-Komplexität?",
      sonstiges: "",
    },
    scores: {},
  },
];

export { emptyNotes };
export type { IdeaNotes as IdeaNotesType };
