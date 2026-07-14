import { useQueryClient } from '@tanstack/react-query';
import { Autocomplete, TextField } from '@mui/material';
import { useClientOptionsQuery } from '@/modules/clients/hooks';
import type { ClientResponse } from '@/modules/clients/types';
import { activeClient, activeCompetence, useActiveClient, useActiveCompetence } from '@/shared/lib/activeSelection';

// Seletores de Cliente e Competencia no topo (itens 8, 13, 14). Visiveis para
// qualquer usuario autenticado. O usuario comum troca de cliente (dentro da sua
// empresa); o ADMIN, depois de escolher a empresa. Trocar qualquer um recarrega
// as telas dependentes (plano de contas, importacoes, conciliacoes...).
export function ClientCompetenceSwitcher() {
  const queryClient = useQueryClient();
  const clienteId = useActiveClient();
  const competencia = useActiveCompetence();

  const { data } = useClientOptionsQuery();
  const options = data?.content ?? [];
  const selected = options.find((o) => o.id === clienteId) ?? null;

  const reloadDependents = () => queryClient.invalidateQueries();

  return (
    <>
      <Autocomplete<ClientResponse>
        size="small"
        sx={{ minWidth: 220, mr: 1 }}
        options={options}
        value={selected}
        getOptionLabel={(o) => o.nome}
        isOptionEqualToValue={(o, v) => o.id === v.id}
        onChange={(_, v) => {
          activeClient.set(v?.id ?? null);
          reloadDependents();
        }}
        renderInput={(params) => <TextField {...params} label="Cliente" />}
      />
      <TextField
        size="small"
        type="month"
        label="Competência"
        InputLabelProps={{ shrink: true }}
        sx={{ width: 160, mr: 1 }}
        value={competencia ?? ''}
        onChange={(e) => {
          activeCompetence.set(e.target.value || null);
          reloadDependents();
        }}
      />
    </>
  );
}
