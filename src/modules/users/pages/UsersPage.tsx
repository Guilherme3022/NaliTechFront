import { useState } from 'react';
import { Button, Chip, IconButton, Stack, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { PageHeader } from '@/shared/components/PageHeader';
import { DataTable, type Column } from '@/shared/components/DataTable';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { usePagination } from '@/shared/hooks/usePagination';
import type { UserResponse } from '@/modules/auth/types';
import { useDeleteUserMutation, useUsersQuery } from '../hooks';
import { UserFormDialog } from '../components/UserFormDialog';

export function UsersPage() {
  const { page, size, setPage, setSize } = usePagination();
  const query = useUsersQuery({ page, size });
  const del = useDeleteUserMutation();

  const [editing, setEditing] = useState<UserResponse | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [toDelete, setToDelete] = useState<UserResponse | null>(null);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (user: UserResponse) => {
    setEditing(user);
    setFormOpen(true);
  };

  const columns: Column<UserResponse>[] = [
    { key: 'name', label: 'Nome' },
    { key: 'email', label: 'E-mail' },
    {
      key: 'roles',
      label: 'Perfis',
      render: (u) => (
        <Stack direction="row" spacing={0.5} flexWrap="wrap">
          {u.roles.map((r) => (
            <Chip key={r} label={r} size="small" />
          ))}
        </Stack>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (u) => (
        <Chip
          label={u.status}
          size="small"
          color={u.status === 'ATIVO' ? 'success' : 'default'}
          variant="outlined"
        />
      ),
    },
    {
      key: 'actions',
      label: 'Ações',
      align: 'right',
      render: (u) => (
        <>
          <Tooltip title="Editar">
            <IconButton size="small" onClick={() => openEdit(u)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Remover">
            <IconButton size="small" onClick={() => setToDelete(u)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Usuários"
        subtitle="Gestão de acessos ao sistema"
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
            Novo usuário
          </Button>
        }
      />

      <DataTable
        columns={columns}
        rows={query.data?.content ?? []}
        rowKey={(u) => u.id}
        loading={query.isLoading}
        error={query.isError}
        onRetry={query.refetch}
        emptyMessage="Nenhum usuário cadastrado."
        emptyAction={
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
            Criar primeiro usuário
          </Button>
        }
        page={page}
        size={size}
        totalElements={query.data?.totalElements ?? 0}
        onPageChange={setPage}
        onSizeChange={setSize}
      />

      <UserFormDialog open={formOpen} user={editing} onClose={() => setFormOpen(false)} />

      <ConfirmDialog
        open={!!toDelete}
        title="Remover usuário"
        message={`Deseja remover ${toDelete?.name}? Esta ação não pode ser desfeita.`}
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
