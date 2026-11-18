"use client";

import { ArrowLeft, Ban, Briefcase, Cog, DoorOpen, ExternalLink, Fuel, Gauge, ReceiptText, ShieldCheck, Snowflake, Trophy, Users } from "lucide-react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useMemo, type ReactNode } from "react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { VehicleIllustration } from "@/components/vehicle/vehicle-illustration";
import { useAsync } from "@/hooks/use-async";
import type { OfferDetailsDto, PriceLineDto, ProtectionDto } from "@/lib/api/contracts";
import { getRentouApi, toFriendlyMessage } from "@/lib/api";
import { protectionLabel, TRANSMISSION_LABELS } from "@/lib/catalog";
import { formatDateTime, formatMoney, pluralize } from "@/lib/format";
import { SelectedItemsList } from "@/features/results/equivalence-status";
import { toMoneyDifference } from "@/features/results/money-math";
import { mileageLabel } from "@/features/results/offer-card";
import { ProviderLogo } from "@/features/results/provider-logo";
import { ErrorState } from "@/features/results/results-states";
import { resultsUrl, parseSelection, writeSelection } from "@/features/search/search-params";

function DetailSection({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <section className="border-t border-slate-200 py-5 first:border-t-0 first:pt-0">
      <h2 className="mb-3 flex items-center gap-2 font-bold text-navy-900">
        <span className="text-navy-600">{icon}</span>
        {title}
      </h2>
      <div className="text-sm text-slate-700">{children}</div>
    </section>
  );
}

function ProtectionBlock({ protection, label }: { protection: ProtectionDto; label: string }) {
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-semibold text-slate-900">{protection.commercialName}</p>
        <Badge tone="navy">{label}</Badge>
      </div>
      <dl className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Franquia</dt>
          <dd className="mt-0.5 font-medium">{protection.deductible ? formatMoney(protection.deductible) : "Não se aplica"}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Coberturas</dt>
          <dd className="mt-0.5">
            <ul className="space-y-0.5">
              {protection.coverages.map((coverage) => (
                <li key={coverage}>• {coverage}</li>
              ))}
            </ul>
          </dd>
        </div>
      </dl>
    </div>
  );
}

function LineList({ lines }: { lines: PriceLineDto[] }) {
  return (
    <ul className="space-y-1.5">
      {lines.map((line) => (
        <li key={line.code} className="flex justify-between gap-3">
          <span>
            {line.label}
            {line.detail && <span className="block text-xs text-slate-500">{line.detail}</span>}
          </span>
          <span className="shrink-0 font-medium tabular-nums">{formatMoney(line.amount)}</span>
        </li>
      ))}
    </ul>
  );
}

