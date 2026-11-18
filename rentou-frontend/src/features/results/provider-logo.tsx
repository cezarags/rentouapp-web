import type { ProviderInfoDto } from "@/lib/api/contracts";
import { cn } from "@/lib/cn";

/**
 * Monograma da locadora. Logos oficiais exigem autorização de uso de marca;
 * quando houver, basta trocar este componente.
 */
export function ProviderLogo({ provider, size = "md" }: { provider: ProviderInfoDto; size?: "sm" | "md" }) {
  return (
    <span className="flex items-center gap-2">
      <span
        aria-hidden="true"
        className={cn("grid shrink-0 place-items-center rounded-lg font-bold text-white", size === "sm" ? "size-6 text-xs" : "size-9 text-sm")}
        style={{ backgroundColor: provider.accentColor }}
      >
        {provider.name.charAt(0)}
      </span>
      <span className={cn("font-bold tracking-tight text-slate-900", size === "sm" ? "text-sm" : "text-base")}>{provider.name}</span>
    </span>
  );
}
