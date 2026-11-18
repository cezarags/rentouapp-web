import type {
  AddonCode,
  BodyType,
  MileagePreference,
  ProtectionLevel,
  SelectionDto,
  Transmission,
  VehicleCategory,
} from "@/lib/api/contracts";

/**
 * Vocabulário canônico do Rentou: os nomes "neutros" que o usuário vê na
 * personalização. Cada locadora tem nomes comerciais próprios, que são
 * mapeados para estes códigos pela camada de normalização.
 */

export interface CatalogEntry<TCode extends string> {
  code: TCode;
  label: string;
  description: string;
}

export const PROTECTION_LEVELS: readonly CatalogEntry<ProtectionLevel>[] = [
  { code: "BASIC", label: "Proteção básica", description: "Cobre roubo, furto e colisão com franquia. Já incluída na diária." },
  { code: "INTERMEDIATE", label: "Proteção intermediária", description: "Franquia reduzida em caso de colisão, roubo ou furto." },
  { code: "FULL", label: "Proteção completa", description: "Franquia zero ou mínima, incluindo vidros, faróis e pneus." },
];

export const THIRD_PARTY_PROTECTION: CatalogEntry<"THIRD_PARTY_PROTECTION"> = {
  code: "THIRD_PARTY_PROTECTION",
  label: "Proteção contra terceiros",
  description: "Cobre danos materiais e corporais causados a terceiros.",
};

export const ADDONS: readonly CatalogEntry<AddonCode>[] = [
  { code: "ADDITIONAL_DRIVER", label: "Motorista adicional", description: "Mais uma pessoa habilitada para dirigir." },
  { code: "CHILD_SEAT", label: "Cadeirinha infantil", description: "Para crianças de 1 a 4 anos." },
  { code: "INFANT_SEAT", label: "Bebê conforto", description: "Para bebês de até 13 kg." },
  { code: "BOOSTER_SEAT", label: "Assento de elevação", description: "Para crianças de 4 a 10 anos." },
  { code: "GPS", label: "GPS", description: "Navegador portátil." },
  { code: "WIFI", label: "Wi-Fi", description: "Internet móvel no veículo, quando disponível." },
];

export const MILEAGE_OPTIONS: readonly CatalogEntry<MileagePreference>[] = [
  { code: "OFFER_DEFAULT", label: "Padrão da oferta", description: "Mantém a quilometragem de cada locadora." },
  { code: "FREE", label: "Quilometragem livre", description: "Rode quanto quiser, sem cobrança por km." },
  { code: "CONTROLLED", label: "Quilometragem controlada", description: "Limite diário de km, geralmente mais barato." },
];

export const CATEGORY_LABELS: Record<VehicleCategory, string> = {
  ECONOMY: "Econômico",
  COMPACT: "Compacto",
  SEDAN: "Sedan",
  SUV: "SUV",
  MINIVAN: "Minivan",
};

export const CATEGORY_ORDER: readonly VehicleCategory[] = ["ECONOMY", "COMPACT", "SEDAN", "SUV", "MINIVAN"];

export const BODY_TYPE_LABELS: Record<BodyType, string> = {
  HATCH: "Hatch",
  SEDAN: "Sedan",
  SUV: "SUV",
  MINIVAN: "Minivan",
};

export const TRANSMISSION_LABELS: Record<Transmission, string> = {
  MANUAL: "Manual",
  AUTOMATIC: "Automático",
};

export const DEFAULT_SELECTION: SelectionDto = {
  protectionLevel: "BASIC",
  thirdPartyProtection: false,
  addons: [],
  mileage: "OFFER_DEFAULT",
};

export function isDefaultSelection(selection: SelectionDto): boolean {
  return (
    selection.protectionLevel === DEFAULT_SELECTION.protectionLevel &&
    selection.thirdPartyProtection === DEFAULT_SELECTION.thirdPartyProtection &&
    selection.addons.length === 0 &&
    selection.mileage === DEFAULT_SELECTION.mileage
  );
}

export function addonLabel(code: AddonCode): string {
  return ADDONS.find((addon) => addon.code === code)?.label ?? code;
}

export function protectionLabel(level: ProtectionLevel): string {
  return PROTECTION_LEVELS.find((entry) => entry.code === level)?.label ?? level;
}
