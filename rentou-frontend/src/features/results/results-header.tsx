"use client";

import { ArrowRight, CalendarDays, MapPin, Pencil, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { SearchCriteriaDto } from "@/lib/api/contracts";
import { formatDateTime, pluralize } from "@/lib/format";
import { formatLocation } from "@/features/search/location-combobox";
import { formValuesFromCriteria } from "@/features/search/search-form-model";
import { SearchForm } from "@/features/search/search-form";

export function ResultsHeader({ criteria, rentalDays }: { criteria: SearchCriteriaDto; rentalDays: number }) {
  const [editing, setEditing] = useState(false);

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <dl className="grid gap-3 text-sm sm:grid-cols-[1fr_auto_1fr] sm:items-center lg:flex lg:flex-1 lg:gap-6">
          <div className="min-w-0">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Retirada</dt>
            <dd className="mt-0.5 flex items-center gap-1.5 font-semibold text-slate-900">
              <MapPin className="size-4 shrink-0 text-navy-600" aria-hidden />
              <span className="truncate">{formatLocation(criteria.pickupLocation)}</span>
            </dd>
            <dd className="mt-0.5 text-slate-500">{formatDateTime(criteria.pickupAt)}</dd>
          </div>
          <ArrowRight className="hidden size-4 text-slate-400 sm:block" aria-hidden />
          <div className="min-w-0">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Devolução</dt>
            <dd className="mt-0.5 flex items-center gap-1.5 font-semibold text-slate-900">
              <MapPin className="size-4 shrink-0 text-navy-600" aria-hidden />
              <span className="truncate">{formatLocation(criteria.dropoffLocation)}</span>
            </dd>
            <dd className="mt-0.5 text-slate-500">{formatDateTime(criteria.dropoffAt)}</dd>
          </div>
          <div className="sm:col-span-3 lg:col-span-1">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Período</dt>
            <dd className="mt-0.5 flex items-center gap-1.5 font-semibold text-slate-900">
              <CalendarDays className="size-4 text-navy-600" aria-hidden />
              {pluralize(rentalDays, "diária", "diárias")}
              <span className="font-normal text-slate-500">· condutor de {criteria.driverAge} anos</span>
            </dd>
          </div>
        </dl>
        <Button variant={editing ? "ghost" : "secondary"} onClick={() => setEditing((value) => !value)} aria-expanded={editing}>
          {editing ? <X className="size-4" aria-hidden /> : <Pencil className="size-4" aria-hidden />}
          {editing ? "Cancelar" : "Editar pesquisa"}
        </Button>
      </div>
      {editing && (
        <div className="mt-5 border-t border-slate-200 pt-5">
          <SearchForm variant="compact" initialValues={formValuesFromCriteria(criteria)} onSubmitted={() => setEditing(false)} />
        </div>
      )}
    </Card>
  );
}
