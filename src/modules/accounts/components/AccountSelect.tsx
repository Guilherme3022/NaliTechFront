import { Autocomplete, TextField } from '@mui/material';
import { useActiveClient } from '@/shared/lib/activeSelection';
import { useLancaveisAccountsQuery } from '../hooks';
import type { ChartAccountResponse } from '../types';

interface Props {
  value: string | null;
  onChange: (id: string | null) => void;
  label?: string;
  size?: 'small' | 'medium';
}

// Select de conta contábil reutilizado em conciliação e classificação.
// Só oferece contas ANALÍTICAS (lançáveis) do cliente ativo — contas sintéticas
// (agrupadoras) nunca recebem lançamento, então não aparecem aqui.
export function AccountSelect({ value, onChange, label = 'Conta contábil', size = 'small' }: Props) {
  const clienteId = useActiveClient();
  const { data, isLoading } = useLancaveisAccountsQuery(clienteId);
  const options = data ?? [];
  const selected = options.find((o) => o.id === value) ?? null;

  return (
    <Autocomplete<ChartAccountResponse>
      options={options}
      loading={isLoading}
      value={selected}
      size={size}
      getOptionLabel={(o) => `${o.codigo} — ${o.nome}`}
      isOptionEqualToValue={(o, v) => o.id === v.id}
      onChange={(_, v) => onChange(v?.id ?? null)}
      renderInput={(params) => <TextField {...params} label={label} />}
    />
  );
}
