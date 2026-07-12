import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { pb } from "@/lib/pocketbase";
import { categories as builtinCategories, buildCategories, CustomCriterion } from "@/data/criteria";

export type CustomWeights = Record<string, number>; // criterionId -> weight

/** Schlüssel, unter dem die eigenen Kriterien im JSON-Feld des weights-Records liegen. */
const CRITERIA_KEY = "__criteria";

function getDefaultWeights(custom: CustomCriterion[] = []): CustomWeights {
  const weights: CustomWeights = {};
  for (const cat of builtinCategories) {
    for (const cr of cat.criteria) {
      weights[cr.id] = cr.weight;
    }
  }
  for (const cr of custom) {
    weights[cr.id] = cr.weight;
  }
  return weights;
}

/** Der eine Record enthält beides: die Gewichte (flach) und die eigenen Kriterien. */
function parseRecord(data: unknown): { weights: CustomWeights; custom: CustomCriterion[] } {
  const raw = (data ?? {}) as Record<string, unknown>;
  const custom = Array.isArray(raw[CRITERIA_KEY]) ? (raw[CRITERIA_KEY] as CustomCriterion[]) : [];
  const weights: CustomWeights = {};
  for (const [key, value] of Object.entries(raw)) {
    if (key !== CRITERIA_KEY && typeof value === "number") weights[key] = value;
  }
  return { weights, custom };
}

function serialize(weights: CustomWeights, custom: CustomCriterion[]): Record<string, unknown> {
  return { ...weights, [CRITERIA_KEY]: custom };
}

function newCriterionId(): string {
  return `c_${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Kriterien und Gewichtung sind global: ein einziger Record für alle Ideen.
 * Eine Änderung hier bewertet jede Idee sofort neu.
 */
export function useCriteria() {
  const [weights, setWeights] = useState<CustomWeights>(() => getDefaultWeights());
  const [custom, setCustom] = useState<CustomCriterion[]>([]);

  const weightsRef = useRef<CustomWeights>(weights);
  const customRef = useRef<CustomCriterion[]>(custom);
  const recordIdRef = useRef<string | null>(null);
  // Resolves, sobald bekannt ist, ob schon ein Record existiert – so legt ein
  // früher Klick nicht versehentlich einen zweiten an.
  const loadedRef = useRef<Promise<void> | null>(null);
  const dirtyRef = useRef(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadedRef.current = pb
      .collection("weights")
      .getFullList()
      .then((records) => {
        if (records.length === 0) return;
        recordIdRef.current = records[0].id;
        // Änderungen, die während des Ladens passiert sind, haben Vorrang.
        if (dirtyRef.current) return;

        const parsed = parseRecord(records[0].data);
        const merged = { ...getDefaultWeights(parsed.custom), ...parsed.weights };
        weightsRef.current = merged;
        customRef.current = parsed.custom;
        setWeights(merged);
        setCustom(parsed.custom);
      })
      .catch((e) => {
        console.error("[useCriteria] Ladefehler:", e);
      });
  }, []);

  const persist = useCallback(async () => {
    await loadedRef.current;
    const data = serialize(weightsRef.current, customRef.current);
    try {
      if (recordIdRef.current) {
        await pb.collection("weights").update(recordIdRef.current, { data });
      } else {
        const r = await pb.collection("weights").create({ data });
        recordIdRef.current = r.id;
      }
    } catch (e) {
      console.error("[useCriteria] Speicherfehler:", e);
    }
  }, []);

  const schedulePersist = useCallback(() => {
    dirtyRef.current = true;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => void persist(), 300);
  }, [persist]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  const setWeight = useCallback(
    (criterionId: string, value: number) => {
      const rounded = Math.max(0, Math.min(100, Math.round(value || 0)));
      const next = { ...weightsRef.current, [criterionId]: rounded };
      weightsRef.current = next;
      setWeights(next);
      schedulePersist();
    },
    [schedulePersist]
  );

  const resetWeights = useCallback(() => {
    const defaults = getDefaultWeights(customRef.current);
    weightsRef.current = defaults;
    setWeights(defaults);
    schedulePersist();
  }, [schedulePersist]);

  const addCriterion = useCallback(
    (input: { categoryId: string; name: string; weight: number; hints: Record<number, string> }) => {
      const criterion: CustomCriterion = {
        id: newCriterionId(),
        categoryId: input.categoryId,
        name: input.name.trim(),
        weight: Math.max(0, Math.min(100, Math.round(input.weight || 0))),
        hints: input.hints,
      };
      const nextCustom = [...customRef.current, criterion];
      const nextWeights = { ...weightsRef.current, [criterion.id]: criterion.weight };
      customRef.current = nextCustom;
      weightsRef.current = nextWeights;
      setCustom(nextCustom);
      setWeights(nextWeights);
      schedulePersist();
      return criterion.id;
    },
    [schedulePersist]
  );

  const deleteCriterion = useCallback(
    (criterionId: string) => {
      const nextCustom = customRef.current.filter((c) => c.id !== criterionId);
      const nextWeights = { ...weightsRef.current };
      delete nextWeights[criterionId];
      customRef.current = nextCustom;
      weightsRef.current = nextWeights;
      setCustom(nextCustom);
      setWeights(nextWeights);
      schedulePersist();
    },
    [schedulePersist]
  );

  const cats = useMemo(() => buildCategories(custom), [custom]);

  return { categories: cats, weights, setWeight, resetWeights, addCriterion, deleteCriterion };
}
