export interface SalesModel {
  id: string;
  name: string;
}

export interface SalesChannel {
  id: string;
  name: string;
}

export interface SalesCriterion {
  id: string;
  name: string;
  hints: Record<number, string>;
}

export const salesModels: SalesModel[] = [
  { id: "whitelabel", name: "Whitelabel" },
  { id: "individual-setup", name: "Individuelles Setup" },
  { id: "lizenz", name: "Lizenzierung" },
];

export const salesChannels: SalesChannel[] = [
  { id: "direktvertrieb", name: "Direktvertrieb" },
  { id: "ads", name: "Ads (Online)" },
  { id: "messen-events", name: "Messen / Networking" },
];

export const salesCriteria: SalesCriterion[] = [
  {
    id: "skalierbarkeit",
    name: "Skalierbarkeit",
    hints: { 1: "Gar nicht skalierbar", 2: "Schwer skalierbar", 3: "Begrenzt skalierbar", 4: "Gut skalierbar", 5: "Extrem skalierbar" },
  },
  {
    id: "marge",
    name: "Marge",
    hints: { 1: "<10% netto", 2: "10–25%", 3: "25–45%", 4: "45–65%", 5: ">65% netto" },
  },
  {
    id: "sales-cycle",
    name: "Sales-Cycle Länge",
    hints: { 1: ">6 Monate", 2: "3–6 Monate", 3: "1–3 Monate", 4: "2–4 Wochen", 5: "<2 Wochen" },
  },
  {
    id: "team-aufwand",
    name: "Team-Aufwand",
    hints: { 1: "Grosses Team nötig", 2: "Mehrere Leute", 3: "2–3 Personen", 4: "1–2 Personen", 5: "Alleine machbar" },
  },
  {
    id: "technischer-aufwand",
    name: "Technischer Aufwand",
    hints: { 1: "Sehr hoch", 2: "Hoch", 3: "Moderat", 4: "Gering", 5: "Minimal" },
  },
  {
    id: "akquise-eignung",
    name: "Akquise-Eignung",
    hints: { 1: "Ungeeignet für diesen Kanal", 2: "Schwierig", 3: "Möglich", 4: "Gut geeignet", 5: "Perfekt geeignet" },
  },
  {
    id: "cac",
    name: "Kundenakquisitionskosten (CAC)",
    hints: { 1: "Sehr hoch (>5k)", 2: "Hoch (2–5k)", 3: "Mittel (500–2k)", 4: "Niedrig (100–500)", 5: "Minimal (<100)" },
  },
];

// Combination key: ideaId::modelId::channelId
export function comboKey(ideaId: string, modelId: string, channelId: string): string {
  return `${ideaId}::${modelId}::${channelId}`;
}
