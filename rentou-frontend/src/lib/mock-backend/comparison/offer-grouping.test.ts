import { describe, expect, it } from "vitest";
import type { OfferDto } from "@/lib/api/contracts";
import { DEFAULT_SELECTION } from "@/lib/catalog";
import { toMoney } from "../money";
import { groupEquivalentOffers } from "./offer-grouping";

function offer(id: string, providerId: string, totalCents: number, overrides: Partial<OfferDto> = {}): OfferDto {
  const zero = toMoney(0);
  return {
    id,
    providerId,
    vehicle: {
      category: "COMPACT", categoryLabel: "Compacto", bodyType: "HATCH", modelName: "Carro ou similar",
      transmission: "AUTOMATIC", airConditioning: true, passengers: 5, doors: 4, largeBags: 1, smallBags: 1,
    },
    mileage: { type: "FREE" },
    protection: { level: "BASIC", commercialName: "Básica", deductible: null, coverages: [] },
    thirdPartyProtection: null,
    price: {
      dailyRate: zero, rentalDays: 1, baseTotal: zero, discounts: [], extras: [], extrasTotal: zero,
      fees: [], feesTotal: zero, total: toMoney(totalCents),
    },
    selectedItems: [],
    comparable: true,
    comparabilityNotes: [],
    fuelPolicy: "",
    cancellationPolicy: null,
    bookingUrl: null,
    ...overrides,
  };
}

describe("groupEquivalentOffers", () => {
  it("elege a mais barata e calcula a economia em relação à segunda", () => {
    const [group] = groupEquivalentOffers([offer("a", "localiza", 50_000), offer("b", "movida", 45_000), offer("c", "unidas", 60_000)], DEFAULT_SELECTION);
    expect(group.result).toBe("WINNER");
    expect(group.bestOfferId).toBe("b");
    expect(group.savings).toEqual(toMoney(5_000));
    expect(group.offerIds).toEqual(["b", "a", "c"]);
  });

  it("não dá selo em caso de empate", () => {
    const [group] = groupEquivalentOffers([offer("a", "localiza", 50_000), offer("b", "movida", 50_000)], DEFAULT_SELECTION);
    expect(group.result).toBe("TIE");
    expect(group.bestOfferId).toBeNull();
  });

  it("não compara quando só há uma locadora no grupo", () => {
    const [group] = groupEquivalentOffers([offer("a", "localiza", 50_000)], DEFAULT_SELECTION);
    expect(group.result).toBe("NO_COMPARISON");
    expect(group.bestOfferId).toBeNull();
  });

  it("não compara km livre com km controlada", () => {
    const groups = groupEquivalentOffers(
      [offer("a", "localiza", 50_000), offer("b", "unidas", 30_000, { mileage: { type: "CONTROLLED", kmPerDay: 200 } })],
      DEFAULT_SELECTION,
    );
    expect(groups).toHaveLength(2);
    expect(groups.every((group) => group.result === "NO_COMPARISON")).toBe(true);
  });

  it("deixa ofertas não comparáveis fora dos grupos", () => {
    const groups = groupEquivalentOffers([offer("a", "localiza", 50_000), offer("b", "movida", 10_000, { comparable: false })], DEFAULT_SELECTION);
    expect(groups.flatMap((group) => group.offerIds)).toEqual(["a"]);
  });
});
