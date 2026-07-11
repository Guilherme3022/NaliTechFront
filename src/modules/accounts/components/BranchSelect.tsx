import { Autocomplete, TextField } from '@mui/material';
import { useBranchesQuery } from '../hooks';
import type { BranchResponse } from '../types';

interface Props {
  value: string | null;
  onChange: (id: string | null) => void;
  label?: string;
  size?: 'small' | 'medium';
}

/** Select de filial (opcional). */
export function BranchSelect({ value, onChange, label = 'Filial (opcional)', size = 'medium' }: Props) {
  const { data, isLoading } = useBranchesQuery();
  const options = data ?? [];
  const selected = options.find((o) => o.id === value) ?? null;

  return (
    <Autocomplete<BranchResponse>
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
