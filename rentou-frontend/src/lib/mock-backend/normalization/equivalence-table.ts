import type { AddonCode, ProtectionLevel } from "@/lib/api/contracts";

/** Itens canônicos que podem ser normalizados entre locadoras. */
export type CanonicalItemCode =
  | `PROTECTION_${ProtectionLevel}`
  | "THIRD_PARTY_PROTECTION"
  | AddonCode
  | "MILEAGE_FREE_UPGRADE"
  | "MILEAGE_CONTROLLED";

export interface EquivalenceEntry {
  /** Código do produto no catálogo da locadora. */
  sku: string;
  status: "CONFIRMED" | "PARTIAL" | "UNCONFIRMED";
  /** Explicação exibida ao usuário quando a equivalência não é confirmada. */
  note?: string;
  /** Para km controlada: limite diário que o produto aplica. */
  kmPerDay?: number;
}

/**
 * Tabela de equivalências — o coração da normalização.
 *
 * Regra de ouro: NUNCA inferir equivalência pelo nome. "Proteção Premium" da
 * Unidas parece "completa", mas não cobre vidros e pneus — então fica como
 * UNCONFIRMED. Já a "Proteção Ampliada" da Movida cobre o mesmo, mas com franquia
 * maior: PARTIAL (compara, com aviso). Em produção, esta tabela seria mantida por uma curadoria humana
 * (ex.: tabela no PostgreSQL com data de revisão), lendo os termos de cada
 * locadora. Ausência de entrada = item indisponível na locadora.
 */
export const EQUIVALENCE_TABLE: Readonly<Record<string, Partial<Record<CanonicalItemCode, EquivalenceEntry>>>> = {
  localiza: {
    PROTECTION_BASIC: { sku: "LZ-PROT-ESS", status: "CONFIRMED" },
    PROTECTION_INTERMEDIATE: { sku: "LZ-PROT-PLUS", status: "CONFIRMED" },
    PROTECTION_FULL: { sku: "LZ-PROT-TOT", status: "CONFIRMED" },
    THIRD_PARTY_PROTECTION: { sku: "LZ-TERC", status: "CONFIRMED" },
    ADDITIONAL_DRIVER: { sku: "LZ-COND", status: "CONFIRMED" },
    CHILD_SEAT: { sku: "LZ-CAD", status: "CONFIRMED" },
    INFANT_SEAT: { sku: "LZ-BEBE", status: "CONFIRMED" },
    BOOSTER_SEAT: { sku: "LZ-ELEV", status: "CONFIRMED" },
    GPS: { sku: "LZ-GPS", status: "CONFIRMED" },
    WIFI: { sku: "LZ-WIFI", status: "CONFIRMED" },
    MILEAGE_CONTROLLED: { sku: "LZ-KM150", status: "CONFIRMED", kmPerDay: 150 },
  },
  movida: {
    PROTECTION_BASIC: { sku: "MV-PC", status: "CONFIRMED" },
    PROTECTION_INTERMEDIATE: {
      sku: "MV-PA",
      status: "PARTIAL",
      note: "Cobertura semelhante, mas com franquia maior (R$ 2.500,00).",
    },
    PROTECTION_FULL: { sku: "MV-PS", status: "CONFIRMED" },
    THIRD_PARTY_PROTECTION: { sku: "MV-PT", status: "CONFIRMED" },
    ADDITIONAL_DRIVER: { sku: "MV-MA", status: "CONFIRMED" },
    CHILD_SEAT: { sku: "MV-CI", status: "CONFIRMED" },
    INFANT_SEAT: { sku: "MV-BC", status: "CONFIRMED" },
    BOOSTER_SEAT: { sku: "MV-AE", status: "CONFIRMED" },
    GPS: { sku: "MV-NAV", status: "CONFIRMED" },
    WIFI: {
      sku: "MV-CONN",
      status: "UNCONFIRMED",
      note: "O \"Pacote Conecta\" é um pacote de dados para celular. Não confirmamos que inclui um roteador Wi-Fi no veículo.",
    },
  },
  unidas: {
    PROTECTION_BASIC: { sku: "UN-PB", status: "CONFIRMED" },
    PROTECTION_FULL: {
      sku: "UN-PP",
      status: "UNCONFIRMED",
      note: "A \"Proteção Premium\" tem franquia de R$ 1.000,00 e não cobre vidros, faróis e pneus. As coberturas são diferentes da proteção completa.",
    },
    THIRD_PARTY_PROTECTION: { sku: "UN-PT", status: "CONFIRMED" },
    ADDITIONAL_DRIVER: { sku: "UN-CA", status: "CONFIRMED" },
    CHILD_SEAT: { sku: "UN-CD", status: "CONFIRMED" },
    BOOSTER_SEAT: { sku: "UN-AE", status: "CONFIRMED" },
    MILEAGE_FREE_UPGRADE: { sku: "UN-KML", status: "CONFIRMED" },
  },
};
