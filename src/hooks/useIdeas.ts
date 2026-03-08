import { useState, useEffect, useCallback, useRef } from "react";
import { pb } from "@/lib/pocketbase";
import { Idea, defaultIdeas, emptyNotes, IdeaNotesType } from "@/data/defaultIdeas";

function recordToIdea(r: Record<string, unknown>): Idea {
  return {
    id: r.id as string,
    name: r.name as string,
    notes: (r.notes as string) ?? "",
    structuredNotes: (r.structuredNotes as Idea["structuredNotes"]) ?? { ...emptyNotes },
    scores: (r.scores as Record<string, number>) ?? {},
  };
}

export function useIdeas() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const ideasRef = useRef<Idea[]>([]);

  useEffect(() => {
    ideasRef.current = ideas;
  }, [ideas]);

  useEffect(() => {
    pb.collection("ideas")
      .getFullList({ sort: "created" })
      .then(async (records) => {
        if (records.length === 0) {
          const created = await Promise.all(
            defaultIdeas.map((idea) =>
              pb.collection("ideas").create({
                name: idea.name,
                notes: idea.notes ?? "",
                structuredNotes: idea.structuredNotes,
                scores: idea.scores,
              })
            )
          );
          setIdeas(created.map(recordToIdea));
        } else {
          setIdeas(records.map(recordToIdea));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const setScore = useCallback(async (ideaId: string, criterionId: string, value: number) => {
    const current = ideasRef.current.find((i) => i.id === ideaId);
    if (!current) return;
    const newScores = { ...current.scores, [criterionId]: value };
    setIdeas((prev) =>
      prev.map((idea) => (idea.id === ideaId ? { ...idea, scores: newScores } : idea))
    );
    await pb.collection("ideas").update(ideaId, { scores: newScores });
  }, []);

  const setNotes = useCallback(async (ideaId: string, notes: string) => {
    setIdeas((prev) => prev.map((idea) => (idea.id === ideaId ? { ...idea, notes } : idea)));
    await pb.collection("ideas").update(ideaId, { notes });
  }, []);

  const setStructuredNote = useCallback(
    async (ideaId: string, field: keyof IdeaNotesType, value: string) => {
      const current = ideasRef.current.find((i) => i.id === ideaId);
      if (!current) return;
      const newStructuredNotes = { ...current.structuredNotes, [field]: value };
      setIdeas((prev) =>
        prev.map((idea) =>
          idea.id === ideaId ? { ...idea, structuredNotes: newStructuredNotes } : idea
        )
      );
      await pb.collection("ideas").update(ideaId, { structuredNotes: newStructuredNotes });
    },
    []
  );

  const addIdea = useCallback(async (name: string) => {
    const record = await pb.collection("ideas").create({
      name,
      notes: "",
      structuredNotes: { ...emptyNotes },
      scores: {},
    });
    const idea = recordToIdea(record);
    setIdeas((prev) => [...prev, idea]);
    return idea.id;
  }, []);

  const renameIdea = useCallback(async (ideaId: string, name: string) => {
    setIdeas((prev) => prev.map((idea) => (idea.id === ideaId ? { ...idea, name } : idea)));
    await pb.collection("ideas").update(ideaId, { name });
  }, []);

  const deleteIdea = useCallback(async (ideaId: string) => {
    setIdeas((prev) => prev.filter((idea) => idea.id !== ideaId));
    await pb.collection("ideas").delete(ideaId);
  }, []);

  return { ideas, loading, setScore, setNotes, setStructuredNote, addIdea, renameIdea, deleteIdea };
}
