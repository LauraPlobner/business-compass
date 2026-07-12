import { Outlet, useOutletContext } from "react-router-dom";
import { MainNav } from "@/components/MainNav";
import { useCriteria } from "@/hooks/useCriteria";
import { useIdeas } from "@/hooks/useIdeas";

export interface AppData {
  ideasApi: ReturnType<typeof useIdeas>;
  criteriaApi: ReturnType<typeof useCriteria>;
}

/** Ideen und Kriterien werden einmal fürs ganze Layout geladen – der Tab-Wechsel lädt nichts nach. */
export function useAppData() {
  return useOutletContext<AppData>();
}

const AppLayout = () => {
  const ideasApi = useIdeas();
  const criteriaApi = useCriteria();
  const { loading, error } = ideasApi;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <header className="shrink-0 bg-card border-b border-border shadow-monday">
        <div className="flex items-stretch gap-6 px-6 h-[52px]">
          <div className="flex items-center shrink-0">
            <h1 className="text-lg font-bold text-foreground">Validiermaschine</h1>
          </div>
          <MainNav />
        </div>
      </header>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground text-sm animate-pulse">Lade Daten…</p>
        </div>
      ) : error ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-2">
            <p className="text-destructive font-semibold">Verbindungsfehler</p>
            <p className="text-muted-foreground text-sm font-mono">{error}</p>
          </div>
        </div>
      ) : (
        <Outlet context={{ ideasApi, criteriaApi } satisfies AppData} />
      )}
    </div>
  );
};

export default AppLayout;
