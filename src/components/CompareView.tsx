import { useEffect, useRef, useState } from "react";
import { Category } from "@/data/criteria";
import { Idea } from "@/data/defaultIdeas";
import { CustomWeights } from "@/hooks/useCriteria";
import { CriteriaBreakdown } from "@/components/CriteriaBreakdown";
import { toCanvas } from "html-to-image";
import { jsPDF } from "jspdf";
import { Download, Trophy } from "lucide-react";

interface CompareViewProps {
  ideas: Idea[];
  weights: CustomWeights;
  categories: Category[];
  onSelectIdea: (id: string) => void;
}

/** Breite der Export-Kopie: Kriterien- und Gewichtsspalte plus eine Spalte je Idee. */
function exportWidth(ideaCount: number): number {
  return Math.max(1280, 256 + ideaCount * 104 + 48);
}

export function CompareView({ ideas, weights, categories, onSelectIdea }: CompareViewProps) {
  const exportRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  // Der Export rendert eine eigene, aufgeklappte Kopie ausserhalb des Sichtfelds –
  // deshalb erst nach deren Render abfotografieren.
  useEffect(() => {
    if (!exporting) return;
    let cancelled = false;

    (async () => {
      try {
        const node = exportRef.current;
        if (!node) return;

        await document.fonts.ready;

        // html-to-image rendert über ein SVG-foreignObject, also mit der Textengine des Browsers.
        // Rasterizer mit eigener Grundlinien-Rechnung (html2canvas) setzten Text mehrere Pixel zu tief.
        const canvas = await toCanvas(node, {
          backgroundColor: "#f5f6f8",
          pixelRatio: 2,
          width: node.scrollWidth,
          height: node.scrollHeight,
        });

        const pdf = new jsPDF({
          orientation: canvas.width >= canvas.height ? "landscape" : "portrait",
          unit: "px",
          format: [canvas.width / 2, canvas.height / 2],
          compress: true,
        });
        pdf.addImage(
          canvas.toDataURL("image/jpeg", 0.92),
          "JPEG",
          0,
          0,
          canvas.width / 2,
          canvas.height / 2
        );
        pdf.save("kriterien-vergleich.pdf");
      } finally {
        if (!cancelled) setExporting(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [exporting]);

  return (
    <div className="flex-1 min-h-0 overflow-y-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          Vergleich
        </h1>
        <button
          onClick={() => setExporting(true)}
          disabled={exporting}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold shadow-monday hover:shadow-monday-md transition-all disabled:opacity-60"
        >
          <Download size={16} />
          {exporting ? "Exportiere…" : "Export PDF"}
        </button>
      </div>

      <CriteriaBreakdown
        ideas={ideas}
        weights={weights}
        categories={categories}
        onSelectIdea={onSelectIdea}
      />

      {exporting && (
        // Die Positionierung sitzt bewusst auf dem Wrapper: html-to-image kopiert die Styles des
        // aufgenommenen Knotens in ein SVG – ein "fixed; left: -99999px" würde dort ins Leere rendern.
        <div aria-hidden className="fixed top-0 pointer-events-none" style={{ left: "-99999px" }}>
          <div
            ref={exportRef}
            className="p-6"
            style={{ width: exportWidth(ideas.length), backgroundColor: "#f5f6f8" }}
          >
            <CriteriaBreakdown
              ideas={ideas}
              weights={weights}
              categories={categories}
              onSelectIdea={onSelectIdea}
              exportMode
            />
          </div>
        </div>
      )}
    </div>
  );
}
