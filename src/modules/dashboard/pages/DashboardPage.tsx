import { Box, Card, CardContent, Chip, Grid, List, ListItemButton, ListItemText, Stack, Typography } from '@mui/material';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PeopleIcon from '@mui/icons-material/People';
import RuleFolderIcon from '@mui/icons-material/RuleFolder';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/shared/components/PageHeader';
import { LoadingState, ErrorState, EmptyState } from '@/shared/components/states';
import { formatDateTime } from '@/shared/lib/format';
import { MetricCard } from '../components/MetricCard';
import {
  useDashboardActivityQuery,
  useDashboardOperationQuery,
  useDashboardPortfolioQuery,
  useDashboardSummaryQuery,
} from '../hooks';
import { UploadStatusChip } from '@/modules/uploads/components/UploadStatusChip';

export function DashboardPage() {
  const summary = useDashboardSummaryQuery();
  const operation = useDashboardOperationQuery();
  const portfolio = useDashboardPortfolioQuery();
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

      {/* Operacao (Increment 8) */}
      {operation.data && (
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard label="Clientes ativos" value={operation.data.clientesAtivos} icon={<PeopleIcon />} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              label="Aguardando parametrização"
              value={operation.data.aguardandoClassificacao}
              icon={<RuleFolderIcon />}
              color="warning.main"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              label="Uploads processando"
              value={operation.data.uploadsProcessando}
              icon={<HourglassEmptyIcon />}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              label="Uploads com erro"
              value={operation.data.uploadsComErro}
              icon={<ErrorOutlineIcon />}
              color="error.main"
            />
          </Grid>
        </Grid>
      )}

      {/* Carteira por cliente (Increment 8) */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Carteira — clientes com pendências
        </Typography>
        <Card variant="outlined">
          <CardContent sx={{ p: 0 }}>
            {portfolio.isLoading ? (
              <Box sx={{ p: 2 }}>
                <LoadingState rows={4} />
              </Box>
            ) : portfolio.isError ? (
              <ErrorState onRetry={portfolio.refetch} />
            ) : (portfolio.data?.clientes.filter(
                (c) => c.pendentesConciliacao + c.aguardandoClassificacao > 0,
              ).length ?? 0) === 0 ? (
              <EmptyState title="Carteira em dia" description="Nenhum cliente com pendências no momento." />
            ) : (
              <List>
                {portfolio.data!.clientes
                  .filter((c) => c.pendentesConciliacao + c.aguardandoClassificacao > 0)
                  .map((c) => (
                    <ListItemButton key={c.clienteId} onClick={() => navigate(`/clients/${c.clienteId}`)}>
                      <ListItemText primary={c.nome} />
                      <Stack direction="row" spacing={1}>
                        {c.pendentesConciliacao > 0 && (
                          <Chip
                            size="small"
                            color="warning"
                            variant="outlined"
                            label={`${c.pendentesConciliacao} a conciliar`}
                          />
                        )}
                        {c.aguardandoClassificacao > 0 && (
                          <Chip
                            size="small"
                            color="info"
                            variant="outlined"
                            label={`${c.aguardandoClassificacao} a parametrizar`}
                          />
                        )}
                      </Stack>
                    </ListItemButton>
                  ))}
              </List>
            )}
          </CardContent>
        </Card>
      </Box>

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
