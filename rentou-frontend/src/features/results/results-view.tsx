"use client";

import { ArrowDownWideNarrow, Info, SlidersHorizontal, Sparkles } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState, type ReactNode } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import type { OfferDto, OfferGroupDto, ProviderInfoDto, SelectionDto } from "@/lib/api/contracts";
import { toFriendlyMessage } from "@/lib/api";
import { isDefaultSelection } from "@/lib/catalog";
import { CustomizationPanel } from "@/features/customization/customization-panel";
import { parseSearchRequest, parseSelection, writeSelection } from "@/features/search/search-params";
import { FiltersPanel } from "./filters-panel";
import { OfferCard } from "./offer-card";
import { OfferGroupSection } from "./offer-group-section";
import { buildFacets, countActiveFilters, EMPTY_FILTERS, matchesFilters, type OfferFilters } from "./offer-filters";
import { ProviderStatusBar } from "./provider-status-bar";
import { ResultsHeader } from "./results-header";
import { ErrorState, NoFilterMatchState, NoResultsState, ResultsSkeleton } from "./results-states";
import { useSearchResults } from "./use-search-results";

type SortOrder = "category" | "price";

function countSelectionItems(selection: SelectionDto): number {
  return (
    (selection.protectionLevel !== "BASIC" ? 1 : 0) +
    (selection.thirdPartyProtection ? 1 : 0) +
    selection.addons.length +
    (selection.mileage !== "OFFER_DEFAULT" ? 1 : 0)
  );
}

