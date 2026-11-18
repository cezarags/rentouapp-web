import type { Money } from "@/lib/api/contracts";
import { parseLocalDateTime } from "@/lib/rental-period";

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

const shortDateFormatter = new Intl.DateTimeFormat("pt-BR", { weekday: "short", day: "2-digit", month: "short" });

const timeFormatter = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" });

/** "1234.50" → "R$ 1.234,50" */
export function formatMoney(money: Money): string {
  return currencyFormatter.format(Number(money.amount));
}

export function moneyToNumber(money: Money): number {
  return Number(money.amount);
}

/** "2026-12-20T10:00" → "20/12/2026" */
export function formatDate(localDateTime: string): string {
  const date = parseLocalDateTime(localDateTime);
  return date ? dateFormatter.format(date) : localDateTime;
}

/** "2026-12-20T10:00" → "dom., 20 de dez." */
export function formatShortDate(localDateTime: string): string {
  const date = parseLocalDateTime(localDateTime);
  return date ? shortDateFormatter.format(date) : localDateTime;
}

/** "2026-12-20T10:00" → "20/12/2026 às 10:00" */
export function formatDateTime(localDateTime: string): string {
  const date = parseLocalDateTime(localDateTime);
  return date ? `${dateFormatter.format(date)} às ${timeFormatter.format(date)}` : localDateTime;
}

export function pluralize(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}
