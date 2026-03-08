import { useState, useEffect, useCallback, useRef } from "react";
import { pb } from "@/lib/pocketbase";
import { categories } from "@/data/criteria";

export type CustomWeights = Record<string, number>; // criterionId -> weight

function getDefaultWeights(): CustomWeights {
  const weights: CustomWeights = {};
  for (const cat of categories) {
    for (const cr of cat.criteria) {
      weights[cr.id] = cr.weight;
    }
  }
  return weights;
}

export function useWeights() {
  const [weights, setWeights] = useState<CustomWeights>(getDefaultWeights);
  const recordIdRef = useRef<string | null>(null);
  const weightsRef = useRef<CustomWeights>(weights);

  useEffect(() => {
    weightsRef.current = weights;
  }, [weights]);

  useEffect(() => {
    pb.collection("weights")
      .getFullList()
      .then((records) => {
        if (records.length > 0) {
          const r = records[0];
          recordIdRef.current = r.id;
          setWeights({ ...getDefaultWeights(), ...(r.data as CustomWeights) });
        }
      });
  }, []);

  const persist = useCallback(async (newWeights: CustomWeights) => {
    if (recordIdRef.current) {
      await pb.collection("weights").update(recordIdRef.current, { data: newWeights });
    } else {
      const r = await pb.collection("weights").create({ data: newWeights });
      recordIdRef.current = r.id;
    }
  }, []);

  const setWeight = useCallback(
    (criterionId: string, value: number) => {
      const rounded = Math.max(0, Math.round(value));
      setWeights((prev) => {
        const next = { ...prev, [criterionId]: rounded };
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const resetWeights = useCallback(() => {
    const defaults = getDefaultWeights();
    setWeights(defaults);
    persist(defaults);
  }, [persist]);

  return { weights, setWeight, resetWeights };
}
