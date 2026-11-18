import { ApiError } from "@/lib/api/api-error";
import type {
  FieldErrorDto,
  OfferDetailsDto,
  OfferDto,
  ProviderResultDto,
  SearchRequest,
  SearchResultDto,
  SelectionDto,
} from "@/lib/api/contracts";
import { calculateRentalDays, parseLocalDateTime } from "@/lib/rental-period";
import { validateDriverAge, validatePeriod } from "@/lib/search-rules";
import { groupEquivalentOffers } from "./comparison/offer-grouping";
import { findLocation } from "./locations";
import { priceOffer } from "./pricing/offer-pricing";
import { findProvider, PROVIDERS } from "./providers";
import type { RentalProvider, SearchContext } from "./providers/rental-provider";
import { decodeOfferId, decodeSearchId, encodeOfferId, encodeSearchId } from "./search-id";

/**
 * Motor de busca simulado: o mesmo fluxo que o backend Spring vai executar.
 * 1. valida a requisição; 2. consulta cada locadora; 3. precifica com a
 * personalização; 4. agrupa ofertas equivalentes e elege a melhor.
 */
export class MockSearchEngine {
  constructor(
    private readonly providers: readonly RentalProvider[] = PROVIDERS,
    private readonly clock: () => Date = () => new Date(),
  ) {}

  search(request: SearchRequest, selection: SelectionDto): SearchResultDto {
    const context = this.buildContext(request);
    const searchId = encodeSearchId(request);

    const providerResults: ProviderResultDto[] = [];
    const offers: OfferDto[] = [];

    for (const provider of this.providers) {
      // Cada locadora é isolada: se uma falhar, as outras continuam (resultado parcial).
      try {
        const operates = provider.operatesAt(context.pickupLocation.id) && provider.operatesAt(context.dropoffLocation.id);
        if (!operates) {
          providerResults.push({
            ...provider.info,
            status: "NOT_AVAILABLE_AT_LOCATION",
            message: `A ${provider.info.name} não atende este local.`,
          });
          continue;
        }
        for (const rate of provider.findRates(context)) {
          const offerId = encodeOfferId(searchId, provider.info.id, rate.rateCode);
          offers.push(priceOffer(offerId, provider, rate, context, selection));
        }
        providerResults.push({ ...provider.info, status: "OK" });
      } catch {
        providerResults.push({ ...provider.info, status: "ERROR", message: `Não foi possível consultar a ${provider.info.name}.` });
      }
    }

    return {
      searchId,
      demo: true,
      criteria: {
        pickupLocation: context.pickupLocation,
        dropoffLocation: context.dropoffLocation,
        pickupAt: request.pickupAt,
        dropoffAt: request.dropoffAt,
        driverAge: request.driverAge,
        oneWay: context.oneWay,
      },
      rentalDays: context.rentalDays,
      selection,
      providers: providerResults,
      offers,
      groups: groupEquivalentOffers(offers, selection),
    };
  }

  quote(searchId: string, selection: SelectionDto): SearchResultDto {
    return this.search(this.decodeSearch(searchId), selection);
  }

  getOffer(offerId: string, selection: SelectionDto): OfferDetailsDto {
    const parsed = decodeOfferId(offerId);
    if (!parsed) throw ApiError.notFound("Oferta não encontrada.");

    const result = this.quote(parsed.searchId, selection);
    const offer = result.offers.find((candidate) => candidate.id === offerId);
    const provider = findProvider(parsed.providerId);
    if (!offer || !provider) throw ApiError.notFound("Oferta não encontrada.");

    const group = result.groups.find((candidate) => candidate.offerIds.includes(offerId)) ?? null;
    const equivalentOffers = (group?.offerIds ?? [])
      .filter((id) => id !== offerId)
      .map((id) => result.offers.find((candidate) => candidate.id === id))
      .filter((candidate): candidate is OfferDto => candidate !== undefined)
      .map((candidate) => ({
        offerId: candidate.id,
        provider: findProvider(candidate.providerId)!.info,
        total: candidate.price.total,
      }));

    return {
      searchId: result.searchId,
      demo: result.demo,
      criteria: result.criteria,
      rentalDays: result.rentalDays,
      selection,
      provider: provider.info,
      offer,
      group,
      equivalentOffers,
    };
  }

  private decodeSearch(searchId: string): SearchRequest {
    const request = decodeSearchId(searchId);
    if (!request) throw ApiError.notFound("Busca não encontrada ou expirada.");
    return request;
  }

  private buildContext(request: SearchRequest): SearchContext {
    const errors: FieldErrorDto[] = [];
    const pickupLocation = findLocation(request.pickupLocationId);
    const dropoffLocation = findLocation(request.dropoffLocationId);
    const pickupAt = parseLocalDateTime(request.pickupAt);
    const dropoffAt = parseLocalDateTime(request.dropoffAt);

    if (!pickupLocation) errors.push({ field: "pickupLocationId", message: "Local de retirada inválido." });
    if (!dropoffLocation) errors.push({ field: "dropoffLocationId", message: "Local de devolução inválido." });
    if (!pickupAt) errors.push({ field: "pickupAt", message: "Data de retirada inválida." });
    if (!dropoffAt) errors.push({ field: "dropoffAt", message: "Data de devolução inválida." });
    if (pickupAt && dropoffAt) {
      const periodErrors = validatePeriod(pickupAt, dropoffAt, this.clock());
      if (periodErrors.pickupAt) errors.push({ field: "pickupAt", message: periodErrors.pickupAt });
      if (periodErrors.dropoffAt) errors.push({ field: "dropoffAt", message: periodErrors.dropoffAt });
    }
    const ageError = validateDriverAge(request.driverAge);
    if (ageError) errors.push({ field: "driverAge", message: ageError });

    if (errors.length > 0 || !pickupLocation || !dropoffLocation || !pickupAt || !dropoffAt) {
      throw ApiError.badRequest(errors[0]?.message ?? "Busca inválida.", errors);
    }

    return {
      pickupLocation,
      dropoffLocation,
      pickupAt,
      dropoffAt,
      rentalDays: calculateRentalDays(pickupAt, dropoffAt),
      driverAge: request.driverAge,
      oneWay: pickupLocation.id !== dropoffLocation.id,
    };
  }
}
