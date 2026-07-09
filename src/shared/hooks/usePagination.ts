import { useState } from 'react';

// Estado de paginação/ordenação server-side, compartilhado pelas telas com DataTable.
export function usePagination(initialSize = 10, initialSort?: string) {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(initialSize);
  const [sort, setSort] = useState<string | undefined>(initialSort);

  return {
    page,
    size,
    sort,
    setPage,
    setSize: (s: number) => {
      setSize(s);
      setPage(0);
    },
    setSort: (s: string) => {
      setSort(s);
      setPage(0);
    },
    reset: () => setPage(0),
  };
}
