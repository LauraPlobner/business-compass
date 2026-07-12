import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { pb } from "@/lib/pocketbase";
import {
  categories as builtinCategories,
  buildCategories,
  clampWeight,
  CriterionNames,
  CustomCriterion,
  getDefaultWeight,
  getHiddenCriteria,
  MIN_WEIGHT,
} from "@/data/criteria";

export type CustomWeights = Record<string, number>; // criterionId -> weight

/**
 * Schlüssel im JSON-Feld des weights-Records. Alles mit "__" davor ist Metadaten,
 * alles andere ist ein Gewicht (criterionId -> Zahl).
 */
const CRITERIA_KEY = "__criteria"; // selbst angelegte Kriterien
const DELETED_KEY = "__deleted"; // gelöschte Standard-Kriterien (ids)
const NAMES_KEY = "__names"; // umbenannte Standard-Kriterien (id -> Name)

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

interface CriteriaState {
  weights: CustomWeights;
  custom: CustomCriterion[];
  deleted: string[];
  names: CriterionNames;
}

/** Der eine Record enthält alles: Gewichte (flach), eigene, gelöschte und umbenannte Kriterien. */
function parseRecord(data: unknown): CriteriaState {
  const raw = (data ?? {}) as Record<string, unknown>;
  const custom = (Array.isArray(raw[CRITERIA_KEY]) ? (raw[CRITERIA_KEY] as CustomCriterion[]) : []).map(
    (c) => ({ ...c, weight: clampWeight(c.weight) })
  );
  const deleted = Array.isArray(raw[DELETED_KEY])
    ? (raw[DELETED_KEY] as unknown[]).filter((id): id is string => typeof id === "string")
    : [];
  const names: CriterionNames = {};
  for (const [id, value] of Object.entries((raw[NAMES_KEY] ?? {}) as Record<string, unknown>)) {
    if (typeof value === "string") names[id] = value;
  }

  // Gewicht 0 hiess früher "zählt nicht". Die Skala kennt die 0 nicht mehr, also wird das
  // Kriterium stattdessen ausgeblendet – es fliesst weiterhin nicht in den Score ein und
  // bekommt sein Standard-Gewicht zurück, falls es später wieder eingeblendet wird.
  const hidden = new Set(deleted);
  const weights: CustomWeights = {};
  for (const [key, value] of Object.entries(raw)) {
    if (key.startsWith("__") || typeof value !== "number") continue;
    const standardWeight = getDefaultWeight(key);
    // Nur Standard-Kriterien lassen sich ausblenden; eigene würden sonst unerreichbar.
    if (value === 0 && standardWeight !== undefined) {
      hidden.add(key);
      weights[key] = standardWeight;
    } else {
      weights[key] = clampWeight(value);
    }
  }

  return { weights, custom, deleted: [...hidden], names };
}

function serialize(state: CriteriaState): Record<string, unknown> {
  return {
    ...state.weights,
    [CRITERIA_KEY]: state.custom,
    [DELETED_KEY]: state.deleted,
    [NAMES_KEY]: state.names,
  };
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
  const [deleted, setDeleted] = useState<string[]>([]);
  const [names, setNames] = useState<CriterionNames>({});

  const weightsRef = useRef<CustomWeights>(weights);
  const customRef = useRef<CustomCriterion[]>(custom);
  const deletedRef = useRef<string[]>(deleted);
  const namesRef = useRef<CriterionNames>(names);
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
        deletedRef.current = parsed.deleted;
        namesRef.current = parsed.names;
        setWeights(merged);
        setCustom(parsed.custom);
        setDeleted(parsed.deleted);
        setNames(parsed.names);
      })
      .catch((e) => {
        console.error("[useCriteria] Ladefehler:", e);
      });
  }, []);

  const persist = useCallback(async () => {
    await loadedRef.current;
    const data = serialize({
      weights: weightsRef.current,
      custom: customRef.current,
      deleted: deletedRef.current,
      names: namesRef.current,
    });
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
      const next = { ...weightsRef.current, [criterionId]: clampWeight(value) };
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
        weight: clampWeight(input.weight),
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

  /**
   * Löscht jedes Kriterium – eigene verschwinden ganz, Standard-Kriterien werden
   * ausgeblendet und lassen sich mit restoreStandardCriteria() zurückholen.
   */
  const deleteCriterion = useCallback(
    (criterionId: string) => {
      const isCustom = customRef.current.some((c) => c.id === criterionId);

      if (isCustom) {
        const nextCustom = customRef.current.filter((c) => c.id !== criterionId);
        const nextWeights = { ...weightsRef.current };
        delete nextWeights[criterionId];
        customRef.current = nextCustom;
        weightsRef.current = nextWeights;
        setCustom(nextCustom);
        setWeights(nextWeights);
      } else {
        if (deletedRef.current.includes(criterionId)) return;
        // Gewicht und Name bleiben stehen: beim Wiederherstellen ist alles wieder da.
        const nextDeleted = [...deletedRef.current, criterionId];
        deletedRef.current = nextDeleted;
        setDeleted(nextDeleted);
      }
      schedulePersist();
    },
    [schedulePersist]
  );

  /** Benennt jedes Kriterium um, eigene wie Standard-Kriterien. */
  const renameCriterion = useCallback(
    (criterionId: string, name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      const isCustom = customRef.current.some((c) => c.id === criterionId);

      if (isCustom) {
        const nextCustom = customRef.current.map((c) =>
          c.id === criterionId ? { ...c, name: trimmed } : c
        );
        customRef.current = nextCustom;
        setCustom(nextCustom);
      } else {
        const nextNames = { ...namesRef.current, [criterionId]: trimmed };
        namesRef.current = nextNames;
        setNames(nextNames);
      }
      schedulePersist();
    },
    [schedulePersist]
  );

  /** Blendet ein einzelnes Standard-Kriterium wieder ein – Gewicht und Bewertungen sind wieder da. */
  const restoreCriterion = useCallback(
    (criterionId: string) => {
      const next = deletedRef.current.filter((id) => id !== criterionId);
      if (next.length === deletedRef.current.length) return;
      deletedRef.current = next;
      setDeleted(next);
      schedulePersist();
    },
    [schedulePersist]
  );

  /** Holt alle ausgeblendeten Standard-Kriterien samt Gewicht und Bewertungen zurück. */
  const restoreStandardCriteria = useCallback(() => {
    deletedRef.current = [];
    setDeleted([]);
    schedulePersist();
  }, [schedulePersist]);

  const cats = useMemo(() => buildCategories(custom, deleted, names), [custom, deleted, names]);
  const hidden = useMemo(() => getHiddenCriteria(deleted, names), [deleted, names]);

  return {
    categories: cats,
    weights,
    setWeight,
    resetWeights,
    addCriterion,
    deleteCriterion,
    renameCriterion,
    restoreCriterion,
    restoreStandardCriteria,
    hiddenCriteria: hidden,
    deletedCount: deleted.length,
  };
}
