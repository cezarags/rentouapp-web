import type { LocationDto, OfferDetailsDto, SearchRequest, SearchResultDto, SelectionDto } from "./contracts";
import type { RentouApi } from "./rentou-api";
import { DEFAULT_SELECTION } from "@/lib/catalog";
import { findLocation, searchLocations } from "@/lib/mock-backend/locations";
import { MockSearchEngine } from "@/lib/mock-backend/search-engine";

/** Simula a latência de rede para que loading e skeletons apareçam. */
function delay<T>(produce: () => T, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        resolve(produce());
      } catch (error) {
        reject(error);
      }
    }, ms);
  });
}

/**
 * Implementação da RentouApi com dados simulados.
 * Os preços são DEMONSTRATIVOS e não representam ofertas reais.
 */
export class MockRentouApi implements RentouApi {
  constructor(
    private readonly engine = new MockSearchEngine(),
    private readonly latencyMs = { search: 900, quote: 350, lookup: 120 },
  ) {}

  searchLocations(query: string): Promise<LocationDto[]> {
    return delay(() => searchLocations(query), this.latencyMs.lookup);
  }

  getLocation(id: string): Promise<LocationDto | null> {
    return delay(() => findLocation(id) ?? null, this.latencyMs.lookup);
  }

  search(request: SearchRequest): Promise<SearchResultDto> {
    return delay(() => this.engine.search(request, DEFAULT_SELECTION), this.latencyMs.search);
  }

  quote(searchId: string, selection: SelectionDto): Promise<SearchResultDto> {
    return delay(() => this.engine.quote(searchId, selection), this.latencyMs.quote);
  }

  getOffer(offerId: string, selection: SelectionDto): Promise<OfferDetailsDto> {
    return delay(() => this.engine.getOffer(offerId, selection), this.latencyMs.search);
  }
}
