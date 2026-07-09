import { Box, Card, CardContent, Grid, List, ListItemButton, ListItemText, Typography } from '@mui/material';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/shared/components/PageHeader';
import { LoadingState, ErrorState, EmptyState } from '@/shared/components/states';
import { formatDateTime } from '@/shared/lib/format';
import { MetricCard } from '../components/MetricCard';
import { useDashboardActivityQuery, useDashboardSummaryQuery } from '../hooks';
import { UploadStatusChip } from '@/modules/uploads/components/UploadStatusChip';

export function DashboardPage() {
  const summary = useDashboardSummaryQuery();
  const activity = useDashboardActivityQuery();
  const navigate = useNavigate();

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Visão geral do escritório" />

      {summary.isLoading ? (
        <LoadingState rows={2} />
      ) : summary.isError ? (
        <ErrorState onRetry={summary.refetch} />
      ) : (
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              label="Conciliações pendentes"
              value={summary.data!.conciliacoesPendentes}
              icon={<CompareArrowsIcon />}
              color="warning.main"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard label="Uploads hoje" value={summary.data!.uploadsHoje} icon={<UploadFileIcon />} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              label="Uploads com erro"
              value={summary.data!.uploadsComErro}
              icon={<ErrorOutlineIcon />}
              color="error.main"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              label="Movimentações conciliadas"
              value={summary.data!.movimentacoesConciliadas}
              icon={<CheckCircleIcon />}
              color="success.main"
            />
          </Grid>
        </Grid>
      )}

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Atividade recente
        </Typography>
        <Card variant="outlined">
          <CardContent sx={{ p: 0 }}>
            {activity.isLoading ? (
              <Box sx={{ p: 2 }}>
                <LoadingState rows={4} />
              </Box>
            ) : activity.isError ? (
              <ErrorState onRetry={activity.refetch} />
            ) : activity.data!.recentes.length === 0 ? (
              <EmptyState
                title="Tudo começa aqui"
                description="Assim que você enviar arquivos, a atividade recente aparecerá nesta lista."
              />
            ) : (
              <List>
                {activity.data!.recentes.map((item) => (
                  <ListItemButton key={item.uploadId} onClick={() => navigate(`/uploads/${item.uploadId}`)}>
                    <ListItemText
                      primary={`Upload ${item.uploadId.slice(0, 8)} — ${item.etapaAtual ?? '—'}`}
                      secondary={formatDateTime(item.quando)}
                    />
                    <UploadStatusChip status={item.status} />
                  </ListItemButton>
                ))}
              </List>
            )}
          </CardContent>
        </Card>
      </Box>
    </>
  );
}
