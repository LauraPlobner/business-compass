import { useState, useEffect, useCallback } from "react";
import { categories } from "@/data/criteria";

export type CustomWeights = Record<string, number>; // criterionId -> weight

const STORAGE_KEY = "biv-weights";

function getDefaultWeights(): CustomWeights {
  const weights: CustomWeights = {};
  for (const cat of categories) {
    for (const cr of cat.criteria) {
      weights[cr.id] = cr.weight;
    }
  }
  return weights;
}

function loadWeights(): CustomWeights {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with defaults in case new criteria were added
      return { ...getDefaultWeights(), ...parsed };
    }
  } catch {}
  return getDefaultWeights();
}

export function useWeights() {
  const [weights, setWeights] = useState<CustomWeights>(loadWeights);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(weights));
  }, [weights]);

  const setWeight = useCallback((criterionId: string, value: number) => {
    setWeights((prev) => ({ ...prev, [criterionId]: Math.max(0, Math.round(value)) }));
  }, []);

  const resetWeights = useCallback(() => {
    setWeights(getDefaultWeights());
  }, []);

  return { weights, setWeight, resetWeights };
}
