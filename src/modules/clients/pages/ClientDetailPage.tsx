import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/shared/components/PageHeader';
import { LoadingState, ErrorState, EmptyState } from '@/shared/components/states';
import { formatDateTime, maskCpfCnpj } from '@/shared/lib/format';
import { useClientDocumentsQuery, useClientQuery } from '../hooks';
import { ClientFormDialog } from '../components/ClientFormDialog';

function Field({ label, value }: { label: string; value: string }) {
  return (
    <Grid item xs={12} sm={6}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body1">{value}</Typography>
    </Grid>
  );
}

export function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [formOpen, setFormOpen] = useState(false);

  const query = useClientQuery(id);
  const docs = useClientDocumentsQuery(id);

  return (
    <>
      <PageHeader
        title="Detalhe do cliente"
        action={
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/clients')}>
            Voltar
          </Button>
        }
      />

      {query.isLoading ? (
        <LoadingState rows={4} />
      ) : query.isError || !query.data ? (
        <ErrorState onRetry={query.refetch} />
      ) : (
        <Card variant="outlined">
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tab} onChange={(_, v) => setTab(v)}>
              <Tab label="Dados" />
              <Tab label="Documentos" />
            </Tabs>
          </Box>
          <CardContent>
            {tab === 0 && (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">{query.data.nome}</Typography>
                  <Button startIcon={<EditIcon />} onClick={() => setFormOpen(true)}>
                    Editar
                  </Button>
                </Box>
                <Grid container spacing={2}>
                  <Field label="CPF/CNPJ" value={maskCpfCnpj(query.data.cnpjCpf)} />
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary">
                      Status
                    </Typography>
                    <Box>
                      <Chip
                        label={query.data.status}
                        size="small"
                        color={query.data.status === 'ATIVO' ? 'success' : 'default'}
                        variant="outlined"
                      />
                    </Box>
                  </Grid>
                  <Field label="Contato" value={query.data.contato ?? '—'} />
                  <Field label="Telefone" value={query.data.telefone ?? '—'} />
                  <Field label="E-mail" value={query.data.email ?? '—'} />
                </Grid>
              </>
            )}

            {tab === 1 && (
              <>
                {docs.isLoading ? (
                  <LoadingState rows={3} />
                ) : docs.isError ? (
                  <ErrorState onRetry={docs.refetch} />
                ) : (docs.data ?? []).length === 0 ? (
                  <EmptyState
                    title="Sem documentos vinculados"
                    description="Os arquivos enviados para este cliente aparecerão aqui."
                    action={
                      <Button variant="contained" onClick={() => navigate('/uploads')}>
                        Ir para uploads
                      </Button>
                    }
                  />
                ) : (
                  <List>
                    {docs.data!.map((doc) => (
                      <ListItem key={doc.id} divider>
                        <ListItemIcon>
                          <InsertDriveFileIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary={doc.descricao ?? doc.fileId}
                          secondary={formatDateTime(doc.createdAt)}
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      <ClientFormDialog open={formOpen} client={query.data ?? null} onClose={() => setFormOpen(false)} />
    </>
  );
}
