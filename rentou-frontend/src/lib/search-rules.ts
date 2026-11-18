import { calculateRentalDays, MAX_RENTAL_DAYS } from "@/lib/rental-period";

/**
 * Regras de negócio da busca, compartilhadas pelo formulário (Home), pela
 * leitura da URL (Resultados) e pelo mock do backend. O backend real repete
 * estas validações: nunca confiamos apenas na validação do cliente.
 */

export const MIN_DRIVER_AGE = 18;
export const MAX_DRIVER_AGE = 99;
export const MIN_ADVANCE_MINUTES = 60;

export interface PeriodErrors {
  pickupAt?: string;
  dropoffAt?: string;
}

export function validatePeriod(pickupAt: Date, dropoffAt: Date, now: Date): PeriodErrors {
  const errors: PeriodErrors = {};
  const earliestPickup = new Date(now.getTime() + MIN_ADVANCE_MINUTES * 60_000);

  if (pickupAt < earliestPickup) {
    errors.pickupAt = "A retirada precisa ser com pelo menos 1 hora de antecedência.";
  }
  if (dropoffAt <= pickupAt) {
    errors.dropoffAt = "A devolução deve ser depois da retirada.";
  } else if (calculateRentalDays(pickupAt, dropoffAt) > MAX_RENTAL_DAYS) {
    errors.dropoffAt = `O período máximo de locação é de ${MAX_RENTAL_DAYS} dias.`;
  }
  return errors;
}

export function validateDriverAge(age: number): string | undefined {
  if (!Number.isInteger(age)) return "Informe a idade em anos completos.";
  if (age < MIN_DRIVER_AGE || age > MAX_DRIVER_AGE) {
    return `A idade do condutor deve estar entre ${MIN_DRIVER_AGE} e ${MAX_DRIVER_AGE} anos.`;
  }
  return undefined;
}
