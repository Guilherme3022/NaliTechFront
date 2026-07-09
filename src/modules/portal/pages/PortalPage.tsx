import { useState } from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import { PageHeader } from '@/shared/components/PageHeader';
import { FileDropzone } from '@/shared/components/FileDropzone';
import { extractErrorMessage } from '@/shared/lib/api';
import { UploadQueueList, type LocalUploadItem } from '@/modules/uploads/components/UploadQueueList';
import { usePortalStatusQuery, usePortalUploadMutation } from '../hooks';

// Portal do cliente: apenas enviar arquivos e acompanhar status (E16.2).
export function PortalPage() {
  const query = usePortalStatusQuery({ page: 0, size: 50 });
  const upload = usePortalUploadMutation();
  const [localItems, setLocalItems] = useState<LocalUploadItem[]>([]);

  const handleFiles = (files: File[]) => {
    files.forEach((file) => {
      const tempId = `${file.name}-${Date.now()}-${Math.random()}`;
      setLocalItems((prev) => [...prev, { tempId, name: file.name, size: file.size, progress: 0 }]);
      upload.mutate(
        {
          file,
          onProgress: (pct) =>
            setLocalItems((prev) => prev.map((i) => (i.tempId === tempId ? { ...i, progress: pct } : i))),
        },
        {
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
      <PageHeader title="Enviar documentos" subtitle="Envie seus arquivos para o escritório de contabilidade" />

      <Box sx={{ mb: 3 }}>
        <FileDropzone onFiles={handleFiles} />
      </Box>

      <Typography variant="h6" gutterBottom>
        Meus envios
      </Typography>
      <Card variant="outlined">
        <CardContent sx={{ p: 0 }}>
          {/* No portal não há ação de excluir; passamos um no-op. */}
          <UploadQueueList
            localItems={localItems}
            items={query.data?.content ?? []}
            onDelete={() => undefined}
          />
        </CardContent>
      </Card>
    </>
  );
}
