"use client";

import { useAsync } from "@/hooks/use-async";
import type { SearchRequest, SearchResultDto, SelectionDto } from "@/lib/api/contracts";
import { getRentouApi } from "@/lib/api";
import { isDefaultSelection } from "@/lib/catalog";

export type SearchResultsState =
  | { status: "loading" }
  | { status: "error"; error: unknown; retry: () => void }
  | { status: "success"; data: SearchResultDto; recalculating: boolean; quoteError: unknown | null };

/**
 * Busca as ofertas e, se houver personalização, pede a cotação ao servidor.
 * O preço final é sempre calculado pela API (nunca no componente), para que
 * a regra de preço exista em um único lugar.
 */
export function useSearchResults(request: SearchRequest | null, selection: SelectionDto): SearchResultsState {
  const api = getRentouApi();
  const requestKey = JSON.stringify(request);
  const selectionKey = JSON.stringify(selection);

  const search = useAsync(request ? () => api.search(request) : null, [requestKey]);
  const searchId = search.status === "success" ? search.data.searchId : null;
  const needsQuote = searchId !== null && !isDefaultSelection(selection);

  const quote = useAsync(needsQuote ? () => api.quote(searchId, selection) : null, [searchId, selectionKey, needsQuote]);

  if (search.status === "error") return { status: "error", error: search.error, retry: search.retry };
  if (search.status === "loading" || !search.data) return { status: "loading" };

  if (!needsQuote) return { status: "success", data: search.data, recalculating: false, quoteError: null };

  // Enquanto a cotação recalcula, mostramos os últimos preços conhecidos com indicação visual.
  const data = quote.data ?? search.data;
  return {
    status: "success",
    data,
    recalculating: quote.status === "loading",
    quoteError: quote.status === "error" ? quote.error : null,
  };
}
