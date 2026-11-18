import { localizaProvider } from "./localiza-provider";
import { movidaProvider } from "./movida-provider";
import type { RentalProvider } from "./rental-provider";
import { unidasProvider } from "./unidas-provider";

/**
 * Registro de locadoras. Adicionar uma nova locadora = criar o adaptador,
 * incluir aqui e cadastrar suas equivalências. O motor de busca não muda.
 */
export const PROVIDERS: readonly RentalProvider[] = [localizaProvider, movidaProvider, unidasProvider];

export function findProvider(id: string): RentalProvider | undefined {
  return PROVIDERS.find((provider) => provider.info.id === id);
}
