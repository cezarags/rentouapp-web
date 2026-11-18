import type { SearchRequest } from "@/lib/api/contracts";

/**
 * No mock, o searchId é a própria busca codificada em base64url. Assim o mock
 * não precisa guardar estado e a página de detalhes funciona após um refresh.
 * O backend real vai gerar um id opaco e guardar a busca em cache — o
 * frontend não depende desse formato (o id é só uma string).
 */
const OFFER_ID_SEPARATOR = "~";

function toBase64Url(text: string): string {
  return btoa(text).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(encoded: string): string {
  const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
  return atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "="));
}

export function encodeSearchId(request: SearchRequest): string {
  const { pickupLocationId, dropoffLocationId, pickupAt, dropoffAt, driverAge } = request;
  return toBase64Url(JSON.stringify([pickupLocationId, dropoffLocationId, pickupAt, dropoffAt, driverAge]));
}

export function decodeSearchId(searchId: string): SearchRequest | null {
  try {
    const parsed: unknown = JSON.parse(fromBase64Url(searchId));
    if (!Array.isArray(parsed) || parsed.length !== 5) return null;
    const [pickupLocationId, dropoffLocationId, pickupAt, dropoffAt, driverAge] = parsed;
    if (typeof driverAge !== "number") return null;
    return { pickupLocationId, dropoffLocationId, pickupAt, dropoffAt, driverAge };
  } catch {
    return null;
  }
}

export function encodeOfferId(searchId: string, providerId: string, rateCode: string): string {
  return [searchId, providerId, rateCode].join(OFFER_ID_SEPARATOR);
}

export function decodeOfferId(offerId: string): { searchId: string; providerId: string; rateCode: string } | null {
  const parts = offerId.split(OFFER_ID_SEPARATOR);
  if (parts.length !== 3) return null;
  const [searchId, providerId, rateCode] = parts;
  return { searchId, providerId, rateCode };
}
