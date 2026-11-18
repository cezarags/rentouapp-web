import { Scale } from "lucide-react";
import type { OfferDto, OfferGroupDto, ProviderInfoDto } from "@/lib/api/contracts";
import { formatMoney } from "@/lib/format";
import { toMoneyDifference } from "./money-math";
import { OfferCard } from "./offer-card";

interface OfferGroupSectionProps {
  group: OfferGroupDto;
  offers: OfferDto[];
  providers: Map<string, ProviderInfoDto>;
  detailsHref: (offer: OfferDto) => string;
  recalculating: boolean;
}

/** Uma seção por grupo de ofertas equivalentes: aqui a comparação é justa. */
export function OfferGroupSection({ group, offers, providers, detailsHref, recalculating }: OfferGroupSectionProps) {
  const cheapest = offers[0];
  const mostExpensive = offers[offers.length - 1];
  const spread = offers.length > 1 ? toMoneyDifference(mostExpensive.price.total, cheapest.price.total) : null;

  return (
    <section aria-label={group.label} className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-navy-900">{group.label}</h2>
          <p className="text-sm text-slate-500">
            {group.result === "NO_COMPARISON"
              ? "Só uma locadora oferece estas condições. Não há com o que comparar."
              : `${offers.length} locadoras com condições equivalentes`}
          </p>
        </div>
        {spread && Number(spread.amount) > 0 && (
          <p className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            <Scale className="size-3.5" aria-hidden /> Diferença entre locadoras: até {formatMoney(spread)}
          </p>
        )}
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {offers.map((offer) => (
          <OfferCard
            key={offer.id}
            offer={offer}
            provider={providers.get(offer.providerId)!}
            group={group}
            bestTotal={group.result === "NO_COMPARISON" ? null : cheapest.price.total}
            detailsHref={detailsHref(offer)}
            recalculating={recalculating}
          />
        ))}
      </div>
    </section>
  );
}
