import { useState } from "react";
import { useIdeas } from "@/hooks/useIdeas";
import { IdeaTabs } from "@/components/IdeaTabs";
import { ScoringView } from "@/components/ScoringView";
import { ScoreSidebar } from "@/components/ScoreSidebar";
import { CompareView } from "@/components/CompareView";
import { BarChart3 } from "lucide-react";

const Index = () => {
  const { ideas, setScore, setNotes, addIdea, renameIdea, deleteIdea } = useIdeas();
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
          onSelectIdea={(id) => {
            setActiveId(id);
            setCompareMode(false);
          }}
        />
      ) : activeIdea ? (
        <div className="flex flex-1 overflow-hidden">
          <ScoringView
            idea={activeIdea}
            onSetScore={(crId, val) => setScore(activeIdea.id, crId, val)}
            onSetNotes={(notes) => setNotes(activeIdea.id, notes)}
          />
          <ScoreSidebar idea={activeIdea} />
        </div>
      ) : null}
    </div>
  );
};

export default Index;
