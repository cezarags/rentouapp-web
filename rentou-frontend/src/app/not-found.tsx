import { LinkButton } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <p className="text-sm font-semibold text-saving-600">Erro 404</p>
      <h1 className="mt-2 text-3xl font-bold text-navy-900">Página não encontrada</h1>
      <p className="mt-2 text-slate-600">O endereço pode estar errado ou a página foi removida.</p>
      <LinkButton href="/" className="mt-6">
        Voltar ao início
      </LinkButton>
    </div>
  );
}
