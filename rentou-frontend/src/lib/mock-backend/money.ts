import type { Money } from "@/lib/api/contracts";

/**
 * O mock calcula tudo em centavos (inteiros) e só converte para string no
 * momento de montar o DTO. Inteiros não sofrem com imprecisão de ponto
 * flutuante — é o mesmo motivo de usarmos BigDecimal no Java.
 */
export type Cents = number;

export function toMoney(cents: Cents): Money {
  const sign = cents < 0 ? "-" : "";
  const abs = Math.abs(Math.round(cents));
  const reais = Math.floor(abs / 100);
  const centavos = String(abs % 100).padStart(2, "0");
  return { amount: `${sign}${reais}.${centavos}`, currency: "BRL" };
}

export function percentOf(cents: Cents, percent: number): Cents {
  return Math.round((cents * percent) / 100);
}

export function sum(values: Cents[]): Cents {
  return values.reduce((total, value) => total + value, 0);
}
