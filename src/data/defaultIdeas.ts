export interface IdeaNotes {
  grundidee: string;
  zielgruppe: string;
  pricing: string;
  status: string;
  fragen: string;
  konkurrenz: { name: string; url: string }[];
}

export interface Idea {
  id: string;
  name: string;
  notes: string; // legacy, kept for migration
  structuredNotes: IdeaNotes;
  scores: Record<string, number>;
}

const emptyNotes: IdeaNotes = {
  grundidee: "",
  zielgruppe: "",
  pricing: "",
  status: "",
  fragen: "",
  konkurrenz: [],
};

export const defaultIdeas: Idea[] = [
  {
    id: "recruiting",
    name: "Recruiting-Agentur",
    notes: "",
    structuredNotes: {
      grundidee: "",
      zielgruppe: "Architekten, Zahnärzte, KMU CH",
      pricing: "6–15k Setup + auto-Retainer. Ø 15–25k CHF/Jahr pro Kunde.",
      status: "System steht zu 90%, validiert.",
      fragen: "",
      konkurrenz: [],
    },
    scores: {},
  },
  {
    id: "it-digi",
    name: "IT-Digitalisierung",
    notes: "",
    structuredNotes: {
      grundidee: "",
      zielgruppe: "KMU, Handwerk, Agenturen",
      pricing: "Projekt 3–13k, Retainer 2–8k/Mo.",
      status: "",
      fragen: "Lizenz- oder personengebunden?",
      konkurrenz: [],
    },
    scores: {},
  },
  {
    id: "saas-laura",
    name: "SaaS-Automation (Laura)",
    notes: "",
    structuredNotes: {
      grundidee: "",
      zielgruppe: "",
      pricing: "Option A: 700€/Mo individuell. Option B: 355€/Mo Standardlizenz.",
      status: "",
      fragen: "Churn-Rate, Sales-Komplexität?",
      konkurrenz: [],
    },
    scores: {},
  },
];

export { emptyNotes };
export type { IdeaNotes as IdeaNotesType };
