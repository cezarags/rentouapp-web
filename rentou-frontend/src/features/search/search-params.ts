import type { AddonCode, MileagePreference, ProtectionLevel, SearchRequest, SelectionDto } from "@/lib/api/contracts";
import { ADDONS, DEFAULT_SELECTION, MILEAGE_OPTIONS, PROTECTION_LEVELS } from "@/lib/catalog";
import { parseLocalDateTime } from "@/lib/rental-period";

/**
 * A URL é a fonte de verdade da busca: a página de resultados pode ser
 * recarregada, compartilhada e o botão "voltar" funciona.
 * Ex.: /resultados?pickup=gru&dropoff=gru&pickupAt=2026-12-20T10:00&dropoffAt=2026-12-27T10:00&age=30
 */

type ReadableParams = Pick<URLSearchParams, "get">;

export function searchRequestToParams(request: SearchRequest): URLSearchParams {
  return new URLSearchParams({
    pickup: request.pickupLocationId,
    dropoff: request.dropoffLocationId,
    pickupAt: request.pickupAt,
    dropoffAt: request.dropoffAt,
    age: String(request.driverAge),
  });
}

export function resultsUrl(request: SearchRequest): string {
  return `/resultados?${searchRequestToParams(request)}`;
}

/** Lê e valida o formato dos parâmetros. Regras de negócio ficam com a API. */
export function parseSearchRequest(params: ReadableParams): SearchRequest | null {
  const pickup = params.get("pickup");
  const dropoff = params.get("dropoff") ?? pickup;
  const pickupAt = params.get("pickupAt");
  const dropoffAt = params.get("dropoffAt");
  const age = Number(params.get("age"));

  if (!pickup || !dropoff || !pickupAt || !dropoffAt || !Number.isFinite(age)) return null;
  if (!parseLocalDateTime(pickupAt) || !parseLocalDateTime(dropoffAt)) return null;
  return { pickupLocationId: pickup, dropoffLocationId: dropoff, pickupAt, dropoffAt, driverAge: age };
}

// ---------------------------------------------------------------------------
// Personalização (também na URL, para que a tela de detalhes a receba)
// ---------------------------------------------------------------------------

const PROTECTION_CODES = new Set<string>(PROTECTION_LEVELS.map((entry) => entry.code));
const ADDON_CODES = new Set<string>(ADDONS.map((entry) => entry.code));
const MILEAGE_CODES = new Set<string>(MILEAGE_OPTIONS.map((entry) => entry.code));

export function parseSelection(params: ReadableParams): SelectionDto {
  const protection = params.get("protection");
  const mileage = params.get("km");
  const addons = (params.get("addons") ?? "").split(",").filter((code) => ADDON_CODES.has(code));
  return {
    protectionLevel: protection && PROTECTION_CODES.has(protection) ? (protection as ProtectionLevel) : DEFAULT_SELECTION.protectionLevel,
    thirdPartyProtection: params.get("thirdParty") === "1",
    addons: [...new Set(addons)] as AddonCode[],
    mileage: mileage && MILEAGE_CODES.has(mileage) ? (mileage as MileagePreference) : DEFAULT_SELECTION.mileage,
  };
}

/** Escreve só o que difere do padrão, para manter a URL curta. */
export function writeSelection(params: URLSearchParams, selection: SelectionDto): URLSearchParams {
  const next = new URLSearchParams(params);
  ["protection", "thirdParty", "addons", "km"].forEach((key) => next.delete(key));
  if (selection.protectionLevel !== DEFAULT_SELECTION.protectionLevel) next.set("protection", selection.protectionLevel);
  if (selection.thirdPartyProtection) next.set("thirdParty", "1");
  if (selection.addons.length > 0) next.set("addons", selection.addons.join(","));
  if (selection.mileage !== DEFAULT_SELECTION.mileage) next.set("km", selection.mileage);
  return next;
}
