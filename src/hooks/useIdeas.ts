import { useState, useEffect, useCallback } from "react";
import { Idea, defaultIdeas } from "@/data/defaultIdeas";

const STORAGE_KEY = "biv-ideas";

function loadIdeas(): Idea[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return defaultIdeas;
}

export function useIdeas() {
  const [ideas, setIdeas] = useState<Idea[]>(loadIdeas);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ideas));
  }, [ideas]);

  const setScore = useCallback((ideaId: string, criterionId: string, value: number) => {
    setIdeas((prev) =>
      prev.map((idea) =>
        idea.id === ideaId ? { ...idea, scores: { ...idea.scores, [criterionId]: value } } : idea
      )
    );
  }, []);

  const setNotes = useCallback((ideaId: string, notes: string) => {
    setIdeas((prev) => prev.map((idea) => (idea.id === ideaId ? { ...idea, notes } : idea)));
  }, []);

  const addIdea = useCallback((name: string) => {
    const id = `idea-${Date.now()}`;
    setIdeas((prev) => [...prev, { id, name, notes: "", scores: {} }]);
    return id;
  }, []);

  const renameIdea = useCallback((ideaId: string, name: string) => {
    setIdeas((prev) => prev.map((idea) => (idea.id === ideaId ? { ...idea, name } : idea)));
  }, []);

  const deleteIdea = useCallback((ideaId: string) => {
    setIdeas((prev) => prev.filter((idea) => idea.id !== ideaId));
  }, []);

  return { ideas, setScore, setNotes, addIdea, renameIdea, deleteIdea };
}
