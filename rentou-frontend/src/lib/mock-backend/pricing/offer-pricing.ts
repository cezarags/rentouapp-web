import type {
  MileageDto,
  OfferDto,
  PriceLineDto,
  ProtectionDto,
  ProtectionLevel,
  SelectedItemDto,
  SelectionDto,
} from "@/lib/api/contracts";
import { addonLabel, protectionLabel, THIRD_PARTY_PROTECTION } from "@/lib/catalog";
import { formatMoney } from "@/lib/format";
import { type Cents, percentOf, sum, toMoney } from "../money";
import { resolveItem, type ResolvedItem } from "../normalization/normalizer";
import type { CanonicalItemCode } from "../normalization/equivalence-table";
import type { ProviderProduct, ProviderRate, RentalProvider, SearchContext } from "../providers/rental-provider";

interface PricedItem {
  item: SelectedItemDto;
  /** Linha de preço; só existe quando o item foi confirmado e tem custo. */
  line?: PriceLineDto;
  /** Falso quando o item impede comparar esta oferta com as outras. */
  keepsComparable: boolean;
}

function perDayLine(code: string, label: string, product: ProviderProduct, days: number): PriceLineDto {
  return {
    code,
    label: `${label} (${product.commercialName})`,
    amount: toMoney(product.pricePerDay * days),
    detail: `${formatMoney(toMoney(product.pricePerDay))} × ${days} ${days === 1 ? "diária" : "diárias"}`,
  };
}

/** CONFIRMED e PARTIAL entram no preço; UNCONFIRMED e UNAVAILABLE não. */
function isPriceable(resolved: ResolvedItem): resolved is ResolvedItem & { product: ProviderProduct } {
  return (resolved.status === "CONFIRMED" || resolved.status === "PARTIAL") && resolved.product !== undefined;
}

function priceItem(code: CanonicalItemCode, label: string, resolved: ResolvedItem, days: number): PricedItem {
  const item: SelectedItemDto = {
    code,
    label,
    status: resolved.status,
    commercialName: resolved.product?.commercialName,
    note: resolved.note,
    price: resolved.product ? toMoney(resolved.product.pricePerDay * days) : undefined,
  };
  if (!isPriceable(resolved)) {
    return { item, keepsComparable: false };
  }
  return { item, keepsComparable: true, line: perDayLine(code, label, resolved.product, days) };
}

function toProtection(level: ProtectionLevel, product: ProviderProduct): ProtectionDto {
  return {
    level,
    commercialName: product.commercialName,
    deductible: product.deductible == null ? null : toMoney(product.deductible),
    coverages: product.coverages ?? [],
  };
}

function includedProtection(provider: RentalProvider, rate: ProviderRate): ProtectionDto {
  const product = provider.products.find((candidate) => candidate.sku === rate.includedProtectionSku);
  if (!product) throw new Error(`Proteção incluída ${rate.includedProtectionSku} ausente no catálogo de ${provider.info.id}`);
  return toProtection("BASIC", product);
}

function toMileageDto(mileage: ProviderRate["mileage"]): MileageDto {
  return {
    type: mileage.type,
    kmPerDay: mileage.kmPerDay,
    extraKmPrice: mileage.extraKmPrice == null ? undefined : toMoney(mileage.extraKmPrice),
  };
}

/** Aplica a preferência de quilometragem e devolve a quilometragem efetiva. */
function priceMileage(
  provider: RentalProvider,
  rate: ProviderRate,
  selection: SelectionDto,
  days: number,
): { mileage: MileageDto; priced?: PricedItem; note?: string } {
  const current = toMileageDto(rate.mileage);
  const wantsFree = selection.mileage === "FREE" && rate.mileage.type === "CONTROLLED";
  const wantsControlled = selection.mileage === "CONTROLLED" && rate.mileage.type === "FREE";
  if (!wantsFree && !wantsControlled) return { mileage: current };

  const code: CanonicalItemCode = wantsFree ? "MILEAGE_FREE_UPGRADE" : "MILEAGE_CONTROLLED";
  const label = wantsFree ? "Quilometragem livre" : "Quilometragem controlada";
  const resolved = resolveItem(provider, code);

  if (!isPriceable(resolved)) {
    // Sem a opção, a oferta mantém a quilometragem original. Isso não a torna
    // incomparável: ela apenas cai no grupo da sua quilometragem real.
    const keeps = rate.mileage.type === "FREE" ? "livre" : "controlada";
    return { mileage: current, note: `${label} não está disponível; a oferta mantém quilometragem ${keeps}.` };
  }

  const mileage: MileageDto = wantsFree ? { type: "FREE" } : { type: "CONTROLLED", kmPerDay: resolved.kmPerDay };
  return { mileage, priced: priceItem(code, label, resolved, days) };
}

/**
 * Calcula o preço completo de uma oferta para a personalização escolhida.
 * Ordem: diárias → descontos → adicionais confirmados → taxas → total.
 */
