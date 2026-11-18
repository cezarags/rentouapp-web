import { ApiError } from "./api-error";
import type {
  LocationDto,
  OfferDetailsDto,
  ProblemDetail,
  SearchRequest,
  SearchResultDto,
  SelectionDto,
} from "./contracts";
import type { RentouApi } from "./rentou-api";

/**
 * Implementação HTTP da RentouApi, pronta para o backend Spring Boot.
 * Ative com NEXT_PUBLIC_RENTOU_API_MODE=http e NEXT_PUBLIC_RENTOU_API_URL.
 */
export class HttpRentouApi implements RentouApi {
  constructor(private readonly baseUrl: string) {}

  searchLocations(query: string): Promise<LocationDto[]> {
    return this.request(`/api/v1/locations?q=${encodeURIComponent(query)}`);
  }

  async getLocation(id: string): Promise<LocationDto | null> {
    try {
      return await this.request<LocationDto>(`/api/v1/locations/${encodeURIComponent(id)}`);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) return null;
      throw error;
    }
  }

  search(request: SearchRequest): Promise<SearchResultDto> {
    return this.request("/api/v1/searches", { method: "POST", body: JSON.stringify(request) });
  }

  quote(searchId: string, selection: SelectionDto): Promise<SearchResultDto> {
    return this.request(`/api/v1/searches/${encodeURIComponent(searchId)}/quotes`, {
      method: "POST",
      body: JSON.stringify(selection),
    });
  }

  getOffer(offerId: string, selection: SelectionDto): Promise<OfferDetailsDto> {
    const params = new URLSearchParams({
      protectionLevel: selection.protectionLevel,
      thirdPartyProtection: String(selection.thirdPartyProtection),
      mileage: selection.mileage,
    });
    selection.addons.forEach((addon) => params.append("addons", addon));
    return this.request(`/api/v1/offers/${encodeURIComponent(offerId)}?${params}`);
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}${path}`, {
        ...init,
        headers: { "Content-Type": "application/json", Accept: "application/json", ...init?.headers },
      });
    } catch {
      throw ApiError.network();
    }

    if (!response.ok) {
      throw new ApiError(await this.readProblem(response));
    }
    return (await response.json()) as T;
  }

  private async readProblem(response: Response): Promise<ProblemDetail> {
    try {
      return (await response.json()) as ProblemDetail;
    } catch {
      return { type: "about:blank", title: response.statusText || "Erro", status: response.status };
    }
  }
}
