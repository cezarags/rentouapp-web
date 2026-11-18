import { Briefcase, Cog, ExternalLink, Gauge, Info, ShieldCheck, Snowflake, Trophy, Users } from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { VehicleIllustration } from "@/components/vehicle/vehicle-illustration";
import type { MileageDto, Money, OfferDto, OfferGroupDto, ProviderInfoDto } from "@/lib/api/contracts";
import { TRANSMISSION_LABELS } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { formatMoney, moneyToNumber } from "@/lib/format";
import { toMoneyDifference } from "./money-math";
import { ProviderLogo } from "./provider-logo";
import { SelectedItemsList } from "./equivalence-status";

export function mileageLabel(mileage: MileageDto): string {
  return mileage.type === "FREE" ? "Km livre" : `${mileage.kmPerDay} km/dia`;
}

function Spec({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <li className="flex items-center gap-1.5 text-sm text-slate-600">
      <span className="text-slate-400">{icon}</span>
      {children}
    </li>
  );
}

function PriceRow({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className={cn("flex justify-between gap-2 text-sm", muted ? "text-slate-500" : "text-slate-700")}>
      <span>{label}</span>
      <span className="font-medium tabular-nums">{value}</span>
    </div>
  );
}

interface OfferCardProps {
  offer: OfferDto;
  provider: ProviderInfoDto;
  group: OfferGroupDto | null;
  /** Preço total da melhor oferta do grupo, para mostrar a diferença. */
  bestTotal: Money | null;
  detailsHref: string;
  recalculating?: boolean;
}

export function OfferCard({ offer, provider, group, bestTotal, detailsHref, recalculating }: OfferCardProps) {
  const { vehicle, price } = offer;
  const isBest = group?.result === "WINNER" && group.bestOfferId === offer.id;
  const isTie = group?.result === "TIE" && moneyToNumber(price.total) === moneyToNumber(bestTotal ?? price.total);
  const difference = !isBest && bestTotal ? toMoneyDifference(price.total, bestTotal) : null;
  const hasFees = moneyToNumber(price.feesTotal) > 0;
  const hasExtras = price.extras.length > 0;

  return (
    <article
      aria-label={`${provider.name}: ${vehicle.categoryLabel}, ${formatMoney(price.total)}`}
      className={cn(
        "relative flex flex-col rounded-2xl border bg-white shadow-card transition",
        isBest ? "border-saving-500 ring-2 ring-saving-100" : "border-slate-200",
      )}
    >
      {isBest && (
        <div className="flex items-center gap-2 rounded-t-[15px] bg-saving-600 px-4 py-2 text-sm font-semibold text-white">
          <Trophy className="size-4" aria-hidden /> Melhor oferta
        </div>
      )}

      <div className="flex flex-1 flex-col gap-4 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <ProviderLogo provider={provider} />
          <Badge tone="navy">{vehicle.categoryLabel}</Badge>
        </div>

        <div className="rounded-xl bg-slate-50 px-6 py-3">
          <VehicleIllustration bodyType={vehicle.bodyType} accentColor={provider.accentColor} className="mx-auto max-w-48" />
        </div>

        <div>
          <h3 className="font-semibold text-slate-900">{vehicle.modelName}</h3>
          <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5">
            <Spec icon={<Cog className="size-4" />}>{TRANSMISSION_LABELS[vehicle.transmission]}</Spec>
            <Spec icon={<Users className="size-4" />}>{vehicle.passengers} passageiros</Spec>
            <Spec icon={<Briefcase className="size-4" />}>
              {vehicle.largeBags} {vehicle.largeBags === 1 ? "mala" : "malas"} + {vehicle.smallBags} {vehicle.smallBags === 1 ? "mochila" : "mochilas"}
            </Spec>
            <Spec icon={<Snowflake className="size-4" />}>{vehicle.airConditioning ? "Ar-condicionado" : "Sem ar"}</Spec>
            <Spec icon={<Gauge className="size-4" />}>{mileageLabel(offer.mileage)}</Spec>
            <Spec icon={<ShieldCheck className="size-4" />}>{offer.protection.commercialName}</Spec>
          </ul>
        </div>

        {offer.selectedItems.length > 0 && (
          <div className="rounded-xl border border-slate-200 p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Sua personalização</p>
            <SelectedItemsList items={offer.selectedItems} />
          </div>
        )}

        <div className={cn("mt-auto space-y-1.5 border-t border-slate-100 pt-4 transition-opacity", recalculating && "opacity-50")} aria-busy={recalculating}>
          <PriceRow label={`Diária${price.discounts.length > 0 ? " com desconto" : ""}`} value={formatMoney(price.dailyRate)} muted />
          <PriceRow label={`${price.rentalDays} ${price.rentalDays === 1 ? "diária" : "diárias"}`} value={formatMoney(price.baseTotal)} />
          {hasExtras && <PriceRow label="Adicionais" value={formatMoney(price.extrasTotal)} />}
          {hasFees && <PriceRow label="Taxas" value={formatMoney(price.feesTotal)} />}
          <div className="flex items-end justify-between gap-2 pt-1">
            <span className="text-sm font-semibold text-slate-900">Total</span>
            <span className="text-2xl font-bold tabular-nums tracking-tight text-navy-900">{formatMoney(price.total)}</span>
          </div>
          {price.discounts.map((discount) => (
            <p key={discount.code} className="text-xs font-medium text-saving-700">
              {discount.label} aplicado
            </p>
          ))}
          {isBest && group?.savings && (
            <p className="rounded-lg bg-saving-50 px-3 py-2 text-sm font-semibold text-saving-700">
              Você economiza {formatMoney(group.savings)} nesta opção.
            </p>
          )}
          {isTie && <p className="rounded-lg bg-navy-50 px-3 py-2 text-sm font-semibold text-navy-700">Mesmo preço de outra locadora.</p>}
          {difference && <p className="text-xs text-slate-500">+{formatMoney(difference)} em relação à melhor oferta</p>}
        </div>

        {offer.comparabilityNotes.length > 0 && (
          <ul className="space-y-1 rounded-xl bg-amber-50 p-3 text-xs text-amber-900">
            {offer.comparabilityNotes.map((note) => (
              <li key={note} className="flex gap-1.5">
                <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                {note}
              </li>
            ))}
          </ul>
        )}

        <div className="grid grid-cols-2 gap-2">
          <LinkButton href={detailsHref} variant="outline">
            Ver detalhes
          </LinkButton>
          {offer.bookingUrl ? (
            <LinkButton href={offer.bookingUrl} external variant={isBest ? "success" : "primary"} aria-label={`Ver oferta no site da ${provider.name} (abre em nova aba)`}>
              Ver oferta <ExternalLink className="size-4" aria-hidden />
            </LinkButton>
          ) : (
            <span className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-100 px-2 text-center text-xs font-medium text-slate-500">
              Reserva online indisponível
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
