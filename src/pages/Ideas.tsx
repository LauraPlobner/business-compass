import { Navigate, useNavigate, useParams } from "react-router-dom";
import { IdeaSidebar } from "@/components/IdeaSidebar";
import { OverviewView } from "@/components/OverviewView";
import { ScoreSidebar } from "@/components/ScoreSidebar";
import { ScoringView } from "@/components/ScoringView";
import { useAppData } from "@/pages/AppLayout";

const Ideas = () => {
  const { ideasApi, criteriaApi } = useAppData();
  const { ideas, setScore, setStructuredNote, setCompetitorLinks, addIdea, renameIdea, deleteIdea } = ideasApi;
  const { categories, weights } = criteriaApi;
  const { ideaId } = useParams();
  const navigate = useNavigate();

  const activeIdea = ideaId ? ideas.find((i) => i.id === ideaId) : undefined;

  // Gelöschte oder falsche Idee in der URL: zurück zur Übersicht.
  if (ideaId && !activeIdea) return <Navigate to="/ideen" replace />;

  return (
    <div className="flex flex-1 min-h-0">
      <IdeaSidebar
        ideas={ideas}
        activeId={activeIdea?.id ?? null}
        onSelect={(id) => navigate(`/ideen/${id}`)}
        onOverview={() => navigate("/ideen")}
        onAdd={addIdea}
        onRename={renameIdea}
        onDelete={deleteIdea}
      />

      {activeIdea ? (
        <>
          <ScoringView
            idea={activeIdea}
            weights={weights}
            categories={categories}
            onSetScore={(crId, val) => setScore(activeIdea.id, crId, val)}
            onSetStructuredNote={(field, value) => setStructuredNote(activeIdea.id, field, value)}
            onSetCompetitorLinks={(links) => setCompetitorLinks(activeIdea.id, links)}
          />
          <ScoreSidebar idea={activeIdea} weights={weights} categories={categories} />
        </>
      ) : (
        <OverviewView
          ideas={ideas}
          weights={weights}
          categories={categories}
          onSelectIdea={(id) => navigate(`/ideen/${id}`)}
        />
      )}
    </div>
  );
};

export default Ideas;
