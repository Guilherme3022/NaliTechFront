import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
} from '@mui/material';
import type { ReactNode } from 'react';
import { LoadingState, EmptyState, ErrorState } from './states';

export interface Column<T> {
  key: string;
  label: string;
  render?: (row: T) => ReactNode;
  sortable?: boolean;
  align?: 'left' | 'right' | 'center';
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
  emptyMessage?: string;
  emptyAction?: ReactNode;
  onRowClick?: (row: T) => void;
  // Paginação (server-side, alinhada ao Page<T> do Spring). Opcional.
  page?: number;
  size?: number;
  totalElements?: number;
  onPageChange?: (page: number) => void;
  onSizeChange?: (size: number) => void;
  // Ordenação server-side. sort no formato "campo,asc|desc".
  sort?: string;
  onSortChange?: (sort: string) => void;
}

// Tabela genérica reutilizável por todos os módulos (E0.7).
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  loading,
  error,
  onRetry,
  emptyMessage = 'Nenhum registro encontrado.',
  emptyAction,
  onRowClick,
  page,
  size,
  totalElements,
  onPageChange,
  onSizeChange,
  sort,
  onSortChange,
}: DataTableProps<T>) {
  if (loading) return <LoadingState />;
  if (error) return <ErrorState onRetry={onRetry} />;
  if (rows.length === 0) return <EmptyState description={emptyMessage} action={emptyAction} />;

  const [sortField, sortDir] = (sort ?? '').split(',');

  const handleSort = (field: string) => {
    if (!onSortChange) return;
    const nextDir = sortField === field && sortDir === 'asc' ? 'desc' : 'asc';
    onSortChange(`${field},${nextDir}`);
  };

  const showPagination =
    page != null && size != null && totalElements != null && onPageChange && onSizeChange;

  return (
    <Paper variant="outlined">
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell key={col.key} align={col.align} sx={{ fontWeight: 600, bgcolor: '#fafbfc' }}>
                  {col.sortable && onSortChange ? (
                    <TableSortLabel
                      active={sortField === col.key}
                      direction={sortField === col.key ? (sortDir as 'asc' | 'desc') : 'asc'}
                      onClick={() => handleSort(col.key)}
                    >
                      {col.label}
                    </TableSortLabel>
                  ) : (
                    col.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={rowKey(row)}
                hover
                onClick={() => onRowClick?.(row)}
                sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
              >
                {columns.map((col) => (
                  <TableCell key={col.key} align={col.align}>
                    {col.render ? col.render(row) : (row as Record<string, ReactNode>)[col.key]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {showPagination && (
        <TablePagination
          component="div"
          count={totalElements}
          page={page}
          rowsPerPage={size}
          onPageChange={(_, newPage) => onPageChange(newPage)}
          onRowsPerPageChange={(e) => onSizeChange(Number(e.target.value))}
          rowsPerPageOptions={[10, 20, 50]}
          labelRowsPerPage="Por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
        />
      )}
    </Paper>
  );
}
