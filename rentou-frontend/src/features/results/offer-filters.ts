import type { BodyType, OfferDto, Transmission, VehicleCategory } from "@/lib/api/contracts";
import { CATEGORY_ORDER } from "@/lib/catalog";

export interface OfferFilters {
  categories: VehicleCategory[];
  bodyTypes: BodyType[];
  transmission: Transmission | "ANY";
  airConditioningOnly: boolean;
  minPassengers: number;
}

export const EMPTY_FILTERS: OfferFilters = {
  categories: [],
  bodyTypes: [],
  transmission: "ANY",
  airConditioningOnly: false,
  minPassengers: 0,
};

/**
 * Filtragem no cliente: são poucas dezenas de ofertas, então filtrar
 * localmente é instantâneo e evita uma ida ao servidor a cada clique.
 */
export function matchesFilters(offer: OfferDto, filters: OfferFilters): boolean {
  const { vehicle } = offer;
  if (filters.categories.length > 0 && !filters.categories.includes(vehicle.category)) return false;
  if (filters.bodyTypes.length > 0 && !filters.bodyTypes.includes(vehicle.bodyType)) return false;
  if (filters.transmission !== "ANY" && vehicle.transmission !== filters.transmission) return false;
  if (filters.airConditioningOnly && !vehicle.airConditioning) return false;
  if (vehicle.passengers < filters.minPassengers) return false;
  return true;
}

export function countActiveFilters(filters: OfferFilters): number {
  return (
    filters.categories.length +
    filters.bodyTypes.length +
    (filters.transmission !== "ANY" ? 1 : 0) +
    (filters.airConditioningOnly ? 1 : 0) +
    (filters.minPassengers > 0 ? 1 : 0)
  );
}

export interface FilterFacets {
  categories: VehicleCategory[];
  bodyTypes: BodyType[];
  passengerOptions: number[];
}

/** Opções de filtro derivadas das ofertas existentes (nada de filtro que leva a zero resultados). */
export function buildFacets(offers: OfferDto[]): FilterFacets {
  const categories = new Set(offers.map((offer) => offer.vehicle.category));
  const bodyTypes = new Set(offers.map((offer) => offer.vehicle.bodyType));
  const passengers = new Set(offers.map((offer) => offer.vehicle.passengers));
  return {
    categories: CATEGORY_ORDER.filter((category) => categories.has(category)),
    bodyTypes: (["HATCH", "SEDAN", "SUV", "MINIVAN"] as const).filter((type) => bodyTypes.has(type)),
    passengerOptions: [...passengers].sort((a, b) => a - b),
  };
}
