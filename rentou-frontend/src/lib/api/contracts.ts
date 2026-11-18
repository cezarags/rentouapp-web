/**
 * Contratos (DTOs) da API REST do Rentou.
 *
 * Estes tipos espelham o formato JSON que o backend Spring Boot vai expor em
 * /api/v1. O frontend depende APENAS destes contratos — nunca de detalhes de
 * implementação do backend ou do mock. Assim, trocar o mock pela API real não
 * exige mudanças nos componentes.
 *
 * Convenções:
 * - Dinheiro trafega como string decimal ("189.90") + moeda, evitando erros de
 *   ponto flutuante na serialização (0.1 + 0.2 !== 0.3).
 * - Datas trafegam em ISO-8601 local, sem fuso ("2026-12-20T10:00"),
 *   interpretadas no fuso America/Sao_Paulo.
 */

export type CurrencyCode = "BRL";

export interface Money {
  /** Valor decimal com duas casas, ex.: "189.90". */
  amount: string;
  currency: CurrencyCode;
}

/** Data/hora local em ISO-8601 sem fuso, ex.: "2026-12-20T10:00". */
export type LocalDateTime = string;

// ---------------------------------------------------------------------------
// Locais
// ---------------------------------------------------------------------------

export type LocationType = "AIRPORT" | "CITY";

export interface LocationDto {
  id: string;
  name: string;
  city: string;
  state: string;
  type: LocationType;
  iataCode?: string;
}

// ---------------------------------------------------------------------------
// Busca
// ---------------------------------------------------------------------------

export interface SearchRequest {
  pickupLocationId: string;
  dropoffLocationId: string;
  pickupAt: LocalDateTime;
  dropoffAt: LocalDateTime;
  driverAge: number;
}

export interface SearchCriteriaDto {
  pickupLocation: LocationDto;
  dropoffLocation: LocationDto;
  pickupAt: LocalDateTime;
  dropoffAt: LocalDateTime;
  driverAge: number;
  oneWay: boolean;
}

/**
 * Status de cada locadora na busca. Uma locadora pode falhar ou não operar no
 * local sem derrubar a busca inteira (resultado parcial).
 */
export type ProviderStatus = "OK" | "NOT_AVAILABLE_AT_LOCATION" | "ERROR" | "TIMEOUT";

export interface ProviderInfoDto {
  id: string;
  name: string;
  /** Cor de destaque usada apenas para identificação visual. */
  accentColor: string;
}

export interface ProviderResultDto extends ProviderInfoDto {
  status: ProviderStatus;
  message?: string;
}

// ---------------------------------------------------------------------------
// Catálogo normalizado (códigos canônicos do Rentou)
// ---------------------------------------------------------------------------

/** Níveis de proteção canônicos. Cada locadora mapeia seus produtos para eles. */
export type ProtectionLevel = "BASIC" | "INTERMEDIATE" | "FULL";

export type AddonCode =
  | "ADDITIONAL_DRIVER"
  | "CHILD_SEAT"
  | "INFANT_SEAT"
  | "BOOSTER_SEAT"
  | "GPS"
  | "WIFI";

export type MileagePreference = "OFFER_DEFAULT" | "FREE" | "CONTROLLED";

/** Personalização escolhida pelo usuário (Tela 3). */
export interface SelectionDto {
  protectionLevel: ProtectionLevel;
  thirdPartyProtection: boolean;
  addons: AddonCode[];
  mileage: MileagePreference;
}

/**
 * Resultado da normalização de um item para uma locadora.
 * - CONFIRMED: existe um produto equivalente, validado pela curadoria.
 * - PARTIAL: atende ao critério mínimo, mas com diferença relevante (ex.:
 *   franquia maior). Entra no preço e na comparação, com aviso.
 * - UNCONFIRMED: existe um produto parecido, mas a equivalência NÃO foi
 *   confirmada (ex.: coberturas diferentes). Não entra no preço nem na
 *   comparação.
 * - UNAVAILABLE: a locadora não oferece o item.
 */
export type EquivalenceStatus = "CONFIRMED" | "PARTIAL" | "UNCONFIRMED" | "UNAVAILABLE";

// ---------------------------------------------------------------------------
// Ofertas
// ---------------------------------------------------------------------------

export type VehicleCategory = "ECONOMY" | "COMPACT" | "SEDAN" | "SUV" | "MINIVAN";
export type BodyType = "HATCH" | "SEDAN" | "SUV" | "MINIVAN";
export type Transmission = "MANUAL" | "AUTOMATIC";

export interface VehicleDto {
  category: VehicleCategory;
  categoryLabel: string;
  bodyType: BodyType;
  /** Ex.: "Fiat Mobi ou similar". */
  modelName: string;
  transmission: Transmission;
  airConditioning: boolean;
  passengers: number;
  doors: number;
  largeBags: number;
  smallBags: number;
}

