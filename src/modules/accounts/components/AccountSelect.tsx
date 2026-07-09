import { Autocomplete, TextField } from '@mui/material';
import { useAllAccountsQuery } from '../hooks';
import type { ChartAccountResponse } from '../types';

interface Props {
  value: string | null;
  onChange: (id: string | null) => void;
  label?: string;
  size?: 'small' | 'medium';
}

// Select de conta contábil reutilizado em conciliação e classificação.
export function AccountSelect({ value, onChange, label = 'Conta contábil', size = 'small' }: Props) {
  const { data, isLoading } = useAllAccountsQuery();
  const options = data?.content ?? [];
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
