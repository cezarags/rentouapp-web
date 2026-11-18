"use client";

import { ArrowRight, CalendarDays, Clock, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useState, type FormEvent, type InputHTMLAttributes, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { LocationCombobox } from "./location-combobox";
import {
  defaultFormValues,
  toDateInputValue,
  toSearchRequest,
  validateSearchForm,
  type SearchFormErrors,
  type SearchFormValues,
} from "./search-form-model";
import { resultsUrl } from "./search-params";

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon: ReactNode;
  error?: string;
}

function Field({ label, icon, error, className, ...inputProps }: FieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </label>
      <div
        className={cn(
          "flex h-12 items-center gap-2 rounded-xl border bg-white px-3 transition-colors focus-within:border-navy-500 focus-within:ring-2 focus-within:ring-navy-100",
          error ? "border-red-400" : "border-slate-300",
        )}
      >
        <span className="shrink-0 text-slate-400">{icon}</span>
        <input
          id={id}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className="h-full w-full min-w-0 bg-transparent text-sm font-medium text-slate-900 outline-none"
          {...inputProps}
        />
      </div>
      {error && (
        <p id={errorId} className="mt-1 text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

interface SearchFormProps {
  initialValues?: SearchFormValues;
  /** "hero" para a Home; "compact" dentro da tela de resultados. */
  variant?: "hero" | "compact";
  onSubmitted?: () => void;
}

export function SearchForm({ initialValues, variant = "hero", onSubmitted }: SearchFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<SearchFormValues>(() => initialValues ?? defaultFormValues(new Date()));
  const [errors, setErrors] = useState<SearchFormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const today = toDateInputValue(new Date());

  function update<K extends keyof SearchFormValues>(field: K, value: SearchFormValues[K]) {
    const next = { ...values, [field]: value };
    setValues(next);
    // Depois da primeira tentativa, revalida a cada mudança para o erro sumir assim que corrigido.
    if (submitted) setErrors(validateSearchForm(next, new Date()));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    const validation = validateSearchForm(values, new Date());
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;
    router.push(resultsUrl(toSearchRequest(values)));
    onSubmitted?.();
  }

  const hasErrors = submitted && Object.keys(errors).length > 0;

  return (
    <form onSubmit={handleSubmit} noValidate aria-label="Pesquisar aluguel de carros" className="space-y-4">
      <div className={cn("grid gap-3", values.differentDropoff ? "md:grid-cols-2" : "md:grid-cols-1")}>
        <LocationCombobox
          label="Local de retirada"
          value={values.pickupLocation}
          onChange={(location) => update("pickupLocation", location)}
          error={errors.pickupLocation}
        />
        {values.differentDropoff && (
          <LocationCombobox
            label="Local de devolução"
            value={values.dropoffLocation}
            onChange={(location) => update("dropoffLocation", location)}
            error={errors.dropoffLocation}
          />
        )}
      </div>

      <label className="inline-flex cursor-pointer select-none items-center gap-2 text-sm font-medium text-slate-700">
        <input
          type="checkbox"
          className="size-4 rounded border-slate-300 accent-navy-700"
          checked={values.differentDropoff}
          onChange={(event) => update("differentDropoff", event.target.checked)}
        />
        Devolver em uma loja diferente
      </label>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-[1.2fr_0.8fr_1.2fr_0.8fr_0.8fr]">
        <Field
          label="Data de retirada"
          type="date"
          icon={<CalendarDays className="size-4" />}
          min={today}
          value={values.pickupDate}
          onChange={(event) => update("pickupDate", event.target.value)}
          error={errors.pickupDate}
        />
        <Field
          label="Horário"
          type="time"
          step={1800}
          icon={<Clock className="size-4" />}
          value={values.pickupTime}
          onChange={(event) => update("pickupTime", event.target.value)}
          error={errors.pickupTime}
          aria-label="Horário de retirada"
        />
        <Field
          label="Data de devolução"
          type="date"
          icon={<CalendarDays className="size-4" />}
          min={values.pickupDate || today}
          value={values.dropoffDate}
          onChange={(event) => update("dropoffDate", event.target.value)}
          error={errors.dropoffDate}
        />
        <Field
          label="Horário"
          type="time"
          step={1800}
          icon={<Clock className="size-4" />}
          value={values.dropoffTime}
          onChange={(event) => update("dropoffTime", event.target.value)}
          error={errors.dropoffTime}
          aria-label="Horário de devolução"
        />
        <Field
          label="Idade do condutor"
          type="number"
          inputMode="numeric"
          min={18}
          max={99}
          icon={<UserRound className="size-4" />}
          value={values.driverAge}
          onChange={(event) => update("driverAge", event.target.value)}
          error={errors.driverAge}
          className="col-span-2 lg:col-span-1"
        />
      </div>

      <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-center", variant === "hero" ? "sm:justify-between" : "sm:justify-end")}>
        {variant === "hero" && (
          <p className="text-xs text-slate-500">Condutores com até 24 anos podem pagar taxa de condutor jovem.</p>
        )}
        <Button type="submit" variant="success" size="lg" className="sm:min-w-56">
          Comparar preços
          <ArrowRight className="size-5" aria-hidden />
        </Button>
      </div>
      {hasErrors && (
        <p role="alert" className="sr-only">
          Corrija os campos destacados para continuar.
        </p>
      )}
    </form>
  );
}
