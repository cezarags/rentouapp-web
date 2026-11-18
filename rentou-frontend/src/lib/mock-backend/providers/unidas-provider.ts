import type { RentalProvider } from "./rental-provider";
import { vehicle } from "./vehicles";

/**
 * Unidas — DADOS FICTÍCIOS para demonstração.
 * Cenários em que vence: sedans, SUVs e minivans em locações curtas e médias.
 * O econômico tem km controlada, por isso não é comparado com os de km livre.
 */
export const unidasProvider: RentalProvider = {
  info: { id: "unidas", name: "Unidas", accentColor: "#2563EB" },
  fuelPolicy: "Retire com tanque cheio e devolva cheio.",
  cancellationPolicy: null,
  fees: { adminFeePercent: 12, oneWayFee: 42_000, youngDriverFeePerDay: 2_500, youngDriverMaxAge: 24 },

  products: [
    { sku: "UN-PB", commercialName: "Proteção Básica", pricePerDay: 0, deductible: 400_000, coverages: ["Colisão", "Roubo e furto"] },
    { sku: "UN-PP", commercialName: "Proteção Premium", pricePerDay: 5_990, deductible: 100_000, coverages: ["Colisão", "Roubo e furto", "Franquia reduzida"] },
    { sku: "UN-PT", commercialName: "Proteção Terceiros", pricePerDay: 1_790, coverages: ["Danos materiais a terceiros", "Danos corporais a terceiros"] },
    { sku: "UN-CA", commercialName: "Condutor Adicional", pricePerDay: 2_290 },
    { sku: "UN-CD", commercialName: "Cadeirinha Infantil", pricePerDay: 1_890 },
    { sku: "UN-AE", commercialName: "Assento de Elevação", pricePerDay: 1_390 },
    { sku: "UN-KML", commercialName: "Km Livre", pricePerDay: 2_500 },
  ],

  operatesAt: (locationId) => locationId !== "fen" && locationId !== "bh-savassi",

  findRates: () => [
    { rateCode: "UN-A", dailyRate: 10_490, mileage: { type: "CONTROLLED", kmPerDay: 200, extraKmPrice: 90 }, includedProtectionSku: "UN-PB",
      vehicle: vehicle({ category: "ECONOMY", bodyType: "HATCH", model: "Fiat Mobi", transmission: "MANUAL", largeBags: 1, smallBags: 1 }) },
    { rateCode: "UN-B", dailyRate: 16_490, mileage: { type: "FREE" }, includedProtectionSku: "UN-PB",
      vehicle: vehicle({ category: "COMPACT", bodyType: "HATCH", model: "Volkswagen Polo", transmission: "AUTOMATIC", largeBags: 1, smallBags: 2 }) },
    { rateCode: "UN-C", dailyRate: 18_490, mileage: { type: "FREE" }, includedProtectionSku: "UN-PB",
      vehicle: vehicle({ category: "SEDAN", bodyType: "SEDAN", model: "Chevrolet Onix Plus", transmission: "AUTOMATIC", largeBags: 2, smallBags: 2 }) },
    { rateCode: "UN-D", dailyRate: 23_490, mileage: { type: "FREE" }, includedProtectionSku: "UN-PB",
      vehicle: vehicle({ category: "SUV", bodyType: "SUV", model: "Jeep Renegade", transmission: "AUTOMATIC", largeBags: 2, smallBags: 2 }) },
    { rateCode: "UN-E", dailyRate: 21_990, mileage: { type: "FREE" }, includedProtectionSku: "UN-PB",
      vehicle: vehicle({ category: "MINIVAN", bodyType: "MINIVAN", model: "Chevrolet Spin", transmission: "MANUAL", passengers: 7, largeBags: 2, smallBags: 2 }) },
  ],

  discountsFor: () => [],

  // A reserva online da minivan não está disponível: o botão "Ver oferta" fica desabilitado.
  bookingUrl: (_context, rate) => (rate.rateCode === "UN-E" ? null : "https://www.unidas.com.br/"),
};
