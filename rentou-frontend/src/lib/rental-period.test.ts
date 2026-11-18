import { describe, expect, it } from "vitest";
import { calculateRentalDays, parseLocalDateTime } from "./rental-period";

const at = (value: string) => parseLocalDateTime(value)!;

describe("calculateRentalDays", () => {
  it.each([
    ["2026-12-01T10:00", "2026-12-02T10:00", 1, "exatamente 24h"],
    ["2026-12-01T10:00", "2026-12-02T11:00", 1, "dentro da tolerância de 1h"],
    ["2026-12-01T10:00", "2026-12-02T11:01", 2, "1 minuto além da tolerância"],
    ["2026-12-01T10:00", "2026-12-01T14:00", 1, "menos de 24h conta 1 diária"],
    ["2026-12-01T10:00", "2026-12-08T10:00", 7, "uma semana"],
  ])("%s → %s = %i diária(s) (%s)", (pickup, dropoff, expected) => {
    expect(calculateRentalDays(at(pickup), at(dropoff))).toBe(expected);
  });

  it("retorna 0 quando a devolução não é depois da retirada", () => {
    expect(calculateRentalDays(at("2026-12-02T10:00"), at("2026-12-01T10:00"))).toBe(0);
  });
});

describe("parseLocalDateTime", () => {
  it("rejeita datas inexistentes", () => {
    expect(parseLocalDateTime("2026-02-31T10:00")).toBeNull();
  });
  it("rejeita formato inválido", () => {
    expect(parseLocalDateTime("31/12/2026 10:00")).toBeNull();
  });
});
