import { useState } from "react";
import { useIdeas } from "@/hooks/useIdeas";
import { IdeaTabs } from "@/components/IdeaTabs";
import { ScoringView } from "@/components/ScoringView";
import { ScoreSidebar } from "@/components/ScoreSidebar";
import { CompareView } from "@/components/CompareView";

const Index = () => {
  const { ideas, setScore, setNotes, addIdea, renameIdea, deleteIdea } = useIdeas();
  const [activeId, setActiveId] = useState(ideas[0]?.id || "");
  const [compareMode, setCompareMode] = useState(false);

  const activeIdea = ideas.find((i) => i.id === activeId);

  return (
    <div className="flex flex-col" style={{ height: "100vh", background: "#080808" }}>
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
