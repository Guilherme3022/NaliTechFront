import { useSyncExternalStore } from 'react';

// Cliente e competencia ativos (itens 8, 13, 14 da spec). Diferente da empresa,
// NAO sao header de tenant: sao filtros passados como parametro nas listagens.
// Guardamos em localStorage para persistir entre reloads.
const CLIENT_KEY = 'nali.activeClienteId';
const COMPETENCE_KEY = 'nali.activeCompetencia'; // formato YYYY-MM

type Listener = () => void;

function makeStore(key: string) {
  const listeners = new Set<Listener>();
  return {
    get(): string | null {
      return localStorage.getItem(key);
    },
    set(value: string | null) {
      if (value) {
        localStorage.setItem(key, value);
      } else {
        localStorage.removeItem(key);
      }
      listeners.forEach((l) => l());
    },
    subscribe(listener: Listener): () => void {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

export const activeClient = makeStore(CLIENT_KEY);
export const activeCompetence = makeStore(COMPETENCE_KEY);

export function useActiveClient(): string | null {
  return useSyncExternalStore(activeClient.subscribe, activeClient.get);
}

export function useActiveCompetence(): string | null {
  return useSyncExternalStore(activeCompetence.subscribe, activeCompetence.get);
}
