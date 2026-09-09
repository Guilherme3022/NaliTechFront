import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControl,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DownloadIcon from '@mui/icons-material/Download';
import { notifyError } from '@/shared/lib/notify';
import { useActiveClient, useActiveCompetence } from '@/shared/lib/activeSelection';
import { conciliacoesApi } from '../api';
import {
  useCancelarConciliacaoMutation,
  useConciliacoesQuery,
  useConcluirConciliacaoMutation,
  useCreateConciliacaoMutation,
  useProfilesQuery,
} from '../hooks';
import type { ConciliacaoResponse, ConciliacaoSituacao } from '../types';

const SITUACAO_LABEL: Record<ConciliacaoSituacao, string> = {
  RASCUNHO: 'Rascunho',
  AGUARDANDO_ARQUIVO: 'Aguardando arquivo',
  VALIDANDO: 'Validando',
  AGUARDANDO_PARAMETRIZACAO: 'Aguardando parametrização',
  COM_PENDENCIAS: 'Com pendências',
  PRONTA_PARA_REVISAO: 'Pronta para revisão',
  EM_REVISAO: 'Em revisão',
  CONCLUIDA: 'Concluída',
  CANCELADA: 'Cancelada',
};

const SITUACAO_COLOR: Record<ConciliacaoSituacao, 'default' | 'info' | 'warning' | 'success' | 'error'> = {
  RASCUNHO: 'default',
  AGUARDANDO_ARQUIVO: 'warning',
  VALIDANDO: 'info',
  AGUARDANDO_PARAMETRIZACAO: 'warning',
  COM_PENDENCIAS: 'warning',
  PRONTA_PARA_REVISAO: 'info',
  EM_REVISAO: 'info',
  CONCLUIDA: 'success',
  CANCELADA: 'error',
};

function formatCompetencia(iso: string): string {
  // iso vem como "YYYY-MM-DD" (1o dia do mes) -> "MM/YYYY"
  const [ano, mes] = iso.split('-');
  return `${mes}/${ano}`;
}

// Cards dos lotes de conciliacao por cliente/competencia (spec secoes 9-13).
export function ConciliacaoCards() {
  const clienteId = useActiveClient() ?? undefined;
  const competencia = useActiveCompetence() ?? undefined;
  const query = useConciliacoesQuery({ clienteId, competencia });
  const create = useCreateConciliacaoMutation();
  const concluir = useConcluirConciliacaoMutation();
  const cancelar = useCancelarConciliacaoMutation();
  const navigate = useNavigate();

  const podeCriar = !!clienteId && !!competencia;

  const handleDownload = async (c: ConciliacaoResponse, formato: 'TXT' | 'CSV') => {
    try {
      const blob = await conciliacoesApi.download(c.id, formato);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `conciliacao-${c.id.slice(0, 8)}.${formato.toLowerCase()}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      notifyError('Nao foi possivel baixar o arquivo.');
    }
  };

  const profiles = useProfilesQuery(clienteId).data ?? [];
  const [perfilId, setPerfilId] = useState('');

  const handleCreate = () => {
    if (!clienteId || !competencia) return;
    create.mutate({ clienteId, competencia, perfilId: perfilId || undefined });
  };

  const items = query.data ?? [];
  const perfilNome = (id: string | null) => profiles.find((p) => p.id === id)?.nome;

  return (
    <Box sx={{ mb: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
        <Typography variant="subtitle1" fontWeight={700}>
          Conciliações do cliente
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          {profiles.length > 0 && (
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel id="perfil-nova-label">Perfil</InputLabel>
              <Select
                labelId="perfil-nova-label"
                label="Perfil"
                value={perfilId}
                onChange={(e) => setPerfilId(e.target.value)}
              >
                <MenuItem value="">
                  <em>Sem perfil</em>
                </MenuItem>
                {profiles.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.nome}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          <Button
            size="small"
            variant="contained"
            startIcon={<AddIcon />}
            disabled={!podeCriar || create.isPending}
            onClick={handleCreate}
          >
            Nova conciliação
          </Button>
        </Stack>
      </Stack>

      {!competencia && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Selecione uma competência no topo para criar uma nova conciliação.
        </Typography>
      )}

      {items.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          Nenhuma conciliação para este cliente ainda.
        </Typography>
      ) : (
        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' } }}>
          {items.map((c) => (
            <Card key={c.id} variant="outlined">
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6">{formatCompetencia(c.competencia)}</Typography>
                  <Chip size="small" label={SITUACAO_LABEL[c.situacao]} color={SITUACAO_COLOR[c.situacao]} />
                </Stack>
                <Typography variant="caption" color="text.secondary" display="block">
                  Conciliação {c.id.slice(0, 8)}
                </Typography>
                {perfilNome(c.perfilId) && (
                  <Typography variant="caption" color="text.secondary">
                    Perfil: {perfilNome(c.perfilId)}
                  </Typography>
                )}
                {c.processando && (
                  <Box sx={{ mt: 1 }}>
                    <LinearProgress />
                    <Typography variant="caption" color="text.secondary">
                      Processando arquivo… aguarde
                    </Typography>
                  </Box>
                )}
                <Stack direction="row" spacing={1} sx={{ mt: 1.5 }} flexWrap="wrap">
                  <Button size="small" variant="outlined" onClick={() => navigate(`/reconciliation/${c.id}`)}>
                    Abrir
                  </Button>
                  {c.situacao === 'CONCLUIDA' ? (
                    <>
                      <Button size="small" startIcon={<DownloadIcon />} onClick={() => handleDownload(c, 'TXT')}>
                        TXT
                      </Button>
                      <Button size="small" startIcon={<DownloadIcon />} onClick={() => handleDownload(c, 'CSV')}>
                        CSV
                      </Button>
                    </>
                  ) : c.situacao === 'CANCELADA' ? null : (
                    <>
                      <Button
                        size="small"
                        variant="contained"
                        disabled={concluir.isPending}
                        onClick={() => concluir.mutate(c.id)}
                      >
                        Concluir
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        disabled={cancelar.isPending}
                        onClick={() => cancelar.mutate(c.id)}
                      >
                        Cancelar
                      </Button>
                    </>
                  )}
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
}