export function priceOffer(
  offerId: string,
  provider: RentalProvider,
  rate: ProviderRate,
  context: SearchContext,
  selection: SelectionDto,
): OfferDto {
  const days = context.rentalDays;

  // 1. Diárias e descontos.
  const discounts = provider.discountsFor(context, rate);
  const discountPercent = sum(discounts.map((discount) => discount.percent));
  const dailyRate: Cents = rate.dailyRate - percentOf(rate.dailyRate, discountPercent);
  const baseTotal: Cents = dailyRate * days;
  const discountLines: PriceLineDto[] = discounts.map((discount) => ({
    code: discount.code,
    label: discount.label,
    amount: toMoney(-percentOf(rate.dailyRate, discount.percent) * days),
  }));

  // 2. Itens da personalização, normalizados para o catálogo da locadora.
  const pricedItems: PricedItem[] = [];
  let protection = includedProtection(provider, rate);
  let thirdPartyProtection: ProtectionDto | null = null;

  if (selection.protectionLevel !== "BASIC") {
    const code: CanonicalItemCode = `PROTECTION_${selection.protectionLevel}`;
    const resolved = resolveItem(provider, code);
    pricedItems.push(priceItem(code, protectionLabel(selection.protectionLevel), resolved, days));
    if (isPriceable(resolved)) {
      protection = toProtection(selection.protectionLevel, resolved.product);
    }
  }

  if (selection.thirdPartyProtection) {
    const resolved = resolveItem(provider, "THIRD_PARTY_PROTECTION");
    pricedItems.push(priceItem("THIRD_PARTY_PROTECTION", THIRD_PARTY_PROTECTION.label, resolved, days));
    if (isPriceable(resolved)) {
      thirdPartyProtection = toProtection("BASIC", resolved.product);
    }
  }

  for (const addon of selection.addons) {
    pricedItems.push(priceItem(addon, addonLabel(addon), resolveItem(provider, addon), days));
  }

  const mileageResult = priceMileage(provider, rate, selection, days);
  if (mileageResult.priced) pricedItems.push(mileageResult.priced);

  const extras = pricedItems.flatMap((priced) => (priced.line ? [priced.line] : []));
  const extrasTotal: Cents = sum(extras.map((line) => Math.round(Number(line.amount.amount) * 100)));

  // 3. Taxas.
  const fees: PriceLineDto[] = [];
  const { adminFeePercent, oneWayFee, youngDriverFeePerDay, youngDriverMaxAge } = provider.fees;
  fees.push({
    code: "ADMIN_FEE",
    label: `Taxa administrativa (${adminFeePercent}%)`,
    amount: toMoney(percentOf(baseTotal + extrasTotal, adminFeePercent)),
    detail: "Sobre diárias e adicionais",
  });
  if (context.oneWay) {
    fees.push({ code: "ONE_WAY_FEE", label: "Devolução em outra loja", amount: toMoney(oneWayFee) });
  }
  if (context.driverAge <= youngDriverMaxAge) {
    fees.push({
      code: "YOUNG_DRIVER_FEE",
      label: "Condutor jovem (até 24 anos)",
      amount: toMoney(youngDriverFeePerDay * days),
      detail: `${formatMoney(toMoney(youngDriverFeePerDay))} × ${days} ${days === 1 ? "diária" : "diárias"}`,
    });
  }
  const feesTotal: Cents = sum(fees.map((fee) => Math.round(Number(fee.amount.amount) * 100)));

  // 4. Comparabilidade.
  const blocking = pricedItems.filter((priced) => !priced.keepsComparable);
  const comparabilityNotes = blocking.map((priced) =>
    priced.item.status === "UNAVAILABLE"
      ? `${priced.item.label}: não oferecido por esta locadora.`
      : `${priced.item.label}: equivalência não confirmada.`,
  );
  const partialNotes = pricedItems
    .filter((priced) => priced.item.status === "PARTIAL")
    .map((priced) => `${priced.item.label}: ${priced.item.note ?? "equivalência parcial."}`);
  comparabilityNotes.push(...partialNotes);
  if (mileageResult.note) comparabilityNotes.push(mileageResult.note);

  return {
    id: offerId,
    providerId: provider.info.id,
    vehicle: rate.vehicle,
    mileage: mileageResult.mileage,
    protection,
    thirdPartyProtection,
    price: {
      dailyRate: toMoney(dailyRate),
      rentalDays: days,
      baseTotal: toMoney(baseTotal),
      discounts: discountLines,
      extras,
      extrasTotal: toMoney(extrasTotal),
      fees,
      feesTotal: toMoney(feesTotal),
      total: toMoney(baseTotal + extrasTotal + feesTotal),
    },
    selectedItems: pricedItems.map((priced) => priced.item),
    comparable: blocking.length === 0,
    comparabilityNotes,
    fuelPolicy: provider.fuelPolicy,
    cancellationPolicy: provider.cancellationPolicy,
    bookingUrl: provider.bookingUrl(context, rate),
  };
}
