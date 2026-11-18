import type { RentalProvider } from "./rental-provider";
import { vehicle } from "./vehicles";

/**
 * Localiza — DADOS FICTÍCIOS para demonstração.
 * Cenário em que vence: locações longas (7+ diárias) têm desconto semanal.
 */
export const localizaProvider: RentalProvider = {
  info: { id: "localiza", name: "Localiza", accentColor: "#059669" },
  fuelPolicy: "Retire com tanque cheio e devolva cheio. Combustível faltante é cobrado com taxa de serviço.",
  cancellationPolicy: "Cancelamento gratuito até 24 horas antes da retirada.",
  fees: { adminFeePercent: 12, oneWayFee: 35_000, youngDriverFeePerDay: 3_000, youngDriverMaxAge: 24 },

  products: [
    { sku: "LZ-PROT-ESS", commercialName: "Proteção Essencial", pricePerDay: 0, deductible: 450_000, coverages: ["Colisão", "Roubo e furto"] },
    { sku: "LZ-PROT-PLUS", commercialName: "Proteção Parcial Plus", pricePerDay: 2_990, deductible: 200_000, coverages: ["Colisão", "Roubo e furto", "Franquia reduzida"] },
    { sku: "LZ-PROT-TOT", commercialName: "Proteção Total", pricePerDay: 5_490, deductible: 0, coverages: ["Colisão", "Roubo e furto", "Vidros, faróis e lanternas", "Pneus e rodas"] },
    { sku: "LZ-TERC", commercialName: "Proteção a Terceiros", pricePerDay: 1_990, coverages: ["Danos materiais a terceiros", "Danos corporais a terceiros"] },
    { sku: "LZ-COND", commercialName: "Condutor Adicional", pricePerDay: 2_490 },
    { sku: "LZ-CAD", commercialName: "Cadeira de Criança", pricePerDay: 1_990 },
    { sku: "LZ-BEBE", commercialName: "Bebê Conforto", pricePerDay: 1_990 },
    { sku: "LZ-ELEV", commercialName: "Assento de Elevação", pricePerDay: 1_490 },
    { sku: "LZ-GPS", commercialName: "GPS Navegador", pricePerDay: 1_490 },
    { sku: "LZ-WIFI", commercialName: "Wi-Fi a Bordo", pricePerDay: 2_490 },
    { sku: "LZ-KM150", commercialName: "Plano Km 150", pricePerDay: -1_000 },
  ],

  operatesAt: (locationId) => locationId !== "fen",

  findRates: () => [
    { rateCode: "LZ-B", dailyRate: 11_990, mileage: { type: "FREE" }, includedProtectionSku: "LZ-PROT-ESS",
      vehicle: vehicle({ category: "ECONOMY", bodyType: "HATCH", model: "Fiat Mobi", transmission: "MANUAL", largeBags: 1, smallBags: 1 }) },
    { rateCode: "LZ-C", dailyRate: 15_990, mileage: { type: "FREE" }, includedProtectionSku: "LZ-PROT-ESS",
      vehicle: vehicle({ category: "COMPACT", bodyType: "HATCH", model: "Hyundai HB20", transmission: "AUTOMATIC", largeBags: 1, smallBags: 2 }) },
    { rateCode: "LZ-F", dailyRate: 18_990, mileage: { type: "FREE" }, includedProtectionSku: "LZ-PROT-ESS",
      vehicle: vehicle({ category: "SEDAN", bodyType: "SEDAN", model: "Volkswagen Virtus", transmission: "AUTOMATIC", largeBags: 2, smallBags: 2 }) },
    { rateCode: "LZ-G", dailyRate: 24_990, mileage: { type: "FREE" }, includedProtectionSku: "LZ-PROT-ESS",
      vehicle: vehicle({ category: "SUV", bodyType: "SUV", model: "Volkswagen T-Cross", transmission: "AUTOMATIC", largeBags: 2, smallBags: 2 }) },
    { rateCode: "LZ-M", dailyRate: 22_990, mileage: { type: "FREE" }, includedProtectionSku: "LZ-PROT-ESS",
      vehicle: vehicle({ category: "MINIVAN", bodyType: "MINIVAN", model: "Chevrolet Spin", transmission: "MANUAL", passengers: 7, largeBags: 2, smallBags: 2 }) },
  ],

  discountsFor: (context) =>
    context.rentalDays >= 7 ? [{ code: "WEEKLY", label: "Desconto semanal (15%)", percent: 15 }] : [],

  bookingUrl: () => "https://www.localiza.com/",
};
