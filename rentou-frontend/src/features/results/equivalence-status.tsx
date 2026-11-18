import { CircleCheck, CircleHelp, CircleSlash, CircleAlert } from "lucide-react";
import type { EquivalenceStatus, SelectedItemDto } from "@/lib/api/contracts";
import { cn } from "@/lib/cn";
import { formatMoney } from "@/lib/format";

const STATUS_META: Record<EquivalenceStatus, { label: string; className: string; Icon: typeof CircleCheck }> = {
  CONFIRMED: { label: "Equivalente", className: "text-saving-700", Icon: CircleCheck },
  PARTIAL: { label: "Equivalência parcial", className: "text-amber-700", Icon: CircleAlert },
  UNCONFIRMED: { label: "Equivalência não confirmada", className: "text-amber-700", Icon: CircleHelp },
  UNAVAILABLE: { label: "Indisponível", className: "text-slate-500", Icon: CircleSlash },
};

export function equivalenceLabel(status: EquivalenceStatus): string {
  return STATUS_META[status].label;
}

export function EquivalenceIcon({ status, className }: { status: EquivalenceStatus; className?: string }) {
  const { Icon, className: color, label } = STATUS_META[status];
  return <Icon className={cn("size-4 shrink-0", color, className)} aria-label={label} />;
}

/** Lista os itens escolhidos na personalização e como cada locadora os atende. */
export function SelectedItemsList({ items, detailed = false }: { items: SelectedItemDto[]; detailed?: boolean }) {
  if (items.length === 0) return null;
  return (
    <ul className="space-y-1.5">
      {items.map((item) => {
        const priced = item.status === "CONFIRMED" || item.status === "PARTIAL";
        return (
          <li key={item.code} className="flex items-start gap-2 text-sm">
            <EquivalenceIcon status={item.status} className="mt-0.5" />
            <span className="min-w-0 flex-1">
              <span className={cn("font-medium", priced ? "text-slate-800" : "text-slate-500")}>{item.label}</span>
              {item.commercialName && <span className="text-slate-500"> · {item.commercialName}</span>}
              {!priced && <span className="block text-xs text-slate-500">{equivalenceLabel(item.status)}</span>}
              {detailed && item.note && <span className="block text-xs text-slate-500">{item.note}</span>}
            </span>
            {priced && item.price && <span className="shrink-0 text-sm font-medium text-slate-700">{formatMoney(item.price)}</span>}
          </li>
        );
      })}
    </ul>
  );
}
