import type { EquivalenceStatus } from "@/lib/api/contracts";
import type { ProviderProduct, RentalProvider } from "../providers/rental-provider";
import { EQUIVALENCE_TABLE, type CanonicalItemCode } from "./equivalence-table";

export interface ResolvedItem {
  status: EquivalenceStatus;
  /** Produto da locadora; presente em CONFIRMED e UNCONFIRMED. */
  product?: ProviderProduct;
  note?: string;
  kmPerDay?: number;
}

/**
 * Traduz um item canônico do Rentou para o produto equivalente de uma locadora.
 * Função pura: mesma entrada, mesma saída — fácil de testar.
 */
export function resolveItem(provider: RentalProvider, code: CanonicalItemCode): ResolvedItem {
  const entry = EQUIVALENCE_TABLE[provider.info.id]?.[code];
  if (!entry) {
    return { status: "UNAVAILABLE", note: `Não oferecido pela ${provider.info.name}.` };
  }

  const product = provider.products.find((candidate) => candidate.sku === entry.sku);
  if (!product) {
    // Tabela aponta para um produto que a locadora não retornou: tratamos como indisponível.
    return { status: "UNAVAILABLE", note: `Não oferecido pela ${provider.info.name} nesta busca.` };
  }

  return { status: entry.status, product, note: entry.note, kmPerDay: entry.kmPerDay };
}