export function ResultsView() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const request = useMemo(() => parseSearchRequest(params), [params]);
  const selection = useMemo(() => parseSelection(params), [params]);
  const state = useSearchResults(request, selection);

  const [filters, setFilters] = useState<OfferFilters>(EMPTY_FILTERS);
  const [sortOrder, setSortOrder] = useState<SortOrder>("category");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [customizeOpen, setCustomizeOpen] = useState(false);

  const changeSelection = useCallback(
    (next: SelectionDto) => router.replace(`${pathname}?${writeSelection(new URLSearchParams(params.toString()), next)}`, { scroll: false }),
    [router, pathname, params],
  );
  const closeFilters = useCallback(() => setFiltersOpen(false), []);
  const closeCustomize = useCallback(() => setCustomizeOpen(false), []);

  if (!request) {
    return (
      <Container>
        <ErrorState message="Os dados da busca estão incompletos ou inválidos. Faça uma nova pesquisa." homeLink />
      </Container>
    );
  }

  if (state.status === "error") {
    return (
      <Container>
        <ErrorState message={toFriendlyMessage(state.error)} onRetry={state.retry} homeLink />
      </Container>
    );
  }

  const data = state.status === "success" ? state.data : undefined;
  const recalculating = state.status === "success" && state.recalculating;
  const providers = new Map<string, ProviderInfoDto>(data?.providers.map((provider) => [provider.id, provider]) ?? []);
  const offerById = new Map<string, OfferDto>(data?.offers.map((offer) => [offer.id, offer]) ?? []);
  const visibleOffers = data?.offers.filter((offer) => matchesFilters(offer, filters)) ?? [];
  const visibleIds = new Set(visibleOffers.map((offer) => offer.id));
  const facets = buildFacets(data?.offers ?? []);
  const activeFilters = countActiveFilters(filters);
  const selectionCount = countSelectionItems(selection);
  const selectionQuery = writeSelection(new URLSearchParams(), selection).toString();
  const detailsHref = (offer: OfferDto) => `/oferta/${encodeURIComponent(offer.id)}${selectionQuery ? `?${selectionQuery}` : ""}`;

  const groups: Array<{ group: OfferGroupDto; offers: OfferDto[] }> = (data?.groups ?? [])
    .map((group) => ({ group, offers: group.offerIds.filter((id) => visibleIds.has(id)).map((id) => offerById.get(id)!) }))
    .filter((entry) => entry.offers.length > 0);
  if (sortOrder === "price") {
    groups.sort((a, b) => Number(a.offers[0].price.total.amount) - Number(b.offers[0].price.total.amount));
  }
  const groupedIds = new Set(data?.groups.flatMap((group) => group.offerIds) ?? []);
  const ungrouped = visibleOffers.filter((offer) => !groupedIds.has(offer.id));
  const winners = data?.groups.filter((group) => group.result === "WINNER").length ?? 0;

  const filtersPanel = <FiltersPanel filters={filters} facets={facets} onChange={setFilters} />;

  return (
    <Container>
      {data ? <ResultsHeader criteria={data.criteria} rentalDays={data.rentalDays} /> : <HeaderPlaceholder />}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <ProviderStatusBar providers={data?.providers} loading={state.status === "loading"} />
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" className="lg:hidden" onClick={() => setFiltersOpen(true)} disabled={!data}>
            <SlidersHorizontal className="size-4" aria-hidden /> Filtros{activeFilters > 0 && ` (${activeFilters})`}
          </Button>
          <label className="flex h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 text-sm">
            <ArrowDownWideNarrow className="size-4 text-slate-400" aria-hidden />
            <span className="sr-only">Ordenar por</span>
            <select value={sortOrder} onChange={(event) => setSortOrder(event.target.value as SortOrder)} className="bg-transparent font-medium outline-none">
              <option value="category">Por categoria</option>
              <option value="price">Menor preço</option>
            </select>
          </label>
          <Button onClick={() => setCustomizeOpen(true)} disabled={!data}>
            <Sparkles className="size-4" aria-hidden /> Personalizar{selectionCount > 0 && ` (${selectionCount})`}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[250px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-5">{data ? filtersPanel : <ResultsSkeletonSidebar />}</div>
        </aside>

        <div className="min-w-0 space-y-8">
          {state.status === "loading" && <ResultsSkeleton />}

          {data && state.status === "success" && state.quoteError !== null && (
            <Alert tone="error">Não conseguimos atualizar os preços com a sua personalização. Os valores abaixo podem estar desatualizados.</Alert>
          )}

          {data && !isDefaultSelection(selection) && (
            <Alert tone="info">
              Preços com sua personalização. Itens sem equivalência confirmada não entram no preço e tiram a oferta da disputa de melhor oferta.
            </Alert>
          )}

          {data && data.offers.length === 0 && <NoResultsState />}
          {data && data.offers.length > 0 && visibleOffers.length === 0 && <NoFilterMatchState onClear={() => setFilters(EMPTY_FILTERS)} />}

          {data && visibleOffers.length > 0 && (
            <>
              <p className="text-sm text-slate-600">
                {visibleOffers.length} ofertas em {groups.length} {groups.length === 1 ? "grupo" : "grupos"} de carros equivalentes
                {winners > 0 && ` · ${winners} com melhor oferta identificada`}
              </p>
              {groups.map(({ group, offers }) => (
                <OfferGroupSection key={group.id} group={group} offers={offers} providers={providers} detailsHref={detailsHref} recalculating={recalculating} />
              ))}
              {ungrouped.length > 0 && (
                <section className="space-y-3" aria-label="Ofertas fora da comparação">
                  <div>
                    <h2 className="text-lg font-bold text-navy-900">Ofertas fora da comparação</h2>
                    <p className="flex items-start gap-1.5 text-sm text-slate-500">
                      <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
                      Algum item que você escolheu não tem equivalência confirmada nestas locadoras, então não as comparamos com as demais.
                    </p>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {ungrouped.map((offer) => (
                      <OfferCard
                        key={offer.id}
                        offer={offer}
                        provider={providers.get(offer.providerId)!}
                        group={null}
                        bestTotal={null}
                        detailsHref={detailsHref(offer)}
                        recalculating={recalculating}
                      />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </div>

      <Drawer open={filtersOpen} onClose={closeFilters} title="Filtros" side="left" footer={<Button fullWidth onClick={closeFilters}>Ver {visibleOffers.length} ofertas</Button>}>
        {filtersPanel}
      </Drawer>

      <Drawer
        open={customizeOpen}
        onClose={closeCustomize}
        title="Personalize sua locação"
        description="Proteções, adicionais e quilometragem"
        footer={
          <Button fullWidth variant="success" onClick={closeCustomize}>
            Ver preços atualizados
          </Button>
        }
      >
        <CustomizationPanel selection={selection} onChange={changeSelection} result={data} recalculating={recalculating} />
      </Drawer>
    </Container>
  );
}

function Container({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-full max-w-7xl space-y-5 px-4 py-6 sm:px-6 sm:py-8">{children}</div>;
}

function HeaderPlaceholder() {
  return <div className="h-[104px] animate-pulse rounded-2xl border border-slate-200 bg-slate-50" aria-hidden />;
}

function ResultsSkeletonSidebar() {
  return (
    <div className="space-y-3" aria-hidden>
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index} className="h-4 animate-pulse rounded bg-slate-100" />
      ))}
    </div>
  );
}

export function ResultsFallback() {
  return (
    <Container>
      <HeaderPlaceholder />
      <ResultsSkeleton />
    </Container>
  );
}

