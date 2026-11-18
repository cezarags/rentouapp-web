import { CarFront, RefreshCw, SearchX, WifiOff } from "lucide-react";
import type { ReactNode } from "react";
import { Button, LinkButton } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

function StateMessage({ icon, title, children, action }: { icon: ReactNode; title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
      <span className="grid size-14 place-items-center rounded-2xl bg-navy-50 text-navy-700">{icon}</span>
      <h2 className="mt-4 text-lg font-bold text-navy-900">{title}</h2>
      <div className="mt-1.5 max-w-md text-sm text-slate-600">{children}</div>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function NoResultsState() {
  return (
    <StateMessage icon={<CarFront className="size-7" />} title="Nenhuma locadora atende esta busca" action={<LinkButton href="/" variant="primary">Fazer nova busca</LinkButton>}>
      Não encontramos carros disponíveis para este local e período. Tente outro local de retirada ou outras datas.
    </StateMessage>
  );
}

export function NoFilterMatchState({ onClear }: { onClear: () => void }) {
  return (
    <StateMessage icon={<SearchX className="size-7" />} title="Nenhum carro com esses filtros" action={<Button onClick={onClear}>Limpar filtros</Button>}>
      Remova alguns filtros para ver mais opções.
    </StateMessage>
  );
}

export function ErrorState({ message, onRetry, homeLink = false }: { message: string; onRetry?: () => void; homeLink?: boolean }) {
  return (
    <StateMessage
      icon={<WifiOff className="size-7" />}
      title="Não foi possível carregar"
      action={
        <div className="flex flex-wrap justify-center gap-2">
          {onRetry && (
            <Button onClick={onRetry}>
              <RefreshCw className="size-4" aria-hidden /> Tentar novamente
            </Button>
          )}
          {homeLink && <LinkButton href="/" variant="outline">Voltar ao início</LinkButton>}
        </div>
      }
    >
      {message}
    </StateMessage>
  );
}

export function OfferCardSkeleton() {
  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex justify-between">
        <Skeleton className="h-9 w-28" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <Skeleton className="h-28 w-full rounded-xl" />
      <Skeleton className="h-5 w-3/4" />
      <div className="grid grid-cols-2 gap-2">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="h-4 w-full" />
        ))}
      </div>
      <Skeleton className="h-8 w-1/2 justify-self-end" />
      <div className="grid grid-cols-2 gap-2">
        <Skeleton className="h-11" />
        <Skeleton className="h-11" />
      </div>
    </div>
  );
}

export function ResultsSkeleton() {
  return (
    <div className="space-y-8" role="status" aria-label="Buscando ofertas nas locadoras">
      {[0, 1].map((section) => (
        <div key={section} className="space-y-3">
          <Skeleton className="h-6 w-80 max-w-full" />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <OfferCardSkeleton />
            <OfferCardSkeleton />
            <OfferCardSkeleton />
          </div>
        </div>
      ))}
    </div>
  );
}
