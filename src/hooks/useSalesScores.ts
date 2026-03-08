import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "biv-sales-scores";

// scores keyed by "ideaId::modelId::channelId" -> criterionId -> 1-5
export type SalesScores = Record<string, Record<string, number>>;

function loadScores(): SalesScores {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return {};
}

export function useSalesScores() {
  const [scores, setScores] = useState<SalesScores>(loadScores);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
  }, [scores]);

  const setScore = useCallback((comboKey: string, criterionId: string, value: number) => {
    setScores((prev) => ({
      ...prev,
      [comboKey]: { ...(prev[comboKey] || {}), [criterionId]: value },
    }));
  }, []);

  const getComboScore = useCallback((comboKey: string): Record<string, number> => {
    return scores[comboKey] || {};
  }, [scores]);

  const getComboAverage = useCallback((comboKey: string, criteriaCount: number): number => {
    const s = scores[comboKey] || {};
    const values = Object.values(s);
    if (values.length === 0) return 0;
    return values.reduce((a, b) => a + b, 0) / criteriaCount;
  }, [scores]);

  return { scores, setScore, getComboScore, getComboAverage };
}