function PriceSummary({ details }: { details: OfferDetailsDto }) {
  const { offer, group, provider } = details;
  const { price } = offer;
  const isBest = group?.result === "WINNER" && group.bestOfferId === offer.id;

  return (
    <Card className="overflow-hidden">
      {isBest && (
        <div className="flex items-center gap-2 bg-saving-600 px-5 py-2.5 text-sm font-semibold text-white">
          <Trophy className="size-4" aria-hidden /> Melhor oferta
        </div>
      )}
      <div className="space-y-4 p-5">
        <h2 className="font-bold text-navy-900">Resumo do preço</h2>
        <div className="space-y-2 text-sm text-slate-700">
          <div className="flex justify-between">
            <span>
              Preço original
              <span className="block text-xs text-slate-500">
                {formatMoney(price.dailyRate)} × {pluralize(price.rentalDays, "diária", "diárias")}
              </span>
            </span>
            <span className="font-medium tabular-nums">{formatMoney(price.baseTotal)}</span>
          </div>
          {price.discounts.length > 0 && (
            <ul className="space-y-1 text-xs text-saving-700">
              {price.discounts.map((discount) => (
                <li key={discount.code} className="flex justify-between">
                  <span>{discount.label}</span>
                  <span className="tabular-nums">{formatMoney(discount.amount)}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="flex justify-between">
            <span>Adicionais</span>
            <span className="font-medium tabular-nums">{formatMoney(price.extrasTotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Taxas</span>
            <span className="font-medium tabular-nums">{formatMoney(price.feesTotal)}</span>
          </div>
        </div>
        <div className="flex items-end justify-between border-t border-slate-200 pt-4">
          <span className="font-semibold text-slate-900">Preço final</span>
          <span className="text-3xl font-bold tabular-nums tracking-tight text-navy-900">{formatMoney(price.total)}</span>
        </div>
        {isBest && group?.savings && (
          <p className="rounded-lg bg-saving-50 px-3 py-2 text-sm font-semibold text-saving-700">Você economiza {formatMoney(group.savings)} nesta opção.</p>
        )}

        {details.equivalentOffers.length > 0 && (
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Diferença entre locadoras</p>
            <ul className="space-y-1.5 text-sm">
              {details.equivalentOffers.map((other) => {
                const difference = toMoneyDifference(other.total, price.total);
                const value = Number(difference.amount);
                return (
                  <li key={other.offerId} className="flex items-center justify-between gap-2">
                    <ProviderLogo provider={other.provider} size="sm" />
                    <span className="text-right">
                      <span className="block font-medium tabular-nums">{formatMoney(other.total)}</span>
                      <span className={value > 0 ? "text-xs text-saving-700" : value < 0 ? "text-xs text-red-600" : "text-xs text-slate-500"}>
                        {value === 0 ? "mesmo preço" : `${value > 0 ? "+" : "−"}${formatMoney({ ...difference, amount: Math.abs(value).toFixed(2) })}`}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {offer.bookingUrl ? (
          <LinkButton href={offer.bookingUrl} external variant="success" size="lg" fullWidth aria-label={`Continuar na ${provider.name} (abre em nova aba)`}>
            Continuar na locadora <ExternalLink className="size-4" aria-hidden />
          </LinkButton>
        ) : (
          <p className="rounded-xl bg-slate-100 px-4 py-3 text-center text-sm text-slate-600">A reserva online desta oferta não está disponível. Consulte a locadora.</p>
        )}
        <p className="text-xs text-slate-500">
          Você será levado ao site da {provider.name}. Valores demonstrativos: o preço e as condições finais são definidos pela locadora.
        </p>
      </div>
    </Card>
  );
}

function DetailsSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]" role="status" aria-label="Carregando oferta">
      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-14 w-full" />
      </div>
    </div>
  );
}

export function OfferDetailsView() {
  const { offerId } = useParams<{ offerId: string }>();
  const params = useSearchParams();
  const selection = useMemo(() => parseSelection(params), [params]);
  const decodedId = decodeURIComponent(offerId);
  const state = useAsync(() => getRentouApi().getOffer(decodedId, selection), [decodedId, JSON.stringify(selection)]);

  if (state.status === "error") {
    return <ErrorState message={toFriendlyMessage(state.error)} onRetry={state.retry} homeLink />;
  }
  if (state.status === "loading" || !state.data) return <DetailsSkeleton />;

  const details = state.data;
  const { offer, provider, criteria } = details;
  const { vehicle } = offer;
  const selectionQuery = writeSelection(new URLSearchParams(), selection).toString();
  const backHref =
    resultsUrl({
      pickupLocationId: criteria.pickupLocation.id,
      dropoffLocationId: criteria.dropoffLocation.id,
      pickupAt: criteria.pickupAt,
      dropoffAt: criteria.dropoffAt,
      driverAge: criteria.driverAge,
    }) + (selectionQuery ? `&${selectionQuery}` : "");

  return (
    <div className="space-y-5">
      <Link href={backHref} className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-700 hover:underline">
        <ArrowLeft className="size-4" aria-hidden /> Voltar aos resultados
      </Link>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_380px]">
        <Card className="p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <ProviderLogo provider={provider} />
              <h1 className="mt-3 text-2xl font-bold tracking-tight text-navy-900">{vehicle.modelName}</h1>
              <p className="text-sm text-slate-500">
                {vehicle.categoryLabel} · {criteria.pickupLocation.name} · {formatDateTime(criteria.pickupAt)} até {formatDateTime(criteria.dropoffAt)}
              </p>
            </div>
            <Badge tone="navy">{vehicle.categoryLabel}</Badge>
          </div>

          <div className="my-6 rounded-2xl bg-slate-50 px-10 py-6">
            <VehicleIllustration bodyType={vehicle.bodyType} accentColor={provider.accentColor} className="mx-auto max-w-sm" />
            <p className="mt-2 text-center text-xs text-slate-400">Imagem ilustrativa. O modelo pode variar dentro da categoria.</p>
          </div>

          {offer.comparabilityNotes.length > 0 && (
            <Alert tone="warning" className="mb-5">
              <ul className="space-y-1">
                {offer.comparabilityNotes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </Alert>
          )}

          <DetailSection icon={<Cog className="size-5" />} title="Veículo">
            <ul className="grid gap-2 sm:grid-cols-3">
              <li className="flex items-center gap-2"><Cog className="size-4 text-slate-400" aria-hidden /> {TRANSMISSION_LABELS[vehicle.transmission]}</li>
              <li className="flex items-center gap-2"><Users className="size-4 text-slate-400" aria-hidden /> {vehicle.passengers} passageiros</li>
              <li className="flex items-center gap-2"><DoorOpen className="size-4 text-slate-400" aria-hidden /> {vehicle.doors} portas</li>
              <li className="flex items-center gap-2"><Briefcase className="size-4 text-slate-400" aria-hidden /> {pluralize(vehicle.largeBags, "mala grande", "malas grandes")}, {pluralize(vehicle.smallBags, "pequena", "pequenas")}</li>
              <li className="flex items-center gap-2"><Snowflake className="size-4 text-slate-400" aria-hidden /> {vehicle.airConditioning ? "Ar-condicionado" : "Sem ar-condicionado"}</li>
            </ul>
          </DetailSection>

          <DetailSection icon={<ShieldCheck className="size-5" />} title="Proteções e coberturas">
            <div className="space-y-3">
              <ProtectionBlock protection={offer.protection} label={protectionLabel(offer.protection.level)} />
              {offer.thirdPartyProtection && <ProtectionBlock protection={offer.thirdPartyProtection} label="Proteção contra terceiros" />}
            </div>
          </DetailSection>

          {offer.selectedItems.length > 0 && (
            <DetailSection icon={<ReceiptText className="size-5" />} title="Sua personalização">
              <SelectedItemsList items={offer.selectedItems} detailed />
            </DetailSection>
          )}

          <DetailSection icon={<Gauge className="size-5" />} title="Quilometragem">
            {offer.mileage.type === "FREE" ? (
              <p>Quilometragem livre: rode quanto quiser, sem cobrança por km.</p>
            ) : (
              <p>
                Quilometragem controlada: {mileageLabel(offer.mileage)}
                {offer.mileage.extraKmPrice && <> · km excedente a {formatMoney(offer.mileage.extraKmPrice)}</>}.
              </p>
            )}
          </DetailSection>

          <DetailSection icon={<ReceiptText className="size-5" />} title="Taxas">
            {offer.price.fees.length > 0 ? <LineList lines={offer.price.fees} /> : <p>Sem taxas adicionais.</p>}
            {offer.price.extras.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Adicionais</p>
                <LineList lines={offer.price.extras} />
              </div>
            )}
          </DetailSection>

          <DetailSection icon={<Fuel className="size-5" />} title="Política de combustível">
            <p>{offer.fuelPolicy}</p>
          </DetailSection>

          <DetailSection icon={<Ban className="size-5" />} title="Regras de cancelamento">
            <p>{offer.cancellationPolicy ?? "A locadora não informou as regras de cancelamento para esta oferta. Confira no site da locadora antes de reservar."}</p>
          </DetailSection>
        </Card>

        <div className="lg:sticky lg:top-24">
          <PriceSummary details={details} />
        </div>
      </div>
    </div>
  );
}
