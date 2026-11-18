/**
 * Regras do período de locação, compartilhadas entre validação do formulário
 * e o mock do backend.
 */

const MINUTES_PER_DAY = 24 * 60;

/** Tolerância de devolução: até 1h além das 24h não gera nova diária. */
export const RETURN_TOLERANCE_MINUTES = 60;

export const MAX_RENTAL_DAYS = 60;

/** Converte "2026-12-20T10:00" em Date no horário local. */
export function parseLocalDateTime(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;
  const [, year, month, day, hour, minute] = match.map(Number);
  const date = new Date(year, month - 1, day, hour, minute);
  // Rejeita datas inexistentes, como 31/02 (o Date "corrige" para março).
  if (date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return date;
}

export function toLocalDateTime(date: string, time: string): string {
  return `${date}T${time}`;
}

/**
 * Quantidade de diárias: cada bloco de 24h é uma diária, com tolerância de 1h.
 * Ex.: 24h → 1 diária; 25h → 1 diária; 25h01 → 2 diárias.
 */
export function calculateRentalDays(pickupAt: Date, dropoffAt: Date): number {
  const minutes = Math.round((dropoffAt.getTime() - pickupAt.getTime()) / 60_000);
  if (minutes <= 0) return 0;
  return Math.max(1, Math.ceil((minutes - RETURN_TOLERANCE_MINUTES) / MINUTES_PER_DAY));
}
