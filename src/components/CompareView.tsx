import { useRef } from "react";
import { Category } from "@/data/criteria";
import { Idea } from "@/data/defaultIdeas";
import { CustomWeights } from "@/hooks/useCriteria";
import { CriteriaBreakdown } from "@/components/CriteriaBreakdown";
import html2canvas from "html2canvas";
import { Download, Trophy } from "lucide-react";

interface CompareViewProps {
  ideas: Idea[];
  weights: CustomWeights;
  categories: Category[];
  onSelectIdea: (id: string) => void;
}

export function CompareView({ ideas, weights, categories, onSelectIdea }: CompareViewProps) {
  const exportRef = useRef<HTMLDivElement>(null);

  const handleExport = async () => {
    if (!exportRef.current) return;
    const canvas = await html2canvas(exportRef.current, { backgroundColor: "#f5f6f8", scale: 2 });
    const link = document.createElement("a");
    link.download = "kriterien-vergleich.png";
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="flex-1 min-h-0 overflow-y-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          Vergleich
        </h1>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold shadow-monday hover:shadow-monday-md transition-all"
        >
          <Download size={16} />
          Export PNG
        </button>
      </div>

      <div ref={exportRef}>
        <CriteriaBreakdown
          ideas={ideas}
          weights={weights}
          categories={categories}
          onSelectIdea={onSelectIdea}
        />
      </div>
    </div>
  );
}
