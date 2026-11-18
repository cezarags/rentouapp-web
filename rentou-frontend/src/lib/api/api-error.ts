import type { FieldErrorDto, ProblemDetail } from "./contracts";

/**
 * Erro padronizado da camada de API. Encapsula um ProblemDetail (RFC 9457)
 * para que a interface trate erros do mock e do backend real da mesma forma.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly type: string;
  readonly fieldErrors: FieldErrorDto[];

  constructor(problem: ProblemDetail) {
    super(problem.detail ?? problem.title);
    this.name = "ApiError";
    this.status = problem.status;
    this.type = problem.type;
    this.fieldErrors = problem.errors ?? [];
  }

  static notFound(detail: string): ApiError {
    return new ApiError({ type: "about:blank", title: "Não encontrado", status: 404, detail });
  }

  static badRequest(detail: string, errors: FieldErrorDto[] = []): ApiError {
    return new ApiError({ type: "about:blank", title: "Requisição inválida", status: 400, detail, errors });
  }

  static network(): ApiError {
    return new ApiError({
      type: "about:blank",
      title: "Falha de conexão",
      status: 0,
      detail: "Não foi possível conectar ao servidor.",
    });
  }
}

/** Converte qualquer erro em uma mensagem amigável para o usuário. */
export function toFriendlyMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 0) return "Não conseguimos nos conectar. Verifique sua internet e tente novamente.";
    if (error.status === 404) return "Não encontramos o que você procurava. A busca pode ter expirado.";
    if (error.status === 400) return error.message;
    if (error.status >= 500) return "Nossos servidores estão com instabilidade. Tente novamente em instantes.";
    return error.message;
  }
  return "Algo deu errado. Tente novamente.";
}
