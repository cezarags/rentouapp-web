import type { LocationDto, MileageType, ProviderInfoDto, VehicleDto } from "@/lib/api/contracts";
import type { Cents } from "../money";

/** Tudo o que uma locadora precisa saber para cotar uma busca. */
export interface SearchContext {
  pickupLocation: LocationDto;
  dropoffLocation: LocationDto;
  pickupAt: Date;
  dropoffAt: Date;
  rentalDays: number;
  driverAge: number;
  oneWay: boolean;
}

/**
 * Produto no vocabulário DA LOCADORA (nome comercial, código interno).
 * Não sabemos, só pelo nome, se ele equivale a algo de outra locadora.
 */
export interface ProviderProduct {
  sku: string;
  commercialName: string;
  /** Preço por diária. Negativo = desconto (ex.: km controlada). */
  pricePerDay: Cents;
  deductible?: Cents | null;
  coverages?: string[];
}

export interface ProviderRate {
  /** Código do grupo de carros na própria locadora. */
  rateCode: string;
  vehicle: VehicleDto;
  dailyRate: Cents;
  mileage: { type: MileageType; kmPerDay?: number; extraKmPrice?: Cents };
  includedProtectionSku: string;
}

export interface ProviderDiscount {
  code: string;
  label: string;
  percent: number;
}

export interface ProviderFeePolicy {
  /** Taxa administrativa sobre diárias + adicionais. */
  adminFeePercent: number;
  oneWayFee: Cents;
  youngDriverFeePerDay: Cents;
  /** Condutores com idade ATÉ este valor pagam taxa de condutor jovem. */
  youngDriverMaxAge: number;
}

/**
 * Contrato que toda locadora implementa (padrão Strategy / Adapter).
 *
 * O motor de busca só conhece esta interface. Para adicionar uma nova
 * locadora, basta criar uma nova implementação e registrá-la — sem alterar o
 * motor (Open/Closed Principle). No backend Java, o equivalente é a interface
 * RentalProvider com LocalizaProvider, MovidaProvider e UnidasProvider.
 */
export interface RentalProvider {
  readonly info: ProviderInfoDto;
  readonly products: readonly ProviderProduct[];
  readonly fees: ProviderFeePolicy;
  readonly fuelPolicy: string;
  readonly cancellationPolicy: string | null;

  operatesAt(locationId: string): boolean;
  findRates(context: SearchContext): ProviderRate[];
  discountsFor(context: SearchContext, rate: ProviderRate): ProviderDiscount[];
  bookingUrl(context: SearchContext, rate: ProviderRate): string | null;
}
