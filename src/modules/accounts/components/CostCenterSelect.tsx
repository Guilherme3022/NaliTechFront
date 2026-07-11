import { Autocomplete, TextField } from '@mui/material';
import { useCostCentersQuery } from '../hooks';
import type { CostCenterResponse } from '../types';

interface Props {
  value: string | null;
  onChange: (id: string | null) => void;
  label?: string;
  size?: 'small' | 'medium';
}

/** Select de centro de custo (opcional). */
export function CostCenterSelect({
  value,
  onChange,
  label = 'Centro de custo (opcional)',
  size = 'medium',
}: Props) {
  const { data, isLoading } = useCostCentersQuery();
  const options = data ?? [];
  const selected = options.find((o) => o.id === value) ?? null;

  return (
    <Autocomplete<CostCenterResponse>
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
