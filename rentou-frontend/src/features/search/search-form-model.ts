import type { LocationDto, SearchCriteriaDto, SearchRequest } from "@/lib/api/contracts";
import { parseLocalDateTime, toLocalDateTime } from "@/lib/rental-period";
import { validateDriverAge, validatePeriod } from "@/lib/search-rules";

export interface SearchFormValues {
  pickupLocation: LocationDto | null;
  dropoffLocation: LocationDto | null;
  differentDropoff: boolean;
  pickupDate: string;
  pickupTime: string;
  dropoffDate: string;
  dropoffTime: string;
  driverAge: string;
}

export type SearchFormField = keyof SearchFormValues;
export type SearchFormErrors = Partial<Record<SearchFormField, string>>;

const pad = (value: number) => String(value).padStart(2, "0");

export function toDateInputValue(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function addDays(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

/** Sugestão inicial: retirada amanhã às 10h, devolução 3 dias depois. */
export function defaultFormValues(now: Date): SearchFormValues {
  return {
    pickupLocation: null,
    dropoffLocation: null,
    differentDropoff: false,
    pickupDate: toDateInputValue(addDays(now, 1)),
    pickupTime: "10:00",
    dropoffDate: toDateInputValue(addDays(now, 4)),
    dropoffTime: "10:00",
    driverAge: "30",
  };
}

export function formValuesFromCriteria(criteria: SearchCriteriaDto): SearchFormValues {
  const [pickupDate, pickupTime] = criteria.pickupAt.split("T");
  const [dropoffDate, dropoffTime] = criteria.dropoffAt.split("T");
  return {
    pickupLocation: criteria.pickupLocation,
    dropoffLocation: criteria.oneWay ? criteria.dropoffLocation : null,
    differentDropoff: criteria.oneWay,
    pickupDate,
    pickupTime,
    dropoffDate,
    dropoffTime,
    driverAge: String(criteria.driverAge),
  };
}

/**
 * Validação do formulário. Função pura (recebe `now` como parâmetro) para ser
 * testável sem depender do relógio real.
 */
export function validateSearchForm(values: SearchFormValues, now: Date): SearchFormErrors {
  const errors: SearchFormErrors = {};

  if (!values.pickupLocation) errors.pickupLocation = "Selecione o local de retirada.";
  if (values.differentDropoff) {
    if (!values.dropoffLocation) errors.dropoffLocation = "Selecione o local de devolução.";
    else if (values.dropoffLocation.id === values.pickupLocation?.id) {
      errors.dropoffLocation = "Escolha uma loja diferente da retirada.";
    }
  }

  if (!values.pickupDate) errors.pickupDate = "Informe a data de retirada.";
  if (!values.pickupTime) errors.pickupTime = "Informe o horário.";
  if (!values.dropoffDate) errors.dropoffDate = "Informe a data de devolução.";
  if (!values.dropoffTime) errors.dropoffTime = "Informe o horário.";

  const pickupAt = parseLocalDateTime(toLocalDateTime(values.pickupDate, values.pickupTime));
  const dropoffAt = parseLocalDateTime(toLocalDateTime(values.dropoffDate, values.dropoffTime));
  if (values.pickupDate && values.pickupTime && !pickupAt) errors.pickupDate = "Data de retirada inválida.";
  if (values.dropoffDate && values.dropoffTime && !dropoffAt) errors.dropoffDate = "Data de devolução inválida.";

  if (pickupAt && dropoffAt) {
    const periodErrors = validatePeriod(pickupAt, dropoffAt, now);
    if (periodErrors.pickupAt) errors.pickupDate = periodErrors.pickupAt;
    if (periodErrors.dropoffAt) errors.dropoffDate = periodErrors.dropoffAt;
  }

  if (!values.driverAge.trim()) {
    errors.driverAge = "Informe a idade do condutor.";
  } else {
    const ageError = validateDriverAge(Number(values.driverAge));
    if (ageError) errors.driverAge = ageError;
  }

  return errors;
}

/** Converte o formulário (já validado) no contrato da API. */
export function toSearchRequest(values: SearchFormValues): SearchRequest {
  if (!values.pickupLocation) throw new Error("Formulário inválido: local de retirada ausente.");
  const dropoff = values.differentDropoff && values.dropoffLocation ? values.dropoffLocation : values.pickupLocation;
  return {
    pickupLocationId: values.pickupLocation.id,
    dropoffLocationId: dropoff.id,
    pickupAt: toLocalDateTime(values.pickupDate, values.pickupTime),
    dropoffAt: toLocalDateTime(values.dropoffDate, values.dropoffTime),
    driverAge: Number(values.driverAge),
  };
}
