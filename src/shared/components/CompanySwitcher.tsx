import { useSyncExternalStore } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { useAuth } from '@/modules/auth/AuthContext';
import { companyApi } from '@/modules/company/api';
import { activeCompany } from '@/shared/lib/activeCompany';
import { activeClient } from '@/shared/lib/activeSelection';

// Seletor de empresa ativa no topo (itens 7 e 8). Visivel apenas para o ADMIN
// geral, que e o unico que transita entre empresas. Ao trocar, limpamos o cache
// do react-query para que todas as telas recarreguem no contexto da nova empresa.
export function CompanySwitcher() {
  const { hasRole } = useAuth();
  const queryClient = useQueryClient();

  const selected = useSyncExternalStore(activeCompany.subscribe, activeCompany.get);

  const isAdmin = hasRole('ADMIN');

  const { data: companies = [] } = useQuery({
    queryKey: ['companies', 'switcher'],
    queryFn: companyApi.list,
    enabled: isAdmin,
    staleTime: 60_000,
  });

  if (!isAdmin) return null;

  const handleChange = (value: string) => {
    activeCompany.set(value || null);
    // Trocar de empresa invalida o cliente selecionado (a lista de clientes muda).
    activeClient.set(null);
    // Recarrega os dados de todas as telas no contexto da empresa escolhida.
    queryClient.clear();
  };

  return (
    <FormControl size="small" sx={{ minWidth: 220, mr: 1 }}>
      <InputLabel id="empresa-ativa-label">Empresa</InputLabel>
      <Select
        labelId="empresa-ativa-label"
        label="Empresa"
        value={selected ?? ''}
        onChange={(e) => handleChange(e.target.value)}
        displayEmpty
      >
        <MenuItem value="">
          <em>Nenhuma (visão geral)</em>
        </MenuItem>
        {companies.map((company) => (
          <MenuItem key={company.id} value={company.id}>
            {company.razaoSocial}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
