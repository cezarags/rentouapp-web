import { describe, expect, it } from "vitest";
import type { SearchRequest, SearchResultDto, SelectionDto } from "@/lib/api/contracts";
import { ApiError } from "@/lib/api/api-error";
import { DEFAULT_SELECTION } from "@/lib/catalog";
import { MockSearchEngine } from "./search-engine";

// Quarta-feira, 18/11/2026, 9h: relógio fixo para testes determinísticos.
const engine = new MockSearchEngine(undefined, () => new Date(2026, 10, 18, 9, 0));

function search(overrides: Partial<SearchRequest> = {}, selection: SelectionDto = DEFAULT_SELECTION): SearchResultDto {
  return engine.search(
    { pickupLocationId: "gru", dropoffLocationId: "gru", pickupAt: "2026-12-01T10:00", dropoffAt: "2026-12-04T10:00", driverAge: 30, ...overrides },
    selection,
  );
}

function winnerOf(result: SearchResultDto, category: string): string | undefined {
  const group = result.groups.find((candidate) => {
    const first = result.offers.find((offer) => offer.id === candidate.offerIds[0]);
    return first?.vehicle.category === category && first.mileage.type === "FREE";
  });
  return result.offers.find((offer) => offer.id === group?.bestOfferId)?.providerId;
}

describe("MockSearchEngine — cenários de demonstração", () => {
  it("Movida vence compactos em locação curta no meio da semana", () => {
    expect(winnerOf(search(), "COMPACT")).toBe("movida");
  });

  it("Unidas vence SUVs em locação curta no meio da semana", () => {
    expect(winnerOf(search(), "SUV")).toBe("unidas");
  });

  it("Localiza vence locações de 7+ diárias (desconto semanal)", () => {
    const result = search({ pickupAt: "2026-12-07T10:00", dropoffAt: "2026-12-14T10:00" });
    expect(result.rentalDays).toBe(7);
    expect(winnerOf(result, "SUV")).toBe("localiza");
  });

  it("cobra taxa de devolução apenas quando a loja de devolução é diferente", () => {
    const oneWay = search({ dropoffLocationId: "vcp" });
    expect(oneWay.criteria.oneWay).toBe(true);
    expect(oneWay.offers.every((offer) => offer.price.fees.some((fee) => fee.code === "ONE_WAY_FEE"))).toBe(true);
    expect(search().offers.some((offer) => offer.price.fees.some((fee) => fee.code === "ONE_WAY_FEE"))).toBe(false);
  });

  it("cobra taxa de condutor jovem até 24 anos", () => {
    expect(search({ driverAge: 24 }).offers[0].price.fees.some((fee) => fee.code === "YOUNG_DRIVER_FEE")).toBe(true);
    expect(search({ driverAge: 25 }).offers[0].price.fees.some((fee) => fee.code === "YOUNG_DRIVER_FEE")).toBe(false);
  });

  it("retorna resultado parcial quando uma locadora não atende o local", () => {
    const result = search({ pickupLocationId: "bh-savassi", dropoffLocationId: "bh-savassi" });
    expect(result.providers.find((provider) => provider.id === "unidas")?.status).toBe("NOT_AVAILABLE_AT_LOCATION");
    expect(result.offers.some((offer) => offer.providerId === "unidas")).toBe(false);
  });

  it("retorna lista vazia quando nenhuma locadora atende o local", () => {
    expect(search({ pickupLocationId: "fen", dropoffLocationId: "fen" }).offers).toHaveLength(0);
  });

  it("rejeita busca inválida com erros por campo", () => {
    expect(() => search({ dropoffAt: "2026-11-30T10:00" })).toThrow(ApiError);
  });
});

describe("MockSearchEngine — normalização", () => {
  it("nunca compara por nome: proteção completa da Unidas fica sem equivalência confirmada", () => {
    const result = search({}, { ...DEFAULT_SELECTION, protectionLevel: "FULL" });
    const unidas = result.offers.filter((offer) => offer.providerId === "unidas");
    expect(unidas.every((offer) => !offer.comparable)).toBe(true);
    expect(unidas[0].selectedItems[0]).toMatchObject({ status: "UNCONFIRMED", commercialName: "Proteção Premium" });
    // O item não confirmado NÃO entra no preço.
    expect(unidas[0].price.extras).toHaveLength(0);
  });

  it("equivalência parcial entra no preço e na comparação, com aviso", () => {
    const result = search({}, { ...DEFAULT_SELECTION, protectionLevel: "INTERMEDIATE" });
    const movida = result.offers.find((offer) => offer.providerId === "movida")!;
    expect(movida.comparable).toBe(true);
    expect(movida.selectedItems[0].status).toBe("PARTIAL");
    expect(movida.comparabilityNotes.join(" ")).toMatch(/franquia maior/);
    expect(movida.price.extras).toHaveLength(1);
  });

  it("item indisponível tira a oferta da comparação", () => {
    const result = search({}, { ...DEFAULT_SELECTION, addons: ["GPS"] });
    const unidas = result.offers.filter((offer) => offer.providerId === "unidas");
    expect(unidas.every((offer) => offer.selectedItems[0].status === "UNAVAILABLE" && !offer.comparable)).toBe(true);
  });

  it("recalcula o total com os adicionais confirmados", () => {
    const base = search().offers.find((offer) => offer.providerId === "localiza")!;
    const withDriver = search({}, { ...DEFAULT_SELECTION, addons: ["ADDITIONAL_DRIVER"] }).offers.find((offer) => offer.id === base.id)!;
    const cents = (amount: string) => Math.round(Number(amount) * 100);

    // R$ 24,90 × 3 diárias = R$ 74,70 de adicionais.
    expect(withDriver.price.extrasTotal.amount).toBe("74.70");
    // A taxa administrativa (12%) incide sobre diárias + adicionais.
    const adminFee = withDriver.price.fees.find((fee) => fee.code === "ADMIN_FEE")!;
    expect(cents(adminFee.amount.amount)).toBe(Math.round((cents(withDriver.price.baseTotal.amount) + 7_470) * 0.12));
    expect(cents(withDriver.price.total.amount)).toBe(
      cents(withDriver.price.baseTotal.amount) + cents(withDriver.price.extrasTotal.amount) + cents(withDriver.price.feesTotal.amount),
    );
  });
});
