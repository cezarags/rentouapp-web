import type { LocationDto } from "@/lib/api/contracts";

/** Locais fictícios para demonstração. */
export const LOCATIONS: readonly LocationDto[] = [
  { id: "gru", name: "Aeroporto de Guarulhos", city: "Guarulhos", state: "SP", type: "AIRPORT", iataCode: "GRU" },
  { id: "cgh", name: "Aeroporto de Congonhas", city: "São Paulo", state: "SP", type: "AIRPORT", iataCode: "CGH" },
  { id: "vcp", name: "Aeroporto de Viracopos", city: "Campinas", state: "SP", type: "AIRPORT", iataCode: "VCP" },
  { id: "sp-paulista", name: "Loja Av. Paulista", city: "São Paulo", state: "SP", type: "CITY" },
  { id: "gig", name: "Aeroporto do Galeão", city: "Rio de Janeiro", state: "RJ", type: "AIRPORT", iataCode: "GIG" },
  { id: "sdu", name: "Aeroporto Santos Dumont", city: "Rio de Janeiro", state: "RJ", type: "AIRPORT", iataCode: "SDU" },
  { id: "rj-barra", name: "Loja Barra da Tijuca", city: "Rio de Janeiro", state: "RJ", type: "CITY" },
  { id: "cnf", name: "Aeroporto de Confins", city: "Confins", state: "MG", type: "AIRPORT", iataCode: "CNF" },
  { id: "bh-savassi", name: "Loja Savassi", city: "Belo Horizonte", state: "MG", type: "CITY" },
  { id: "bsb", name: "Aeroporto de Brasília", city: "Brasília", state: "DF", type: "AIRPORT", iataCode: "BSB" },
  { id: "ssa", name: "Aeroporto de Salvador", city: "Salvador", state: "BA", type: "AIRPORT", iataCode: "SSA" },
  { id: "rec", name: "Aeroporto do Recife", city: "Recife", state: "PE", type: "AIRPORT", iataCode: "REC" },
  { id: "for", name: "Aeroporto de Fortaleza", city: "Fortaleza", state: "CE", type: "AIRPORT", iataCode: "FOR" },
  { id: "fln", name: "Aeroporto de Florianópolis", city: "Florianópolis", state: "SC", type: "AIRPORT", iataCode: "FLN" },
  { id: "poa", name: "Aeroporto de Porto Alegre", city: "Porto Alegre", state: "RS", type: "AIRPORT", iataCode: "POA" },
  { id: "cwb", name: "Aeroporto de Curitiba", city: "São José dos Pinhais", state: "PR", type: "AIRPORT", iataCode: "CWB" },
  { id: "fen", name: "Aeroporto de Fernando de Noronha", city: "Fernando de Noronha", state: "PE", type: "AIRPORT", iataCode: "FEN" },
];

function normalize(text: string): string {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export function findLocation(id: string): LocationDto | undefined {
  return LOCATIONS.find((location) => location.id === id);
}

export function searchLocations(query: string, limit = 8): LocationDto[] {
  const term = normalize(query.trim());
  if (!term) return LOCATIONS.slice(0, limit);
  return LOCATIONS.filter((location) =>
    normalize(`${location.name} ${location.city} ${location.state} ${location.iataCode ?? ""}`).includes(term),
  ).slice(0, limit);
}
