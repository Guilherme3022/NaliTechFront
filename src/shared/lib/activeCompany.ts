// Empresa ativa selecionada pelo ADMIN geral (item 7).
// O valor e lido pelo interceptor do axios (fora do React) e enviado no header
// X-Empresa-Id. So o ADMIN consegue trocar; o backend ignora o header para os
// demais perfis. Guardamos em localStorage para persistir entre reloads.
const KEY = 'nali.activeEmpresaId';

type Listener = () => void;
const listeners = new Set<Listener>();

export const activeCompany = {
  get(): string | null {
    return localStorage.getItem(KEY);
  },
  set(id: string | null) {
    if (id) {
      localStorage.setItem(KEY, id);
    } else {
      localStorage.removeItem(KEY);
    }
    listeners.forEach((l) => l());
  },
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
