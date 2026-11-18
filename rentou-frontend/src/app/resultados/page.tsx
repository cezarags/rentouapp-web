import type { Metadata } from "next";
import { Suspense } from "react";
import { ResultsFallback, ResultsView } from "@/features/results/results-view";

export const metadata: Metadata = { title: "Resultados" };

export default function ResultsPage() {
  // useSearchParams exige um limite de Suspense para a renderização estática.
  return (
    <div className="flex-1 bg-slate-50/60">
      <Suspense fallback={<ResultsFallback />}>
        <ResultsView />
      </Suspense>
    </div>
  );
}
