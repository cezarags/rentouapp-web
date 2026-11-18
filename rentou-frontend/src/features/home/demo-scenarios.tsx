"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { SearchRequest } from "@/lib/api/contracts";
import { resultsUrl } from "@/features/search/search-params";
import { toDateInputValue } from "@/features/search/search-form-model";

interface Scenario {
  title: string;
  description: string;
  hint: string;
  build: (now: Date) => SearchRequest;
}

/** Próxima ocorrência do dia da semana (0 = domingo), a partir de amanhã. */
function nextWeekday(now: Date, weekday: number): Date {
  const date = new Date(now);
  date.setDate(date.getDate() + 1);
  while (date.getDay() !== weekday) date.setDate(date.getDate() + 1);
  return date;
}

function at(date: Date, offsetDays: number, time: string): string {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + offsetDays);
  return `${toDateInputValue(copy)}T${time}`;
}

const TUESDAY = 2;
const FRIDAY = 5;
const MONDAY = 1;

const SCENARIOS: Scenario[] = [
  {
    title: "Fim de semana em São Paulo",
    description: "Retirada na sexta em Congonhas, 2 diárias.",
    hint: "Promoção de fim de semana da Movida",
    build: (now) => {
      const friday = nextWeekday(now, FRIDAY);
      return { pickupLocationId: "cgh", dropoffLocationId: "cgh", pickupAt: at(friday, 0, "10:00"), dropoffAt: at(friday, 2, "10:00"), driverAge: 32 };
    },
  },
  {
    title: "Uma semana no Rio",
    description: "Galeão, 7 diárias a partir de segunda.",
    hint: "Desconto semanal da Localiza",
    build: (now) => {
      const monday = nextWeekday(now, MONDAY);
      return { pickupLocationId: "gig", dropoffLocationId: "gig", pickupAt: at(monday, 0, "09:00"), dropoffAt: at(monday, 7, "09:00"), driverAge: 40 };
    },
  },
  {
    title: "Viagem de trabalho em BH",
    description: "Confins, 3 diárias no meio da semana.",
    hint: "Unidas mais barata em sedans e SUVs",
    build: (now) => {
      const tuesday = nextWeekday(now, TUESDAY);
      return { pickupLocationId: "cnf", dropoffLocationId: "cnf", pickupAt: at(tuesday, 0, "08:00"), dropoffAt: at(tuesday, 3, "08:00"), driverAge: 28 };
    },
  },
  {
    title: "Ida para outra cidade",
    description: "Retira em Guarulhos e devolve em Viracopos.",
    hint: "Taxas de devolução diferentes",
    build: (now) => {
      const tuesday = nextWeekday(now, TUESDAY);
      return { pickupLocationId: "gru", dropoffLocationId: "vcp", pickupAt: at(tuesday, 0, "14:00"), dropoffAt: at(tuesday, 4, "14:00"), driverAge: 22 };
    },
  },
];

export function DemoScenarios() {
  // As datas dependem do "agora": calculamos só no cliente para evitar divergência de hidratação.
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => setNow(new Date()), []);

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {SCENARIOS.map((scenario) => (
        <Link
          key={scenario.title}
          href={now ? resultsUrl(scenario.build(now)) : "#"}
          aria-disabled={!now}
          className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-card transition hover:-translate-y-0.5 hover:border-navy-200"
        >
          <span className="flex items-start justify-between gap-2">
            <span className="font-semibold text-navy-900">{scenario.title}</span>
            <ArrowUpRight className="size-4 shrink-0 text-slate-400 transition group-hover:text-navy-600" aria-hidden />
          </span>
          <span className="mt-1 text-sm text-slate-600">{scenario.description}</span>
          <span className="mt-3 inline-flex w-fit rounded-full bg-saving-50 px-2.5 py-1 text-xs font-semibold text-saving-700">{scenario.hint}</span>
        </Link>
      ))}
    </div>
  );
}