export type MileageType = "FREE" | "CONTROLLED";

export interface MileageDto {
  type: MileageType;
  /** Presente quando type = CONTROLLED. */
  kmPerDay?: number;
  /** Valor cobrado por km excedente, quando houver. */
  extraKmPrice?: Money;
}

export interface ProtectionDto {
  level: ProtectionLevel;
  /** Nome comercial do produto na locadora. */
  commercialName: string;
  /** Franquia (valor máximo pago pelo cliente em caso de sinistro). */
  deductible: Money | null;
  coverages: string[];
}

export type FeeCode = "ADMIN_FEE" | "ONE_WAY_FEE" | "YOUNG_DRIVER_FEE";

export interface PriceLineDto {
  code: string;
  label: string;
  amount: Money;
  /** Detalhe do cálculo, ex.: "R$ 24,90 × 5 diárias". */
  detail?: string;
}

export interface PriceBreakdownDto {
  dailyRate: Money;
  rentalDays: number;
  /** Diárias × valor da diária, já com descontos. */
  baseTotal: Money;
  discounts: PriceLineDto[];
  extras: PriceLineDto[];
  extrasTotal: Money;
  fees: PriceLineDto[];
  feesTotal: Money;
  total: Money;
}

/** Como cada item da personalização foi resolvido para esta oferta. */
export interface SelectedItemDto {
  code: string;
  label: string;
  status: EquivalenceStatus;
  commercialName?: string;
  note?: string;
  /** Preço do item; só é somado ao total quando status = CONFIRMED ou PARTIAL. */
  price?: Money;
}

export interface OfferDto {
  id: string;
  providerId: string;
  vehicle: VehicleDto;
  mileage: MileageDto;
  protection: ProtectionDto;
  thirdPartyProtection: ProtectionDto | null;
  price: PriceBreakdownDto;
  selectedItems: SelectedItemDto[];
  /**
   * Indica se a oferta pode participar da disputa de "Melhor oferta".
   * Falso quando algum item escolhido não tem equivalência confirmada.
   */
  comparable: boolean;
  /** Avisos de comparação: itens indisponíveis, não confirmados ou parciais. */
  comparabilityNotes: string[];
  fuelPolicy: string;
  /** null quando a locadora não informa a política. */
  cancellationPolicy: string | null;
  /** Endereço de reserva na locadora; null quando indisponível. */
  bookingUrl: string | null;
}

/**
 * Resultado da comparação de um grupo:
 * - WINNER: há uma oferta estritamente mais barata ("Melhor oferta").
 * - TIE: as duas mais baratas custam o mesmo; ninguém recebe o selo.
 * - NO_COMPARISON: só uma locadora no grupo; não há com o que comparar.
 */
export type GroupResult = "WINNER" | "TIE" | "NO_COMPARISON";

/**
 * Grupo de ofertas EQUIVALENTES (mesma categoria, câmbio, ar, quilometragem e
 * proteções). "Melhor oferta" só existe dentro de um grupo com 2+ locadoras.
 */
export interface OfferGroupDto {
  id: string;
  label: string;
  /** Ordenadas do menor para o maior preço total. */
  offerIds: string[];
  result: GroupResult;
  bestOfferId: string | null;
  /** Diferença entre a melhor oferta e a segunda mais barata do grupo. */
  savings: Money | null;
}

export interface SearchResultDto {
  searchId: string;
  /** Sempre true enquanto os preços forem simulados. */
  demo: boolean;
  criteria: SearchCriteriaDto;
  rentalDays: number;
  selection: SelectionDto;
  providers: ProviderResultDto[];
  offers: OfferDto[];
  /** Ofertas sem equivalência confirmada ficam fora de qualquer grupo. */
  groups: OfferGroupDto[];
}

export interface OfferDetailsDto {
  searchId: string;
  demo: boolean;
  criteria: SearchCriteriaDto;
  rentalDays: number;
  selection: SelectionDto;
  provider: ProviderInfoDto;
  offer: OfferDto;
  /** Grupo de equivalência da oferta, se houver. */
  group: OfferGroupDto | null;
  /** Outras ofertas do mesmo grupo, para mostrar a diferença entre locadoras. */
  equivalentOffers: Array<{ offerId: string; provider: ProviderInfoDto; total: Money }>;
}

// ---------------------------------------------------------------------------
// Erros — RFC 9457 (application/problem+json)
// ---------------------------------------------------------------------------

export interface FieldErrorDto {
  field: string;
  message: string;
}

export interface ProblemDetail {
  type: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  errors?: FieldErrorDto[];
}
