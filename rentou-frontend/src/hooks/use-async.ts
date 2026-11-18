"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Estado de uma operação assíncrona como union discriminada: é impossível
 * acessar `data` sem antes checar `status === "success"`.
 */
export type AsyncState<T> =
  | { status: "loading"; data?: T }
  | { status: "success"; data: T }
  | { status: "error"; error: unknown; data?: T };

/**
 * Executa `task` sempre que `deps` mudam e ignora respostas antigas.
 * Sem o controle de `cancelled`, uma resposta lenta de uma busca anterior
 * poderia sobrescrever a mais recente (condição de corrida).
 * `data` da execução anterior é mantido durante o recarregamento, para a tela
 * não "piscar" ao recalcular preços.
 */
export function useAsync<T>(task: (() => Promise<T>) | null, deps: readonly unknown[]): AsyncState<T> & { retry: () => void } {
  const [state, setState] = useState<AsyncState<T>>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!task) return;
    let cancelled = false;
    setState((previous) => ({ status: "loading", data: previous.data }));
    task().then(
      (data) => !cancelled && setState({ status: "success", data }),
      (error: unknown) => !cancelled && setState((previous) => ({ status: "error", error, data: previous.data })),
    );
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- as dependências são controladas por quem chama
  }, [...deps, attempt]);

  const retry = useCallback(() => setAttempt((value) => value + 1), []);
  return { ...state, retry };
}
