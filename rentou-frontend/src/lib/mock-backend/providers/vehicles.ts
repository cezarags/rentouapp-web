import type { BodyType, Transmission, VehicleCategory, VehicleDto } from "@/lib/api/contracts";
import { CATEGORY_LABELS } from "@/lib/catalog";

interface VehicleSpec {
  category: VehicleCategory;
  bodyType: BodyType;
  model: string;
  transmission: Transmission;
  airConditioning?: boolean;
  passengers?: number;
  doors?: number;
  largeBags: number;
  smallBags: number;
}

/** Fábrica de VehicleDto com valores padrão, para deixar os catálogos enxutos. */
export function vehicle(spec: VehicleSpec): VehicleDto {
  return {
    category: spec.category,
    categoryLabel: CATEGORY_LABELS[spec.category],
    bodyType: spec.bodyType,
    modelName: `${spec.model} ou similar`,
    transmission: spec.transmission,
    airConditioning: spec.airConditioning ?? true,
    passengers: spec.passengers ?? 5,
    doors: spec.doors ?? 4,
    largeBags: spec.largeBags,
    smallBags: spec.smallBags,
  };
}
