import { categories } from "@/data/criteria";
import { Idea } from "@/data/defaultIdeas";

export function computeCategoryScore(idea: Idea, categoryId: string): number {
  const cat = categories.find((c) => c.id === categoryId);
  if (!cat) return 0;
  let totalWeight = 0;
  let weightedSum = 0;
  for (const cr of cat.criteria) {
    const score = idea.scores[cr.id];
    if (score != null) {
      weightedSum += score * cr.weight;
      totalWeight += cr.weight;
    }
  }
  return totalWeight > 0 ? weightedSum / totalWeight : 0;
}

export function computeTotalScore(idea: Idea): number {
  let totalWeight = 0;
  let weightedSum = 0;
  for (const cat of categories) {
    for (const cr of cat.criteria) {
      const score = idea.scores[cr.id];
      if (score != null) {
        weightedSum += score * cr.weight;
        totalWeight += cr.weight;
      }
    }
  }
  return totalWeight > 0 ? weightedSum / totalWeight : 0;
}

export function getGrade(score: number): { label: string; color: string; bg: string } {
  if (score >= 4.2) return { label: "GO", color: "hsl(152, 69%, 53%)", bg: "hsl(152, 69%, 95%)" };
  if (score >= 3.2) return { label: "MAYBE", color: "hsl(39, 100%, 50%)", bg: "hsl(39, 100%, 95%)" };
  return { label: "NO-GO", color: "hsl(0, 80%, 60%)", bg: "hsl(0, 80%, 95%)" };
}

export function getBarColor(score: number): string {
  if (score >= 4) return "hsl(152, 69%, 53%)";
  if (score >= 3) return "hsl(39, 100%, 50%)";
  return "hsl(20, 95%, 55%)";
}

export function getUnansweredCriteria(idea: Idea): { categoryName: string; criterionName: string }[] {
  const unanswered: { categoryName: string; criterionName: string }[] = [];
  for (const cat of categories) {
    for (const cr of cat.criteria) {
      if (idea.scores[cr.id] == null) {
        unanswered.push({ categoryName: cat.name, criterionName: cr.name });
      }
    }
  }
  return unanswered;
}
