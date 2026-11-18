"use client";

import { Building2, Loader2, MapPin, Plane } from "lucide-react";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { LocationDto } from "@/lib/api/contracts";
import { getRentouApi } from "@/lib/api";
import { cn } from "@/lib/cn";

interface LocationComboboxProps {
  label: string;
  value: LocationDto | null;
  onChange: (location: LocationDto | null) => void;
  error?: string;
  placeholder?: string;
}

export function formatLocation(location: LocationDto): string {
  return location.iataCode ? `${location.name} (${location.iataCode})` : `${location.name} — ${location.city}`;
}

/** Autocomplete acessível (padrão ARIA combobox) para lojas e aeroportos. */
export function LocationCombobox({ label, value, onChange, error, placeholder = "Cidade, aeroporto ou loja" }: LocationComboboxProps) {
  const id = useId();
  const listId = `${id}-list`;
  const errorId = `${id}-error`;
  const [query, setQuery] = useState(value ? formatLocation(value) : "");
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<LocationDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebouncedValue(query, 150);

  // Sincroniza o texto quando um local é definido por fora (ex.: editar busca).
  // Não limpamos quando value vira null: isso acontece enquanto o usuário digita.
  useEffect(() => {
    if (value) setQuery(formatLocation(value));
  }, [value]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    const term = value && debouncedQuery === formatLocation(value) ? "" : debouncedQuery;
    getRentouApi()
      .searchLocations(term)
      .then((result) => {
        if (cancelled) return;
        setOptions(result);
        setActiveIndex(0);
      })
      .catch(() => !cancelled && setOptions([]))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, open, value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function select(location: LocationDto) {
    onChange(location);
    setQuery(formatLocation(location));
    setOpen(false);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((index) => Math.min(index + 1, options.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter" && open && options[activeIndex]) {
      event.preventDefault();
      select(options[activeIndex]);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <label htmlFor={id} className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </label>
      <div
        className={cn(
          "flex h-12 items-center gap-2 rounded-xl border bg-white px-3 transition-colors focus-within:border-navy-500 focus-within:ring-2 focus-within:ring-navy-100",
          error ? "border-red-400" : "border-slate-300",
        )}
      >
        <MapPin className="size-4 shrink-0 text-slate-400" aria-hidden />
        <input
          id={id}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          aria-activedescendant={open && options[activeIndex] ? `${listId}-${options[activeIndex].id}` : undefined}
          autoComplete="off"
          className="h-full w-full min-w-0 bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:font-normal placeholder:text-slate-400"
          placeholder={placeholder}
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
            if (value) onChange(null);
          }}
          onKeyDown={handleKeyDown}
        />
        {loading && open && <Loader2 className="size-4 shrink-0 animate-spin text-slate-400" aria-hidden />}
      </div>
      {error && (
        <p id={errorId} className="mt-1 text-xs font-medium text-red-600">
          {error}
        </p>
      )}
      {open && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-30 mt-2 max-h-72 w-full min-w-72 overflow-auto rounded-xl border border-slate-200 bg-white p-1 shadow-elevated"
        >
          {!loading && options.length === 0 && <li className="px-3 py-3 text-sm text-slate-500">Nenhum local encontrado.</li>}
          {options.map((location, index) => (
            <li
              key={location.id}
              id={`${listId}-${location.id}`}
              role="option"
              aria-selected={index === activeIndex}
              className={cn("flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5", index === activeIndex && "bg-navy-50")}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseDown={(event) => {
                event.preventDefault();
                select(location);
              }}
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-600">
                {location.type === "AIRPORT" ? <Plane className="size-4" aria-hidden /> : <Building2 className="size-4" aria-hidden />}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-slate-900">
                  {location.name}
                  {location.iataCode && <span className="ml-1.5 text-xs font-bold text-navy-600">{location.iataCode}</span>}
                </span>
                <span className="block truncate text-xs text-slate-500">
                  {location.city}, {location.state}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
