import type { RentalProvider } from "./rental-provider";
import { vehicle } from "./vehicles";

const FRIDAY = 5;
const SATURDAY = 6;
const SUNDAY = 0;
const WEEKEND_DAYS = new Set([FRIDAY, SATURDAY, SUNDAY]);

/**
 * Movida — DADOS FICTÍCIOS para demonstração.
 * Cenários em que vence: carros econômicos e compactos, e locações curtas
 * (até 3 diárias) retiradas no fim de semana.
 */
export const movidaProvider: RentalProvider = {
  info: { id: "movida", name: "Movida", accentColor: "#EA580C" },
  fuelPolicy: "Devolva com o mesmo nível de combustível da retirada.",
  cancellationPolicy: "Cancelamento gratuito até 48 horas antes da retirada; depois disso, multa de uma diária.",
  fees: { adminFeePercent: 10, oneWayFee: 29_000, youngDriverFeePerDay: 3_500, youngDriverMaxAge: 24 },

  products: [
    { sku: "MV-PC", commercialName: "Proteção do Carro", pricePerDay: 0, deductible: 500_000, coverages: ["Colisão", "Roubo e furto"] },
    { sku: "MV-PA", commercialName: "Proteção Ampliada", pricePerDay: 3_290, deductible: 250_000, coverages: ["Colisão", "Roubo e furto", "Franquia reduzida"] },
    { sku: "MV-PS", commercialName: "Proteção Super", pricePerDay: 4_990, deductible: 0, coverages: ["Colisão", "Roubo e furto", "Vidros, faróis e lanternas", "Pneus e rodas"] },
    { sku: "MV-PT", commercialName: "Terceiros Plus", pricePerDay: 2_290, coverages: ["Danos materiais a terceiros", "Danos corporais a terceiros"] },
    { sku: "MV-MA", commercialName: "Motorista Extra", pricePerDay: 1_990 },
    { sku: "MV-CI", commercialName: "Cadeirinha", pricePerDay: 2_190 },
    { sku: "MV-BC", commercialName: "Bebê Conforto", pricePerDay: 2_190 },
    { sku: "MV-AE", commercialName: "Booster", pricePerDay: 1_590 },
    { sku: "MV-NAV", commercialName: "Navegador GPS", pricePerDay: 1_290 },
    { sku: "MV-CONN", commercialName: "Pacote Conecta", pricePerDay: 1_490 },
  ],

  operatesAt: (locationId) => locationId !== "fen",

  findRates: () => [
    { rateCode: "MV-ECO", dailyRate: 11_290, mileage: { type: "FREE" }, includedProtectionSku: "MV-PC",
      vehicle: vehicle({ category: "ECONOMY", bodyType: "HATCH", model: "Renault Kwid", transmission: "MANUAL", largeBags: 1, smallBags: 1 }) },
    { rateCode: "MV-CMP", dailyRate: 15_490, mileage: { type: "FREE" }, includedProtectionSku: "MV-PC",
      vehicle: vehicle({ category: "COMPACT", bodyType: "HATCH", model: "Chevrolet Onix", transmission: "AUTOMATIC", largeBags: 1, smallBags: 2 }) },
    { rateCode: "MV-SED", dailyRate: 19_490, mileage: { type: "FREE" }, includedProtectionSku: "MV-PC",
      vehicle: vehicle({ category: "SEDAN", bodyType: "SEDAN", model: "Fiat Cronos", transmission: "AUTOMATIC", largeBags: 2, smallBags: 2 }) },
    { rateCode: "MV-SUV", dailyRate: 25_990, mileage: { type: "FREE" }, includedProtectionSku: "MV-PC",
      vehicle: vehicle({ category: "SUV", bodyType: "SUV", model: "Hyundai Creta", transmission: "AUTOMATIC", largeBags: 2, smallBags: 2 }) },
  ],

  discountsFor: (context) =>
    WEEKEND_DAYS.has(context.pickupAt.getDay()) && context.rentalDays <= 3
      ? [{ code: "WEEKEND", label: "Promoção fim de semana (12%)", percent: 12 }]
      : [],

  bookingUrl: () => "https://www.movida.com.br/",
};
