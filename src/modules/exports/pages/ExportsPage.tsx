import { useState } from 'react';
import { Box, Button, Card, CardContent, Grid, Stack, Typography } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { PageHeader } from '@/shared/components/PageHeader';
import { LoadingState, ErrorState, EmptyState } from '@/shared/components/states';
import { DataTable, type Column } from '@/shared/components/DataTable';
import { usePagination } from '@/shared/hooks/usePagination';
import { formatDate } from '@/shared/lib/format';
import { useExportHistoryQuery, useLayoutsQuery } from '../hooks';
import { ExportConfigModal } from '../components/ExportConfigModal';
import type { LayoutExport } from '../types';

export function ExportsPage() {
  const layouts = useLayoutsQuery();
  const [sistema, setSistema] = useState<string | null>(null);

  return (
    <>
      <PageHeader title="Exportação" subtitle="Gere arquivos para o seu sistema contábil" />

      {layouts.isLoading ? (
        <LoadingState rows={2} />
      ) : layouts.isError ? (
        <ErrorState onRetry={layouts.refetch} />
      ) : (layouts.data ?? []).length === 0 ? (
        <EmptyState title="Nenhum layout disponível" description="O backend não retornou sistemas suportados." />
      ) : (
        <Grid container spacing={2}>
          {layouts.data!.map((sys) => (
            <Grid item xs={12} sm={6} md={4} key={sys}>
              {/* LayoutExportCard */}
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                    <AccountBalanceIcon color="secondary" />
                    <Typography variant="h6">{sys}</Typography>
                  </Stack>
                  <Button
                    variant="contained"
                    startIcon={<FileDownloadIcon />}
                    onClick={() => setSistema(sys)}
                    fullWidth
                  >
                    Exportar
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Histórico de exportações
        </Typography>
        <HistoryTable />
      </Box>

      <ExportConfigModal sistema={sistema} onClose={() => setSistema(null)} />
    </>
  );
}

function HistoryTable() {
  const { page, size, setPage, setSize } = usePagination();
  const query = useExportHistoryQuery({ page, size });

  const columns: Column<LayoutExport>[] = [
    { key: 'sistema', label: 'Sistema' },
    { key: 'periodoInicio', label: 'Início', render: (e) => formatDate(e.periodoInicio) },
    { key: 'periodoFim', label: 'Fim', render: (e) => formatDate(e.periodoFim) },
    { key: 'quantidade', label: 'Movimentações', align: 'right' },
  ];

  return (
    <DataTable
      columns={columns}
      rows={query.data?.content ?? []}
      rowKey={(e) => e.id}
      loading={query.isLoading}
      error={query.isError}
      onRetry={query.refetch}
      emptyMessage="Nenhuma exportação gerada ainda."
      page={page}
      size={size}
      totalElements={query.data?.totalElements ?? 0}
      onPageChange={setPage}
      onSizeChange={setSize}
    />
  );
}
