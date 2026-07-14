import { useState } from 'react';
import { Alert, Box, Card, CardContent, Paper } from '@mui/material';
import { PageHeader } from '@/shared/components/PageHeader';
import { FileDropzone } from '@/shared/components/FileDropzone';
import { ErrorState } from '@/shared/components/states';
import { extractErrorMessage } from '@/shared/lib/api';
import { useActiveClient } from '@/shared/lib/activeSelection';
import { useDeleteUploadMutation, useUploadFileMutation, useUploadsQuery } from '../hooks';
import { UploadQueueList, type LocalUploadItem } from '../components/UploadQueueList';
import { usePagination } from '@/shared/hooks/usePagination';

export function UploadsPage() {
  const { page, size, setPage } = usePagination(20);
  const clienteId = useActiveClient();
  const query = useUploadsQuery({ page, size, clienteId: clienteId ?? undefined });
  const uploadMutation = useUploadFileMutation();
  const del = useDeleteUploadMutation();
  const [localItems, setLocalItems] = useState<LocalUploadItem[]>([]);

  const handleFiles = (files: File[]) => {
    if (!clienteId) return; // item 9: nao envia sem cliente selecionado
    files.forEach((file) => {
      const tempId = `${file.name}-${Date.now()}-${Math.random()}`;
      setLocalItems((prev) => [...prev, { tempId, name: file.name, size: file.size, progress: 0 }]);

      uploadMutation.mutate(
        {
          file,
          clienteId,
          onProgress: (pct) =>
            setLocalItems((prev) => prev.map((i) => (i.tempId === tempId ? { ...i, progress: pct } : i))),
        },
        {
          // Ao concluir, o item some da lista local e passa a vir do backend (E4.3).
          onSuccess: () => setLocalItems((prev) => prev.filter((i) => i.tempId !== tempId)),
          onError: (err) =>
            setLocalItems((prev) =>
              prev.map((i) => (i.tempId === tempId ? { ...i, error: extractErrorMessage(err) } : i)),
            ),
        },
      );
    });
  };

  return (
    <>
      <PageHeader title="Uploads" subtitle="Envie extratos, notas e planilhas para processamento" />

      {!clienteId && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Selecione um cliente no topo antes de enviar arquivos.
        </Alert>
      )}

      <Box sx={{ mb: 3, opacity: clienteId ? 1 : 0.5, pointerEvents: clienteId ? 'auto' : 'none' }}>
        <FileDropzone onFiles={handleFiles} />
      </Box>

      {query.isError ? (
        <Paper variant="outlined">
          <ErrorState message={extractErrorMessage(query.error)} onRetry={query.refetch} />
        </Paper>
      ) : (
        <Card variant="outlined">
          <CardContent sx={{ p: 0 }}>
            {query.data && !query.data.last && (
              <Alert severity="info" sx={{ m: 2 }}>
                Mostrando os {query.data.content.length} mais recentes.{' '}
                <Box
                  component="span"
                  sx={{ textDecoration: 'underline', cursor: 'pointer' }}
                  onClick={() => setPage(page + 1)}
                >
                  Ver mais
                </Box>
              </Alert>
            )}
            <UploadQueueList
              localItems={localItems}
              items={query.data?.content ?? []}
              onDelete={(id) => del.mutate(id)}
            />
          </CardContent>
        </Card>
      )}
    </>
  );
}
