import { CircleAlert, Info, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Tone = "info" | "warning" | "error";

const STYLES: Record<Tone, { box: string; icon: ReactNode }> = {
  info: { box: "border-navy-100 bg-navy-50 text-navy-800", icon: <Info className="size-4 shrink-0" aria-hidden /> },
  warning: { box: "border-amber-200 bg-amber-50 text-amber-900", icon: <TriangleAlert className="size-4 shrink-0" aria-hidden /> },
  error: { box: "border-red-200 bg-red-50 text-red-800", icon: <CircleAlert className="size-4 shrink-0" aria-hidden /> },
};

export function Alert({ tone = "info", children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  const style = STYLES[tone];
  return (
    <div role={tone === "error" ? "alert" : "status"} className={cn("flex gap-2.5 rounded-xl border px-3.5 py-3 text-sm", style.box, className)}>
      <span className="mt-0.5">{style.icon}</span>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
