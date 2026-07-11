import { Autocomplete, TextField } from '@mui/material';
import { useClientOptionsQuery } from '@/modules/clients/hooks';
import type { ClientResponse } from '@/modules/clients/types';

interface Props {
  value: string | null;
  onChange: (id: string | null) => void;
  size?: 'small' | 'medium';
}

/**
 * Escopo da configuração: um cliente específico ou "Compartilhado (escritório)".
 * `null` = compartilhado (vale para todos os clientes, com o específico tendo prioridade).
 */
export function ClientScopeSelect({ value, onChange, size = 'medium' }: Props) {
  const { data, isLoading } = useClientOptionsQuery();
  const options = data?.content ?? [];
  const selected = options.find((o) => o.id === value) ?? null;

  return (
    <Autocomplete<ClientResponse>
      options={options}
      loading={isLoading}
      value={selected}
      size={size}
      getOptionLabel={(o) => o.nome}
      isOptionEqualToValue={(o, v) => o.id === v.id}
      onChange={(_, v) => onChange(v?.id ?? null)}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Escopo"
          placeholder="Compartilhado (escritório)"
          helperText="Deixe vazio para valer para todos os clientes"
        />
      )}
    />
  );
}
