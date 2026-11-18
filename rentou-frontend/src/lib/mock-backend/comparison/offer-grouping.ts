import type { OfferDto, OfferGroupDto, SelectionDto } from "@/lib/api/contracts";
import { CATEGORY_ORDER, TRANSMISSION_LABELS } from "@/lib/catalog";
import { type Cents, toMoney } from "../money";

function totalCents(offer: OfferDto): Cents {
  return Math.round(Number(offer.price.total.amount) * 100);
}

/**
 * Chave de equivalência: duas ofertas só competem entre si quando TODOS estes
 * atributos são iguais. Começamos estritos (menos selos, zero falsos
 * positivos); afrouxar a chave é uma decisão de produto, não técnica.
 */
export function equivalenceKey(offer: OfferDto, selection: SelectionDto): string {
  const { vehicle, mileage, protection } = offer;
  return [
    vehicle.category,
    vehicle.bodyType,
    vehicle.transmission,
    vehicle.airConditioning ? "AC" : "NO_AC",
    `${vehicle.passengers}P`,
    mileage.type === "FREE" ? "KM_FREE" : `KM_${mileage.kmPerDay ?? "?"}`,
    protection.level,
    selection.thirdPartyProtection ? "TP" : "NO_TP",
    [...selection.addons].sort().join("+") || "NO_ADDONS",
  ].join("|");
}

function groupLabel(offer: OfferDto): string {
  const { vehicle, mileage } = offer;
  const parts = [
    vehicle.categoryLabel,
    TRANSMISSION_LABELS[vehicle.transmission],
    vehicle.airConditioning ? "Com ar" : "Sem ar",
    `${vehicle.passengers} lugares`,
    mileage.type === "FREE" ? "Km livre" : `Km controlada (${mileage.kmPerDay} km/dia)`,
  ];
  return parts.join(" · ");
}

function buildGroup(key: string, offers: OfferDto[]): OfferGroupDto {
  const sorted = [...offers].sort((a, b) => totalCents(a) - totalCents(b));
  const base = { id: key, label: groupLabel(sorted[0]), offerIds: sorted.map((offer) => offer.id) };

  const distinctProviders = new Set(sorted.map((offer) => offer.providerId));
  if (distinctProviders.size < 2) {
    return { ...base, result: "NO_COMPARISON", bestOfferId: null, savings: null };
  }

  const [best, runnerUp] = sorted;
  if (totalCents(best) === totalCents(runnerUp)) {
    return { ...base, result: "TIE", bestOfferId: null, savings: null };
  }

  // Economia em relação à SEGUNDA melhor opção (e não à mais cara), para não inflar o número.
  return {
    ...base,
    result: "WINNER",
    bestOfferId: best.id,
    savings: toMoney(totalCents(runnerUp) - totalCents(best)),
  };
}

/**
 * Agrupa as ofertas comparáveis por chave de equivalência e elege a melhor de
 * cada grupo. Ofertas não comparáveis ficam de fora de qualquer grupo.
 */
export function groupEquivalentOffers(offers: OfferDto[], selection: SelectionDto): OfferGroupDto[] {
  const buckets = new Map<string, OfferDto[]>();
  for (const offer of offers) {
    if (!offer.comparable) continue;
    const key = equivalenceKey(offer, selection);
    buckets.set(key, [...(buckets.get(key) ?? []), offer]);
  }

  const offerById = new Map(offers.map((offer) => [offer.id, offer]));
  const categoryRank = (group: OfferGroupDto) =>
    CATEGORY_ORDER.indexOf(offerById.get(group.offerIds[0])!.vehicle.category);
  const cheapest = (group: OfferGroupDto) => totalCents(offerById.get(group.offerIds[0])!);
  // Dentro da mesma categoria, grupos com comparação aparecem antes dos isolados.
  const comparisonRank = (group: OfferGroupDto) => (group.result === "NO_COMPARISON" ? 1 : 0);

  return [...buckets.entries()]
    .map(([key, groupOffers]) => buildGroup(key, groupOffers))
    .sort((a, b) => categoryRank(a) - categoryRank(b) || comparisonRank(a) - comparisonRank(b) || cheapest(a) - cheapest(b));
}
