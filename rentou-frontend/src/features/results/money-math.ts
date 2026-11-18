import type { Money } from "@/lib/api/contracts";

/**
 * Diferença entre dois valores para EXIBIÇÃO. A conta é feita em centavos
 * inteiros para evitar erros de ponto flutuante. Regras de preço continuam
 * no servidor; aqui só comparamos valores já calculados.
 */
export function toMoneyDifference(value: Money, reference: Money): Money {
  const cents = Math.round(Number(value.amount) * 100) - Math.round(Number(reference.amount) * 100);
  return { amount: (cents / 100).toFixed(2), currency: value.currency };
}
