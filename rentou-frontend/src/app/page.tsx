import { BadgeCheck, Columns3, ExternalLink, Scale, Search, ShieldCheck, SlidersHorizontal } from "lucide-react";
import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { DemoScenarios } from "@/features/home/demo-scenarios";
import { SearchForm } from "@/features/search/search-form";

const PROVIDERS = ["Localiza", "Movida", "Unidas"];

const STEPS = [
  { icon: <Search className="size-5" />, title: "Pesquise uma vez", text: "Informe local, datas e idade do condutor. Consultamos as três locadoras ao mesmo tempo." },
  { icon: <Columns3 className="size-5" />, title: "Compare o que é igual", text: "Agrupamos carros com as mesmas condições e destacamos o menor preço total de cada grupo." },
  { icon: <SlidersHorizontal className="size-5" />, title: "Personalize", text: "Escolha proteções e adicionais e veja o preço final de cada locadora ser atualizado na hora." },
  { icon: <ExternalLink className="size-5" />, title: "Reserve na locadora", text: "Gostou? Seguimos para o site da locadora escolhida para concluir a reserva." },
];

const PRINCIPLES = [
  { icon: <Scale className="size-5" />, title: "Comparação justa", text: "Só chamamos de “Melhor oferta” quando as condições são equivalentes: categoria, câmbio, quilometragem e proteções." },
  { icon: <ShieldCheck className="size-5" />, title: "Equivalência verificada", text: "Cada locadora dá nomes diferentes às suas proteções. Nunca comparamos produtos só porque os nomes se parecem." },
  { icon: <BadgeCheck className="size-5" />, title: "Preço total, sem surpresa", text: "Mostramos diárias, adicionais e taxas separadamente, e comparamos sempre o valor final." },
];

const FAQ = [
  { question: "O Rentou faz a reserva do carro?", answer: "Não. O Rentou compara preços e redireciona você para o site da locadora, onde a reserva e o pagamento são feitos." },
  { question: "Os preços são reais?", answer: "Nesta versão de demonstração, não. Todos os valores são fictícios e servem para mostrar como a comparação funciona." },
  { question: "Por que algumas ofertas não têm o selo de melhor oferta?", answer: "Porque não há outra oferta com condições equivalentes para comparar, ou porque algum item escolhido não tem equivalência confirmada naquela locadora." },
  { question: "O que é taxa de condutor jovem?", answer: "Muitas locadoras cobram um valor extra por diária para condutores com até 24 anos. Ele aparece separado no detalhamento do preço." },
];

function SectionTitle({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <div className="mx-auto mb-10 max-w-2xl text-center">
      <p className="text-sm font-semibold uppercase tracking-wider text-saving-600">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">{title}</h2>
      {children && <p className="mt-3 text-slate-600">{children}</p>}
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden bg-navy-900">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(18,183,106,0.22),transparent_55%),radial-gradient(ellipse_at_bottom_left,rgba(52,87,160,0.5),transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl px-4 pb-36 pt-14 sm:px-6 sm:pt-20">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-navy-100">
            <span className="size-1.5 rounded-full bg-saving-500" /> Compare, economize, viaje.
          </p>
          <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
            Encontre o melhor preço para sua próxima viagem.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-navy-200">
            Compare as principais locadoras do Brasil e economize no aluguel do seu carro.
          </p>
        </div>
      </section>

      <section className="relative z-10 mx-auto -mt-28 w-full max-w-7xl px-4 sm:px-6">
        <Card className="p-4 shadow-elevated sm:p-6">
          <SearchForm />
        </Card>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-slate-500">
          <span>Comparamos:</span>
          {PROVIDERS.map((name) => (
            <span key={name} className="text-base font-bold tracking-tight text-slate-700">
              {name}
            </span>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6">
        <SectionTitle eyebrow="Experimente" title="Cenários de demonstração">
          Cada cenário mostra uma locadora diferente com o menor preço. Clique para ver a comparação.
        </SectionTitle>
        <DemoScenarios />
      </section>

      <section id="como-funciona" className="scroll-mt-20 bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionTitle eyebrow="Como funciona" title="Do orçamento à reserva em quatro passos" />
          <ol className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, index) => (
              <li key={step.title} className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-xl bg-navy-800 text-white">{step.icon}</span>
                  <span className="text-sm font-bold text-slate-400">0{index + 1}</span>
                </div>
                <h3 className="mt-4 font-semibold text-navy-900">{step.title}</h3>
                <p className="mt-1.5 text-sm text-slate-600">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="sobre" className="scroll-mt-20 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionTitle eyebrow="Sobre o Rentou" title="Transparência em primeiro lugar">
            O Rentou nasceu para resolver um problema simples: comparar aluguel de carros é difícil porque cada locadora chama as coisas de um jeito.
          </SectionTitle>
          <div className="grid gap-4 md:grid-cols-3">
            {PRINCIPLES.map((item) => (
              <div key={item.title} className="rounded-2xl border border-slate-200 p-6">
                <span className="grid size-10 place-items-center rounded-xl bg-saving-50 text-saving-700">{item.icon}</span>
                <h3 className="mt-4 font-semibold text-navy-900">{item.title}</h3>
                <p className="mt-1.5 text-sm text-slate-600">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="ajuda" className="scroll-mt-20 bg-slate-50 py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <SectionTitle eyebrow="Ajuda" title="Perguntas frequentes" />
          <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
            {FAQ.map((item) => (
              <details key={item.question} className="group p-5 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-navy-900">
                  {item.question}
                  <span className="text-xl leading-none text-slate-400 transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm text-slate-600">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
