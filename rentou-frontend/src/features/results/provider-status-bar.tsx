import { CircleCheck, CircleSlash, Loader2, TriangleAlert } from "lucide-react";
import type { ProviderResultDto } from "@/lib/api/contracts";
import { ProviderLogo } from "./provider-logo";

/** Mostra o status de cada locadora: a busca pode ter resultado parcial. */
export function ProviderStatusBar({ providers, loading }: { providers?: ProviderResultDto[]; loading: boolean }) {
  if (loading && !providers) {
    return (
      <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600" role="status">
        <Loader2 className="size-4 animate-spin text-navy-600" aria-hidden />
        Consultando Localiza, Movida e Unidas…
      </div>
    );
  }
  if (!providers) return null;

  return (
    <ul className="flex flex-wrap gap-2">
      {providers.map((provider) => (
        <li key={provider.id} className="flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pl-1.5 pr-3 text-xs" title={provider.message}>
          <ProviderLogo provider={provider} size="sm" />
          {provider.status === "OK" ? (
            <CircleCheck className="size-4 text-saving-600" aria-label="Consultada" />
          ) : provider.status === "NOT_AVAILABLE_AT_LOCATION" ? (
            <span className="flex items-center gap-1 text-slate-500">
              <CircleSlash className="size-3.5" aria-hidden /> Não atende o local
            </span>
          ) : (
            <span className="flex items-center gap-1 text-amber-700">
              <TriangleAlert className="size-3.5" aria-hidden /> Indisponível agora
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}
