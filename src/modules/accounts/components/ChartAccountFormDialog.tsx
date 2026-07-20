import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material';
import { useCreateChartAccountMutation, useUpdateChartAccountMutation } from '../hooks';
import type { ChartAccountResponse } from '../types';
import { ClientScopeSelect } from './ClientScopeSelect';

const schema = z.object({
  codigo: z.string().min(1, 'Informe o código'),
  codigoClassificacao: z.string().optional(),
  nome: z.string().min(1, 'Informe o nome'),
  tipo: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  account: ChartAccountResponse | null;
  parentId?: string | null;
  onClose: () => void;
}

export function ChartAccountFormDialog({ open, account, parentId, onClose }: Props) {
  const isEdit = !!account;
  const create = useCreateChartAccountMutation();
  const update = useUpdateChartAccountMutation();

  const [clienteId, setClienteId] = useState<string | null>(null);
  // Natureza: 'auto' (deixa o sistema inferir pela hierarquia), 'A' (analítica) ou 'S' (sintética).
  const [natureza, setNatureza] = useState<'auto' | 'A' | 'S'>('auto');
  // Natureza de saldo (o que o D-/C- legado indicava): devedora (débito) ou credora (crédito).
  const [saldo, setSaldo] = useState<'none' | 'DEVEDORA' | 'CREDORA'>('none');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { codigo: '', codigoClassificacao: '', nome: '', tipo: '' },
  });

  useEffect(() => {
    if (open) {
      reset({
        codigo: account?.codigo ?? '',
        codigoClassificacao: account?.codigoClassificacao ?? '',
        nome: account?.nome ?? '',
        tipo: account?.tipo ?? '',
      });
      setClienteId(account?.clienteId ?? null);
      setNatureza(account?.analitica === true ? 'A' : account?.analitica === false ? 'S' : 'auto');
      setSaldo(
        account?.naturezaSaldo === 'DEVEDORA'
          ? 'DEVEDORA'
          : account?.naturezaSaldo === 'CREDORA'
            ? 'CREDORA'
            : 'none',
      );
    }
  }, [open, account, reset]);

  const onSubmit = handleSubmit(async (values) => {
    const analitica = natureza === 'auto' ? null : natureza === 'A';
    const classificacao = values.codigoClassificacao?.trim() || null;
    const body = {
      ...values,
      codigoClassificacao: classificacao,
      // Preserva o código original completo na edição; na criação o backend usa o próprio código.
      codigoOriginal: account?.codigoOriginal ?? null,
      analitica,
      naturezaSaldo: saldo === 'none' ? null : saldo,
      parentId: account?.parentId ?? parentId ?? null,
      clienteId,
    };
    if (isEdit && account) {
      await update.mutateAsync({ id: account.id, body });
    } else {
      await create.mutateAsync(body);
    }
    onClose();
  });

  const pending = create.isPending || update.isPending;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{isEdit ? 'Editar conta' : 'Nova conta'}</DialogTitle>
      <form onSubmit={onSubmit}>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Código"
              fullWidth
              error={!!errors.codigo}
              helperText={errors.codigo?.message}
              {...register('codigo')}
            />
            <TextField
              label="Código de classificação (opcional)"
              fullWidth
              helperText="Máscara hierárquica p/ agrupamento/relatórios. Vazio = usa o código."
              {...register('codigoClassificacao')}
            />
            {isEdit && account?.codigoOriginal && account.codigoOriginal !== account.codigo && (
              <TextField
                label="Código completo (arquivo)"
                fullWidth
                value={account.codigoOriginal}
                InputProps={{ readOnly: true, sx: { fontFamily: 'monospace' } }}
                helperText="Código inteiro como veio no arquivo (somente leitura)."
              />
            )}
            <TextField
              label="Nome"
              fullWidth
              error={!!errors.nome}
              helperText={errors.nome?.message}
              {...register('nome')}
            />
            <TextField label="Classificação (ex.: RECEITA, DESPESA)" fullWidth {...register('tipo')} />
            <TextField
              select
              label="Tipo (S/A)"
              fullWidth
              value={natureza}
              onChange={(e) => setNatureza(e.target.value as 'auto' | 'A' | 'S')}
              helperText="Analítica recebe lançamento; sintética é agrupadora."
            >
              <MenuItem value="auto">Automática (pela hierarquia)</MenuItem>
              <MenuItem value="A">Analítica (lançável)</MenuItem>
              <MenuItem value="S">Sintética (agrupadora)</MenuItem>
            </TextField>
            <TextField
              select
              label="Natureza (D/C)"
              fullWidth
              value={saldo}
              onChange={(e) => setSaldo(e.target.value as 'none' | 'DEVEDORA' | 'CREDORA')}
              helperText="Natureza de saldo da conta (devedora = débito; credora = crédito)."
            >
              <MenuItem value="none">—</MenuItem>
              <MenuItem value="DEVEDORA">Devedora (débito)</MenuItem>
              <MenuItem value="CREDORA">Credora (crédito)</MenuItem>
            </TextField>
            <ClientScopeSelect value={clienteId} onChange={setClienteId} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={pending}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={pending}>
            Salvar
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
