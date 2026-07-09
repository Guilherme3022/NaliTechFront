import { useState } from 'react';
import { Alert, Box, Card, CardContent, Paper } from '@mui/material';
import { PageHeader } from '@/shared/components/PageHeader';
import { FileDropzone } from '@/shared/components/FileDropzone';
import { ErrorState } from '@/shared/components/states';
import { extractErrorMessage } from '@/shared/lib/api';
import { useDeleteUploadMutation, useUploadFileMutation, useUploadsQuery } from '../hooks';
import { UploadQueueList, type LocalUploadItem } from '../components/UploadQueueList';
import { usePagination } from '@/shared/hooks/usePagination';

export function UploadsPage() {
  const { page, size, setPage } = usePagination(20);
  const query = useUploadsQuery({ page, size });
  const uploadMutation = useUploadFileMutation();
  const del = useDeleteUploadMutation();
  const [localItems, setLocalItems] = useState<LocalUploadItem[]>([]);

  const handleFiles = (files: File[]) => {
    files.forEach((file) => {
      const tempId = `${file.name}-${Date.now()}-${Math.random()}`;
      setLocalItems((prev) => [...prev, { tempId, name: file.name, size: file.size, progress: 0 }]);

      uploadMutation.mutate(
        {
          file,
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

      <Box sx={{ mb: 3 }}>
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
