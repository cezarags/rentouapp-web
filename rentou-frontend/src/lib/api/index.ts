import { HttpRentouApi } from "./http-rentou-api";
import { MockRentouApi } from "./mock-rentou-api";
import type { RentouApi } from "./rentou-api";

/**
 * Composition root da camada de dados: o único lugar que decide qual
 * implementação usar. Os componentes chamam `getRentouApi()` e não sabem se
 * os dados vêm do mock ou do backend Spring.
 */
let instance: RentouApi | null = null;

export function getRentouApi(): RentouApi {
  if (instance) return instance;
  const mode = process.env.NEXT_PUBLIC_RENTOU_API_MODE ?? "mock";
  instance =
    mode === "http"
      ? new HttpRentouApi(process.env.NEXT_PUBLIC_RENTOU_API_URL ?? "http://localhost:8080")
      : new MockRentouApi();
  return instance;
}

export type { RentouApi } from "./rentou-api";
export { ApiError, toFriendlyMessage } from "./api-error";
