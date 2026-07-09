import { useClientOptionsQuery } from './hooks';

// Retorna uma função que resolve id -> nome do cliente (fallback: id curto).
export function useClientName() {
  const { data } = useClientOptionsQuery();
  const map = new Map((data?.content ?? []).map((c) => [c.id, c.nome]));
  return (id: string | null | undefined) => (id ? map.get(id) ?? id.slice(0, 8) : '—');
}
