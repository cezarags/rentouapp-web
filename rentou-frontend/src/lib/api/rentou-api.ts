import type {
  LocationDto,
  OfferDetailsDto,
  SearchRequest,
  SearchResultDto,
  SelectionDto,
} from "./contracts";

/**
 * Porta de acesso aos dados do Rentou (Dependency Inversion).
 *
 * Os componentes dependem desta abstração, não de `fetch` nem do mock. Hoje
 * existem duas implementações:
 * - MockRentouApi: dados simulados, roda 100% no navegador.
 * - HttpRentouApi: chama o backend Spring Boot (/api/v1).
 */
export interface RentouApi {
  searchLocations(query: string): Promise<LocationDto[]>;
  getLocation(id: string): Promise<LocationDto | null>;
  search(request: SearchRequest): Promise<SearchResultDto>;
  quote(searchId: string, selection: SelectionDto): Promise<SearchResultDto>;
  getOffer(offerId: string, selection: SelectionDto): Promise<OfferDetailsDto>;
}
