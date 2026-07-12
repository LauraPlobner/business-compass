import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useIdeas } from "@/hooks/useIdeas";
import { useCriteria } from "@/hooks/useCriteria";
import { IdeaTabs } from "@/components/IdeaTabs";
import { ScoringView } from "@/components/ScoringView";
import { ScoreSidebar } from "@/components/ScoreSidebar";
import { CompareView } from "@/components/CompareView";
import { OverviewView } from "@/components/OverviewView";
import { Scale } from "lucide-react";

const Index = () => {
  const { ideas, loading, error, setScore, setNotes, setStructuredNote, setCompetitorLinks, addIdea, renameIdea, deleteIdea } = useIdeas();
  const { categories, weights } = useCriteria();
  const [activeId, setActiveId] = useState("");
  const [viewMode, setViewMode] = useState<"overview" | "scoring" | "compare">("overview");

  useEffect(() => {
    if (!loading && ideas.length > 0 && !activeId) {
      setActiveId(ideas[0].id);
    }
  }, [loading, ideas, activeId]);

  const activeIdea = ideas.find((i) => i.id === activeId);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <p className="text-muted-foreground text-sm animate-pulse">Lade Daten…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-2">
          <p className="text-destructive font-semibold">Verbindungsfehler</p>
          <p className="text-muted-foreground text-sm font-mono">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-3 flex items-center justify-between shadow-monday">
        <h1 className="text-lg font-bold text-foreground">Die Grinder Validiermaschine</h1>

        <Link
          to="/einstellungen"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
          title="Kriterien & Gewichtung – gilt für alle Ideen"
        >
          <Scale size={14} />
          Kriterien & Gewichtung
        </Link>
      </div>

      {/* Tabs */}
      <IdeaTabs
        ideas={ideas}
        activeId={activeId}
        onSelect={(id) => { setActiveId(id); setViewMode("scoring"); }}
        onAdd={addIdea}
        onRename={renameIdea}
        onDelete={deleteIdea}
        overviewMode={viewMode === "overview"}
        compareMode={viewMode === "compare"}
        onToggleOverview={() => setViewMode(viewMode === "overview" ? "scoring" : "overview")}
        onToggleCompare={() => setViewMode(viewMode === "compare" ? "scoring" : "compare")}
      />

      {/* Content */}
      {viewMode === "overview" ? (
        <OverviewView
          ideas={ideas}
          weights={weights}
          categories={categories}
          onSelectIdea={(id) => { setActiveId(id); setViewMode("scoring"); }}
        />
      ) : viewMode === "compare" ? (
        <CompareView
          ideas={ideas}
          weights={weights}
          categories={categories}
          onSelectIdea={(id) => {
            setActiveId(id);
            setViewMode("scoring");
          }}
        />
      ) : activeIdea ? (
        <div className="flex flex-1 overflow-hidden">
          <ScoringView
            idea={activeIdea}
            weights={weights}
            categories={categories}
            onSetScore={(crId, val) => setScore(activeIdea.id, crId, val)}
            onSetStructuredNote={(field, value) => setStructuredNote(activeIdea.id, field, value)}
            onSetCompetitorLinks={(links) => setCompetitorLinks(activeIdea.id, links)}
          />
          <ScoreSidebar idea={activeIdea} weights={weights} categories={categories} />
        </div>
      ) : null}
    </div>
  );
};

export default Index;
