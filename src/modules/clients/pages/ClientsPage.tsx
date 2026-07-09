import { useState } from 'react';
import { Button, Chip, IconButton, InputAdornment, Stack, TextField, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/shared/components/PageHeader';
import { DataTable, type Column } from '@/shared/components/DataTable';
import { usePagination } from '@/shared/hooks/usePagination';
import { maskCpfCnpj } from '@/shared/lib/format';
import { useClientsQuery } from '../hooks';
import { ClientFormDialog } from '../components/ClientFormDialog';
import type { ClientResponse } from '../types';

export function ClientsPage() {
  const navigate = useNavigate();
  const { page, size, setPage, setSize } = usePagination();
  const [search, setSearch] = useState('');
  const query = useClientsQuery({ page, size, search: search || undefined });

  const [editing, setEditing] = useState<ClientResponse | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const columns: Column<ClientResponse>[] = [
    { key: 'nome', label: 'Nome' },
    { key: 'cnpjCpf', label: 'CPF/CNPJ', render: (c) => maskCpfCnpj(c.cnpjCpf) },
    { key: 'email', label: 'E-mail', render: (c) => c.email ?? '—' },
    {
      key: 'status',
      label: 'Status',
      render: (c) => (
        <Chip
          label={c.status}
          size="small"
          color={c.status === 'ATIVO' ? 'success' : 'default'}
          variant="outlined"
        />
      ),
    },
    {
      key: 'actions',
      label: 'Ações',
      align: 'right',
      render: (c) => (
        <>
          <Tooltip title="Ver detalhe">
            <IconButton size="small" onClick={() => navigate(`/clients/${c.id}`)}>
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Editar">
            <IconButton
              size="small"
              onClick={() => {
                setEditing(c);
                setFormOpen(true);
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Clientes"
        subtitle="Empresas atendidas pelo escritório"
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            Novo cliente
          </Button>
        }
      />

      <Stack sx={{ mb: 2 }}>
        <TextField
          placeholder="Buscar por nome ou CNPJ"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          size="small"
          sx={{ maxWidth: 360 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
      </Stack>

      <DataTable
        columns={columns}
        rows={query.data?.content ?? []}
        rowKey={(c) => c.id}
        loading={query.isLoading}
        error={query.isError}
        onRetry={query.refetch}
        onRowClick={(c) => navigate(`/clients/${c.id}`)}
        emptyMessage={search ? 'Nenhum cliente encontrado para a busca.' : 'Nenhum cliente cadastrado.'}
        page={page}
        size={size}
        totalElements={query.data?.totalElements ?? 0}
        onPageChange={setPage}
        onSizeChange={setSize}
      />

      <ClientFormDialog open={formOpen} client={editing} onClose={() => setFormOpen(false)} />
    </>
  );
}
