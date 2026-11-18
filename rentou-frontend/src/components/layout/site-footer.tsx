import { Logo } from "./logo";

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-navy-950 text-navy-200">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr]">
        <div className="space-y-3">
          <Logo inverted />
          <p className="max-w-sm text-sm text-navy-300">Compare, economize, viaje. O Rentou compara preços de aluguel de carros e leva você direto à locadora escolhida.</p>
        </div>
        <div className="space-y-2 text-sm">
          <p className="font-semibold text-white">Transparência</p>
          <p className="text-navy-300">O Rentou não faz reservas nem recebe pagamentos. A contratação acontece no site da locadora.</p>
        </div>
        <div className="space-y-2 text-sm">
          <p className="font-semibold text-white">Versão de demonstração</p>
          <p className="text-navy-300">Preços e condições fictícios. Localiza, Movida e Unidas são marcas de seus respectivos donos e não têm vínculo com esta demonstração.</p>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-7xl px-4 py-4 text-xs text-navy-400 sm:px-6">© {new Date().getFullYear()} Rentou App. Projeto demonstrativo.</p>
      </div>
    </footer>
  );
}
