import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./pages/AppLayout";
import Ideas from "./pages/Ideas";
import Compare from "./pages/Compare";
import Criteria from "./pages/Criteria";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Navigate to="/ideen" replace />} />
            <Route path="/ideen" element={<Ideas />} />
            <Route path="/ideen/:ideaId" element={<Ideas />} />
            <Route path="/vergleich" element={<Compare />} />
            <Route path="/kriterien" element={<Criteria />} />
            {/* Alter Link auf die Einstellungen */}
            <Route path="/einstellungen" element={<Navigate to="/kriterien" replace />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
