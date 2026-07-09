import { Autocomplete, TextField } from '@mui/material';
import { useClientOptionsQuery } from '../hooks';
import type { ClientResponse } from '../types';

interface Props {
  value: string | null;
  onChange: (id: string | null) => void;
  label?: string;
  error?: boolean;
  helperText?: string;
}

// Select de cliente reutilizado em honorários, cobranças e obrigações fiscais.
export function ClientSelect({ value, onChange, label = 'Cliente', error, helperText }: Props) {
  const { data, isLoading } = useClientOptionsQuery();
  const options = data?.content ?? [];
  const selected = options.find((o) => o.id === value) ?? null;

  return (
    <Autocomplete<ClientResponse>
      options={options}
      loading={isLoading}
      value={selected}
      getOptionLabel={(o) => o.nome}
      isOptionEqualToValue={(o, v) => o.id === v.id}
      onChange={(_, v) => onChange(v?.id ?? null)}
      renderInput={(params) => (
        <TextField {...params} label={label} error={error} helperText={helperText} />
      )}
    />
  );
}
