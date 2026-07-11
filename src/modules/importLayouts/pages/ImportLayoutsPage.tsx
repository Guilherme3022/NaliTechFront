import { useState } from 'react';
import { Box, Button, Card, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { PageHeader } from '@/shared/components/PageHeader';
import { DataTable, type Column } from '@/shared/components/DataTable';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { useDeleteImportLayoutMutation, useImportLayoutsQuery } from '../hooks';
import { ImportLayoutFormDialog } from '../components/ImportLayoutFormDialog';
import type { ImportLayoutResponse } from '../types';

export function ImportLayoutsPage() {
  const query = useImportLayoutsQuery();
  const del = useDeleteImportLayoutMutation();
  const [editing, setEditing] = useState<ImportLayoutResponse | null>(null);
  const [open, setOpen] = useState(false);
  const [toDelete, setToDelete] = useState<ImportLayoutResponse | null>(null);

  const columns: Column<ImportLayoutResponse>[] = [
    { key: 'nome', label: 'Nome' },
    { key: 'colData', label: 'Data', render: (l) => l.colData ?? '—' },
    { key: 'colValor', label: 'Valor', render: (l) => l.colValor ?? '—' },
    { key: 'colDescricao', label: 'Descrição', render: (l) => l.colDescricao ?? '—' },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (l) => (
        <>
          <IconButton size="small" onClick={() => { setEditing(l); setOpen(true); }}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={() => setToDelete(l)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Layouts de importação"
        subtitle="Mapeie as colunas de planilhas/CSV de origem para os campos do sistema"
      />
      <Box sx={{ mb: 2, textAlign: 'right' }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditing(null); setOpen(true); }}>
          Novo layout
        </Button>
      </Box>
      <Card variant="outlined" sx={{ p: 0 }}>
        <DataTable
          columns={columns}
          rows={query.data ?? []}
          rowKey={(l) => l.id}
          loading={query.isLoading}
          error={query.isError}
          onRetry={query.refetch}
          emptyMessage="Nenhum layout de importação. Crie um para mapear colunas de arquivos personalizados."
        />
      </Card>
      <ImportLayoutFormDialog open={open} layout={editing} onClose={() => setOpen(false)} />
      <ConfirmDialog
        open={!!toDelete}
        title="Remover layout"
        message={`Remover "${toDelete?.nome}"?`}
        confirmLabel="Remover"
        confirmColor="error"
        loading={del.isPending}
        onClose={() => setToDelete(null)}
        onConfirm={async () => {
          if (toDelete) await del.mutateAsync(toDelete.id);
          setToDelete(null);
        }}
      />
    </>
  );
}
