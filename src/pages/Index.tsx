import { useState } from "react";
import { useIdeas } from "@/hooks/useIdeas";
import { useWeights } from "@/hooks/useWeights";
import { IdeaTabs } from "@/components/IdeaTabs";
import { ScoringView } from "@/components/ScoringView";
import { ScoreSidebar } from "@/components/ScoreSidebar";
import { CompareView } from "@/components/CompareView";
import { BarChart3, RotateCcw } from "lucide-react";

const Index = () => {
  const { ideas, setScore, setNotes, addIdea, renameIdea, deleteIdea } = useIdeas();
  const { weights, setWeight, resetWeights } = useWeights();
  const [activeId, setActiveId] = useState(ideas[0]?.id || "");
  const [compareMode, setCompareMode] = useState(false);

  const activeIdea = ideas.find((i) => i.id === activeId);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-3 flex items-center justify-between shadow-monday">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-lg font-bold text-foreground">Business Idea Validator</h1>
        </div>
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
        onSelect={setActiveId}
        onAdd={addIdea}
        onRename={renameIdea}
        onDelete={deleteIdea}
        compareMode={compareMode}
        onToggleCompare={() => setCompareMode(!compareMode)}
      />

      {/* Content */}
      {compareMode ? (
        <CompareView
          ideas={ideas}
          weights={weights}
          onSelectIdea={(id) => {
            setActiveId(id);
            setCompareMode(false);
          }}
        />
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
