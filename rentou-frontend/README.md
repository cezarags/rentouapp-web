# rentou-frontend

Frontend do **Rentou App** — comparação de preços de aluguel de carros (Localiza, Movida e Unidas).

> ⚠️ Versão de demonstração: todos os preços são **fictícios** e gerados localmente.

## Como rodar

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # testes unitários (Vitest)
npm run lint
npm run build
```

## Telas

| Rota | Tela |
|---|---|
| `/` | Home com formulário de busca validado e cenários de demonstração |
| `/resultados?pickup=gru&dropoff=gru&pickupAt=...&dropoffAt=...&age=30` | Resultados, filtros, "Melhor oferta" e painel de personalização |
| `/oferta/[offerId]` | Detalhes completos da oferta e botão "Continuar na locadora" |

## Arquitetura em uma página

```
src/
├── app/                 # rotas (App Router) — só montam as telas
├── components/          # UI genérica (ui/), layout e ilustrações
├── features/            # uma pasta por funcionalidade: search, results, customization, offer-details
├── hooks/               # useAsync (com proteção contra condição de corrida), useDebouncedValue
└── lib/
    ├── api/             # contratos (DTOs), interface RentouApi, implementações Mock e HTTP
    ├── mock-backend/    # "backend de mentira": locadoras, normalização, preços, agrupamento
    ├── catalog.ts       # vocabulário canônico (proteções, adicionais)
    └── format.ts        # R$ e datas no padrão brasileiro
```

- **Componentes dependem de `RentouApi`**, nunca de `fetch` ou do mock (Inversão de Dependência).
- **Trocar para o backend Spring:** `NEXT_PUBLIC_RENTOU_API_MODE=http` e `NEXT_PUBLIC_RENTOU_API_URL=http://localhost:8080`.
- **O preço é calculado pela API**, inclusive na personalização (`quote`). O frontend só exibe.
- **Normalização:** `lib/mock-backend/normalization/equivalence-table.ts` mapeia produtos de cada locadora para códigos canônicos com status `CONFIRMED`, `PARTIAL` ou `UNCONFIRMED`. Nunca por nome.
- **Melhor oferta** só dentro de um grupo de ofertas equivalentes (`comparison/offer-grouping.ts`), com resultado `WINNER`, `TIE` ou `NO_COMPARISON`.
