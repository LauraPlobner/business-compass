import { describe, it, expect } from "vitest";
import { Category } from "@/data/criteria";
import { Idea } from "@/data/defaultIdeas";
import { getCriterionLeaders } from "@/lib/criteriaInsights";

const cats: Category[] = [
  {
    id: "finanzen",
    name: "Finanzen",
    emoji: "",
    weight: 35,
    color: "#0f0",
    lightColor: "#efe",
    criteria: [
      {
        id: "time_to_revenue",
        name: "Time to Revenue",
        weight: 10,
        hints: { 1: ">12 Monate", 2: "6–12 Monate", 3: "3–6 Monate", 4: "1–3 Monate", 5: "<30 Tage" },
      },
      {
        id: "revenue_ceiling",
        name: "Revenue Ceiling",
        weight: 8,
        hints: { 1: "<20k CHF/Jahr", 2: "20–50k", 3: "50–150k", 4: "150–500k", 5: ">500k CHF/Jahr" },
      },
    ],
  },
  {
    id: "lifestyle",
    name: "Lifestyle",
    emoji: "",
    weight: 15,
    color: "#f80",
    lightColor: "#fed",
    criteria: [
      // Wie Lauras eigenes Kriterium: nur Stufe 1 und 5 haben einen Klartext.
      {
        id: "c_x1wo417v",
        name: "Remoteness",
        weight: 10,
        hints: { 1: "Zeitzone und Präsenz entscheidend", 5: "Völlig egal, wann und wo wir sind" },
        custom: true,
      },
    ],
  },
];

const idea = (id: string, name: string, scores: Record<string, number>): Idea => ({
  id,
  name,
  notes: "",
  structuredNotes: {},
  scores,
});

const byId = (id: string) => (l: { criterion: { id: string } }) => l.criterion.id === id;

describe("getCriterionLeaders", () => {
  it("kürt pro Kriterium die Idee mit der höchsten Punktzahl – unabhängig vom Gesamtscore", () => {
    const ideas = [
      idea("a", "Automation", { time_to_revenue: 2, revenue_ceiling: 5 }),
      idea("b", "Marktplätze", { time_to_revenue: 4, revenue_ceiling: 3 }),
    ];

    const leaders = getCriterionLeaders(ideas, cats, {});

    const ttr = leaders.find(byId("time_to_revenue"))!;
    expect(ttr.leaders.map((i) => i.name)).toEqual(["Marktplätze"]);
    expect(ttr.topScore).toBe(4);

    // Die schwächere Idee bei Time to Revenue führt trotzdem beim Revenue Ceiling.
    const ceiling = leaders.find(byId("revenue_ceiling"))!;
    expect(ceiling.leaders.map((i) => i.name)).toEqual(["Automation"]);
    expect(ceiling.topScore).toBe(5);
  });

  it("übersetzt die Punktzahl des Siegers in den hinterlegten Klartext", () => {
    const ideas = [idea("a", "Automation", { time_to_revenue: 5 })];
    const ttr = getCriterionLeaders(ideas, cats, {}).find(byId("time_to_revenue"))!;

    expect(ttr.topHint).toBe("<30 Tage");
    expect(ttr.headline).toBe("Am schnellsten Geld verdienen");
    expect(ttr.hasPhrase).toBe(true);
  });

  it("lässt den Klartext weg, wenn für die Stufe keine Hilfe hinterlegt ist", () => {
    const ideas = [idea("a", "Automation", { c_x1wo417v: 3 })];
    const remote = getCriterionLeaders(ideas, cats, {}).find(byId("c_x1wo417v"))!;

    expect(remote.topScore).toBe(3);
    expect(remote.topHint).toBeUndefined();
  });

  it("nutzt für eigene Kriterien den Namen statt einer erfundenen Klartext-Frage", () => {
    const remote = getCriterionLeaders([], cats, {}).find(byId("c_x1wo417v"))!;

    expect(remote.headline).toBe("Remoteness");
    expect(remote.hasPhrase).toBe(false);
  });

  it("erfindet keinen Sieger, solange keine Idee das Kriterium bewertet hat", () => {
    const ideas = [idea("a", "Automation", { time_to_revenue: 3 })];
    const remote = getCriterionLeaders(ideas, cats, {}).find(byId("c_x1wo417v"))!;

    expect(remote.topScore).toBeNull();
    expect(remote.leaders).toEqual([]);
    expect(remote.ratedCount).toBe(0);
  });

  it("führt bei Gleichstand alle führenden Ideen auf", () => {
    const ideas = [
      idea("a", "Automation", { time_to_revenue: 4 }),
      idea("b", "Marktplätze", { time_to_revenue: 4 }),
      idea("c", "Brigg", { time_to_revenue: 2 }),
    ];
    const ttr = getCriterionLeaders(ideas, cats, {}).find(byId("time_to_revenue"))!;

    expect(ttr.leaders.map((i) => i.name)).toEqual(["Automation", "Marktplätze"]);
    expect(ttr.ratedCount).toBe(3);
  });

  it("ignoriert unbewertete Ideen, statt sie als 0 zu werten", () => {
    const ideas = [
      idea("a", "Automation", { time_to_revenue: 1 }),
      idea("b", "Leere Idee", {}),
    ];
    const ttr = getCriterionLeaders(ideas, cats, {}).find(byId("time_to_revenue"))!;

    expect(ttr.leaders.map((i) => i.name)).toEqual(["Automation"]);
    expect(ttr.topScore).toBe(1);
    expect(ttr.ratedCount).toBe(1);
  });

  it("sortiert Kriterien innerhalb der Kategorie nach der eingestellten Gewichtung", () => {
    // Revenue Ceiling wird in den Einstellungen über Time to Revenue gehoben.
    const leaders = getCriterionLeaders([], cats, { time_to_revenue: 6, revenue_ceiling: 9 });
    const finanzen = leaders.filter((l) => l.category.id === "finanzen");

    expect(finanzen.map((l) => l.criterion.id)).toEqual(["revenue_ceiling", "time_to_revenue"]);
    expect(finanzen[0].weight).toBe(9);
  });
});
