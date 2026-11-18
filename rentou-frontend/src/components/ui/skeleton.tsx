import { cn } from "@/lib/cn";

/** Bloco de carregamento com brilho animado. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "animate-shimmer rounded-lg bg-slate-100 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.7),transparent)] bg-[length:400px_100%] bg-no-repeat",
        className,
      )}
    />
  );
}
