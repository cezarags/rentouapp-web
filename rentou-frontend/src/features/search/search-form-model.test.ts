import { describe, expect, it } from "vitest";
import type { LocationDto } from "@/lib/api/contracts";
import { toSearchRequest, validateSearchForm, type SearchFormValues } from "./search-form-model";

const NOW = new Date(2026, 10, 18, 9, 0);
const GRU: LocationDto = { id: "gru", name: "Aeroporto de Guarulhos", city: "Guarulhos", state: "SP", type: "AIRPORT", iataCode: "GRU" };
const VCP: LocationDto = { id: "vcp", name: "Aeroporto de Viracopos", city: "Campinas", state: "SP", type: "AIRPORT", iataCode: "VCP" };

const valid: SearchFormValues = {
  pickupLocation: GRU,
  dropoffLocation: null,
  differentDropoff: false,
  pickupDate: "2026-11-20",
  pickupTime: "10:00",
  dropoffDate: "2026-11-23",
  dropoffTime: "10:00",
  driverAge: "30",
};

describe("validateSearchForm", () => {
  it("aceita um formulário válido", () => {
    expect(validateSearchForm(valid, NOW)).toEqual({});
  });

  it("exige local de retirada", () => {
    expect(validateSearchForm({ ...valid, pickupLocation: null }, NOW).pickupLocation).toBeDefined();
  });

  it("exige loja de devolução diferente quando o checkbox está marcado", () => {
    expect(validateSearchForm({ ...valid, differentDropoff: true }, NOW).dropoffLocation).toMatch(/Selecione/);
    expect(validateSearchForm({ ...valid, differentDropoff: true, dropoffLocation: GRU }, NOW).dropoffLocation).toMatch(/diferente/);
  });

  it("recusa retirada no passado ou com menos de 1h de antecedência", () => {
    expect(validateSearchForm({ ...valid, pickupDate: "2026-11-18", pickupTime: "09:30" }, NOW).pickupDate).toMatch(/antecedência/);
  });

  it("recusa devolução antes da retirada", () => {
    expect(validateSearchForm({ ...valid, dropoffDate: "2026-11-19" }, NOW).dropoffDate).toMatch(/depois da retirada/);
  });

  it("recusa período acima de 60 dias", () => {
    expect(validateSearchForm({ ...valid, dropoffDate: "2027-02-01" }, NOW).dropoffDate).toMatch(/60 dias/);
  });

  it.each(["17", "100", "25.5", ""])("recusa idade inválida: %s", (age) => {
    expect(validateSearchForm({ ...valid, driverAge: age }, NOW).driverAge).toBeDefined();
  });
});

describe("toSearchRequest", () => {
  it("usa a loja de retirada como devolução quando o checkbox não está marcado", () => {
    expect(toSearchRequest({ ...valid, dropoffLocation: VCP }).dropoffLocationId).toBe("gru");
  });
  it("usa a loja de devolução quando o checkbox está marcado", () => {
    expect(toSearchRequest({ ...valid, differentDropoff: true, dropoffLocation: VCP }).dropoffLocationId).toBe("vcp");
  });
});
