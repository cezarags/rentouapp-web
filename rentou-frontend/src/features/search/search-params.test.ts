import { describe, expect, it } from "vitest";
import { DEFAULT_SELECTION } from "@/lib/catalog";
import type { SelectionDto } from "@/lib/api/contracts";
import { parseSearchRequest, parseSelection, searchRequestToParams, writeSelection } from "./search-params";

describe("search params", () => {
  it("faz ida e volta da busca pela URL", () => {
    const request = { pickupLocationId: "gru", dropoffLocationId: "vcp", pickupAt: "2026-12-01T10:00", dropoffAt: "2026-12-05T10:00", driverAge: 30 };
    expect(parseSearchRequest(searchRequestToParams(request))).toEqual(request);
  });

  it("retorna null para parâmetros incompletos", () => {
    expect(parseSearchRequest(new URLSearchParams("pickup=gru"))).toBeNull();
  });

  it("faz ida e volta da personalização e ignora códigos desconhecidos", () => {
    const selection: SelectionDto = { protectionLevel: "FULL", thirdPartyProtection: true, addons: ["GPS", "WIFI"], mileage: "FREE" };
    expect(parseSelection(writeSelection(new URLSearchParams(), selection))).toEqual(selection);
    expect(parseSelection(new URLSearchParams("protection=SUPER&addons=GPS,JETPACK"))).toEqual({ ...DEFAULT_SELECTION, addons: ["GPS"] });
  });

  it("não escreve nada na URL para a seleção padrão", () => {
    expect(writeSelection(new URLSearchParams(), DEFAULT_SELECTION).toString()).toBe("");
  });
});
