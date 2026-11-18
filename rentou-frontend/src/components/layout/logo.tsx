import Link from "next/link";
import { cn } from "@/lib/cn";

/** Marca do Rentou: um "R" com uma seta de economia em verde. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-8", className)} aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="var(--color-navy-800)" />
      <path d="M10 23V9h6.2c3 0 5 1.8 5 4.4 0 2-1.2 3.5-3.1 4.1L21.6 23" fill="none" stroke="white" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="24" cy="9" r="3" fill="var(--color-saving-500)" />
    </svg>
  );
}

export function Logo({ inverted = false }: { inverted?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2" aria-label="Rentou App — página inicial">
      <LogoMark />
      <span className={cn("text-xl font-bold tracking-tight", inverted ? "text-white" : "text-navy-900")}>
        Rentou<span className="font-medium text-saving-500">.</span>
      </span>
    </Link>
  );
}
