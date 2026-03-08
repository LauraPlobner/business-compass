import { useState, useEffect, useCallback, useRef } from "react";
import { pb } from "@/lib/pocketbase";

// scores keyed by "ideaId::modelId::channelId1+channelId2..." -> criterionId -> 1-5
export type SalesScores = Record<string, Record<string, number>>;

export function useSalesScores() {
  const [scores, setScores] = useState<SalesScores>({});
  // comboKey -> PocketBase record id
  const recordMapRef = useRef<Record<string, string>>({});
  const scoresRef = useRef<SalesScores>({});

  useEffect(() => {
    scoresRef.current = scores;
  }, [scores]);

  useEffect(() => {
    pb.collection("salesScores")
      .getFullList()
      .then((records) => {
        const loaded: SalesScores = {};
        const map: Record<string, string> = {};
        for (const r of records) {
          const key = r.comboKey as string;
          loaded[key] = (r.scores as Record<string, number>) ?? {};
          map[key] = r.id;
        }
        setScores(loaded);
        recordMapRef.current = map;
      });
  }, []);

  const setScore = useCallback(async (comboKey: string, criterionId: string, value: number) => {
    const current = scoresRef.current[comboKey] ?? {};
    const newComboScores = { ...current, [criterionId]: value };

    setScores((prev) => ({ ...prev, [comboKey]: newComboScores }));

    const existingId = recordMapRef.current[comboKey];
    if (existingId) {
      await pb.collection("salesScores").update(existingId, { scores: newComboScores });
    } else {
      const [ideaId, modelId, channels] = comboKey.split("::");
      const r = await pb.collection("salesScores").create({
        comboKey,
        ideaId,
        modelId,
        channelIds: channels ? channels.split("+") : [],
        scores: newComboScores,
      });
      recordMapRef.current[comboKey] = r.id;
    }
  }, []);

  const getComboScore = useCallback((comboKey: string): Record<string, number> => {
    return scores[comboKey] || {};
  }, [scores]);

  const getComboAverage = useCallback(
    (comboKey: string, criteriaCount: number): number => {
      const s = scores[comboKey] || {};
      const values = Object.values(s);
      if (values.length === 0) return 0;
      return values.reduce((a, b) => a + b, 0) / criteriaCount;
    },
    [scores]
  );

  return { scores, setScore, getComboScore, getComboAverage };
}
