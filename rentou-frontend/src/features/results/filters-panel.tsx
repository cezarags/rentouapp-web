"use client";

import type { ReactNode } from "react";
import type { Transmission } from "@/lib/api/contracts";
import { BODY_TYPE_LABELS, CATEGORY_LABELS } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { countActiveFilters, EMPTY_FILTERS, type FilterFacets, type OfferFilters } from "./offer-filters";

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

function FilterGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="space-y-2.5">
      <legend className="mb-2.5 text-sm font-semibold text-navy-900">{title}</legend>
      {children}
    </fieldset>
  );
}

function CheckOption({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-700">
      <input type="checkbox" className="size-4 rounded accent-navy-700" checked={checked} onChange={onChange} />
      {label}
    </label>
  );
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
        active ? "border-navy-700 bg-navy-700 text-white" : "border-slate-300 bg-white text-slate-700 hover:border-navy-300",
      )}
    >
      {label}
    </button>
  );
}

interface FiltersPanelProps {
  filters: OfferFilters;
  facets: FilterFacets;
  onChange: (filters: OfferFilters) => void;
}

export function FiltersPanel({ filters, facets, onChange }: FiltersPanelProps) {
  const active = countActiveFilters(filters);
  const transmissionOptions: Array<{ value: Transmission | "ANY"; label: string }> = [
    { value: "ANY", label: "Todos" },
    { value: "AUTOMATIC", label: "Automático" },
    { value: "MANUAL", label: "Manual" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-navy-900">Filtros</h2>
        {active > 0 && (
          <button type="button" className="text-sm font-semibold text-navy-600 hover:underline" onClick={() => onChange(EMPTY_FILTERS)}>
            Limpar ({active})
          </button>
        )}
      </div>

      <FilterGroup title="Categoria do veículo">
        {facets.categories.map((category) => (
          <CheckOption
            key={category}
            label={CATEGORY_LABELS[category]}
            checked={filters.categories.includes(category)}
            onChange={() => onChange({ ...filters, categories: toggle(filters.categories, category) })}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Tipo de carroceria">
        <div className="flex flex-wrap gap-2">
          {facets.bodyTypes.map((bodyType) => (
            <Chip
              key={bodyType}
              label={BODY_TYPE_LABELS[bodyType]}
              active={filters.bodyTypes.includes(bodyType)}
              onClick={() => onChange({ ...filters, bodyTypes: toggle(filters.bodyTypes, bodyType) })}
            />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Câmbio">
        <div className="flex flex-wrap gap-2">
          {transmissionOptions.map((option) => (
            <Chip
              key={option.value}
              label={option.label}
              active={filters.transmission === option.value}
              onClick={() => onChange({ ...filters, transmission: option.value })}
            />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Conforto">
        <CheckOption
          label="Somente com ar-condicionado"
          checked={filters.airConditioningOnly}
          onChange={() => onChange({ ...filters, airConditioningOnly: !filters.airConditioningOnly })}
        />
      </FilterGroup>

      <FilterGroup title="Passageiros">
        <div className="flex flex-wrap gap-2">
          <Chip label="Qualquer" active={filters.minPassengers === 0} onClick={() => onChange({ ...filters, minPassengers: 0 })} />
          {facets.passengerOptions.map((count) => (
            <Chip
              key={count}
              label={`${count}+`}
              active={filters.minPassengers === count}
              onClick={() => onChange({ ...filters, minPassengers: count })}
            />
          ))}
        </div>
      </FilterGroup>
    </div>
  );
}
