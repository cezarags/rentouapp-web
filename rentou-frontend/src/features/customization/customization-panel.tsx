"use client";

import { Loader2, MapPinned } from "lucide-react";
import type { ReactNode } from "react";
import type { AddonCode, ProviderResultDto, SearchResultDto, SelectionDto } from "@/lib/api/contracts";
import { ADDONS, DEFAULT_SELECTION, isDefaultSelection, MILEAGE_OPTIONS, PROTECTION_LEVELS, THIRD_PARTY_PROTECTION } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { formatMoney } from "@/lib/format";
import { EquivalenceIcon, equivalenceLabel } from "@/features/results/equivalence-status";
import { ProviderLogo } from "@/features/results/provider-logo";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="space-y-2">
      <legend className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-500">{title}</legend>
      {children}
    </fieldset>
  );
}

function OptionRow({
  type,
  name,
  checked,
  onChange,
  label,
  description,
}: {
  type: "radio" | "checkbox";
  name: string;
  checked: boolean;
  onChange: () => void;
  label: string;
  description: string;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer gap-3 rounded-xl border p-3 transition-colors",
        checked ? "border-navy-600 bg-navy-50" : "border-slate-200 hover:border-slate-300",
      )}
    >
      <input type={type} name={name} checked={checked} onChange={onChange} className="mt-0.5 size-4 shrink-0 accent-navy-700" />
      <span>
        <span className="block text-sm font-semibold text-slate-900">{label}</span>
        <span className="block text-xs text-slate-500">{description}</span>
      </span>
    </label>
  );
}

/** Uma oferta por locadora basta: os itens escolhidos são do catálogo da locadora. */
function providerSamples(result: SearchResultDto, providers: ProviderResultDto[]) {
  return providers
    .map((provider) => ({ provider, offer: result.offers.find((offer) => offer.providerId === provider.id) }))
    .filter((entry) => entry.offer !== undefined);
}

function EquivalenceMatrix({ result }: { result: SearchResultDto }) {
  const samples = providerSamples(result, result.providers);
  const itemCodes = samples[0]?.offer?.selectedItems.map((item) => item.code) ?? [];
  if (itemCodes.length === 0) return null;

  return (
    <section className="space-y-3 rounded-2xl bg-slate-50 p-4">
      <h3 className="text-sm font-bold text-navy-900">Como cada locadora atende sua escolha</h3>
      <p className="text-xs text-slate-500">
        Cada locadora usa nomes próprios. Só comparamos itens com equivalência confirmada; itens parciais entram no preço com aviso.
      </p>
      <div className="space-y-3">
        {samples.map(({ provider, offer }) => (
          <div key={provider.id} className="rounded-xl bg-white p-3">
            <ProviderLogo provider={provider} size="sm" />
            <ul className="mt-2 space-y-1.5">
              {offer!.selectedItems.map((item) => (
                <li key={item.code} className="flex items-start gap-2 text-xs">
                  <EquivalenceIcon status={item.status} />
                  <span className="min-w-0 flex-1">
                    <span className="font-semibold text-slate-800">{item.label}</span>
                    <span className="text-slate-500"> — {item.commercialName ?? equivalenceLabel(item.status)}</span>
                    {item.status !== "CONFIRMED" && item.note && <span className="block text-slate-500">{item.note}</span>}
                  </span>
                  {(item.status === "CONFIRMED" || item.status === "PARTIAL") && item.price && (
                    <span className="shrink-0 font-semibold text-slate-700">{formatMoney(item.price)}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

interface CustomizationPanelProps {
  selection: SelectionDto;
  onChange: (selection: SelectionDto) => void;
  result?: SearchResultDto;
  recalculating: boolean;
}

export function CustomizationPanel({ selection, onChange, result, recalculating }: CustomizationPanelProps) {
  const toggleAddon = (code: AddonCode) =>
    onChange({
      ...selection,
      addons: selection.addons.includes(code) ? selection.addons.filter((addon) => addon !== code) : [...selection.addons, code],
    });

  return (
    <div className="space-y-6">
      <p className={cn("flex items-center gap-2 text-xs font-medium", recalculating ? "text-navy-600" : "text-slate-500")} role="status">
        {recalculating ? <Loader2 className="size-3.5 animate-spin" aria-hidden /> : null}
        {recalculating ? "Atualizando os preços…" : "Os preços são atualizados automaticamente a cada escolha."}
      </p>

      <Section title="Proteções">
        {PROTECTION_LEVELS.map((level) => (
          <OptionRow
            key={level.code}
            type="radio"
            name="protection"
            checked={selection.protectionLevel === level.code}
            onChange={() => onChange({ ...selection, protectionLevel: level.code })}
            label={level.label}
            description={level.description}
          />
        ))}
        <OptionRow
          type="checkbox"
          name="third-party"
          checked={selection.thirdPartyProtection}
          onChange={() => onChange({ ...selection, thirdPartyProtection: !selection.thirdPartyProtection })}
          label={THIRD_PARTY_PROTECTION.label}
          description={THIRD_PARTY_PROTECTION.description}
        />
      </Section>

      <Section title="Adicionais">
        {ADDONS.map((addon) => (
          <OptionRow
            key={addon.code}
            type="checkbox"
            name={addon.code}
            checked={selection.addons.includes(addon.code)}
            onChange={() => toggleAddon(addon.code)}
            label={addon.label}
            description={addon.description}
          />
        ))}
      </Section>

      <Section title="Outras opções">
        {MILEAGE_OPTIONS.map((option) => (
          <OptionRow
            key={option.code}
            type="radio"
            name="mileage"
            checked={selection.mileage === option.code}
            onChange={() => onChange({ ...selection, mileage: option.code })}
            label={option.label}
            description={option.description}
          />
        ))}
        <div className="flex gap-3 rounded-xl border border-dashed border-slate-300 p-3 text-sm">
          <MapPinned className="mt-0.5 size-4 shrink-0 text-slate-400" aria-hidden />
          <span>
            <span className="block font-semibold text-slate-900">Devolução em outra loja</span>
            <span className="block text-xs text-slate-500">
              {result?.criteria.oneWay
                ? `Ativada: devolução em ${result.criteria.dropoffLocation.name}. A taxa de cada locadora já está nos preços.`
                : "Para devolver em outra loja, use “Editar pesquisa” e marque “Devolver em uma loja diferente”."}
            </span>
          </span>
        </div>
      </Section>

      {result && <EquivalenceMatrix result={result} />}

      {!isDefaultSelection(selection) && (
        <button type="button" className="text-sm font-semibold text-navy-600 hover:underline" onClick={() => onChange(DEFAULT_SELECTION)}>
          Restaurar padrão
        </button>
      )}
    </div>
  );
}
