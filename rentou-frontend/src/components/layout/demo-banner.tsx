import { FlaskConical } from "lucide-react";

/** Aviso permanente: enquanto não houver integrações reais, os preços são fictícios. */
export function DemoBanner() {
  return (
    <div className="bg-amber-50 text-amber-900 border-b border-amber-200">
      <p className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4 py-1.5 text-center text-xs font-medium sm:text-sm">
        <FlaskConical className="size-4 shrink-0" aria-hidden />
        <span>
          <strong>Modo demonstração:</strong> os preços exibidos são fictícios e não representam ofertas reais das locadoras.
        </span>
      </p>
    </div>
  );
}
