import { useState } from "react";
import { useIdeas } from "@/hooks/useIdeas";
import { useWeights } from "@/hooks/useWeights";
import { IdeaTabs } from "@/components/IdeaTabs";
import { ScoringView } from "@/components/ScoringView";
import { ScoreSidebar } from "@/components/ScoreSidebar";
import { CompareView } from "@/components/CompareView";
import { SalesView } from "@/components/SalesView";
import { RotateCcw } from "lucide-react";

const Index = () => {
  const { ideas, setScore, setNotes, setStructuredNote, addIdea, renameIdea, deleteIdea } = useIdeas();
  const { weights, setWeight, resetWeights } = useWeights();
  const [activeId, setActiveId] = useState(ideas[0]?.id || "");
  const [viewMode, setViewMode] = useState<"scoring" | "compare" | "sales">("scoring");

  const activeIdea = ideas.find((i) => i.id === activeId);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-3 flex items-center justify-between shadow-monday">
        <h1 className="text-lg font-bold text-foreground">Die Grinder Validiermaschine</h1>
        
        <button
          onClick={resetWeights}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
          title="Gewichtungen zurücksetzen"
        >
          <RotateCcw size={14} />
          Gewichte reset
        </button>
      </div>

      {/* Tabs */}
      <IdeaTabs
        ideas={ideas}
        activeId={activeId}
        onSelect={(id) => { setActiveId(id); setViewMode("scoring"); }}
        onAdd={addIdea}
        onRename={renameIdea}
        onDelete={deleteIdea}
        compareMode={viewMode === "compare"}
        salesMode={viewMode === "sales"}
        onToggleCompare={() => setViewMode(viewMode === "compare" ? "scoring" : "compare")}
        onToggleSales={() => setViewMode(viewMode === "sales" ? "scoring" : "sales")}
      />

      {/* Content */}
      {viewMode === "compare" ? (
        <CompareView
          ideas={ideas}
          weights={weights}
          onSelectIdea={(id) => {
            setActiveId(id);
            setViewMode("scoring");
          }}
        />
      ) : viewMode === "sales" ? (
        <SalesView ideas={ideas} />
      ) : activeIdea ? (
        <div className="flex flex-1 overflow-hidden">
          <ScoringView
            idea={activeIdea}
            weights={weights}
            onSetScore={(crId, val) => setScore(activeIdea.id, crId, val)}
            onSetStructuredNote={(field, value) => setStructuredNote(activeIdea.id, field, value)}
            onSetWeight={setWeight}
          />
          <ScoreSidebar idea={activeIdea} weights={weights} />
        </div>
      ) : null}
    </div>
  );
};

export default Index;
