import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
} from '@mui/material';
import { AccountSelect } from './AccountSelect';
import { ClientScopeSelect } from './ClientScopeSelect';
import { CostCenterSelect } from './CostCenterSelect';
import { BranchSelect } from './BranchSelect';
import { useCreateAccountRuleMutation } from '../hooks';

// Condição: descrição contém X e/ou valor OP ref → ação: conta / marcar revisão.
const schema = z.object({
  nome: z.string().min(1, 'Informe o nome da regra'),
  descricaoContains: z.string().optional(),
  tipoMovimento: z.string().optional(),
  bancoContains: z.string().optional(),
  documentoContains: z.string().optional(),
  valorOperador: z.string().optional(),
  valorRef: z.string().optional(),
  contaId: z.string().nullable().optional(),
  marcarRevisao: z.boolean(),
  prioridade: z.string(),
  ativo: z.boolean(),
});
type FormValues = z.infer<typeof schema>;

const OPERADORES = ['>', '>=', '<', '<=', '='];

export function AccountRuleFormDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const create = useCreateAccountRuleMutation();
  const [clienteId, setClienteId] = useState<string | null>(null);
  const [centroCustoId, setCentroCustoId] = useState<string | null>(null);
  const [filialId, setFilialId] = useState<string | null>(null);
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: '',
      descricaoContains: '',
      tipoMovimento: '',
      bancoContains: '',
      documentoContains: '',
      valorOperador: '',
      valorRef: '',
      contaId: null,
      marcarRevisao: false,
      prioridade: '0',
      ativo: true,
    },
  });

  useEffect(() => {
    if (open) {
      reset();
      setClienteId(null);
      setCentroCustoId(null);
      setFilialId(null);
    }
  }, [open, reset]);

  const onSubmit = handleSubmit(async (values) => {
    await create.mutateAsync({
      nome: values.nome,
      descricaoContains: values.descricaoContains || undefined,
      tipoMovimento: values.tipoMovimento || undefined,
      bancoContains: values.bancoContains || undefined,
      documentoContains: values.documentoContains || undefined,
      valorOperador: values.valorOperador || undefined,
      valorRef: values.valorRef ? Number(values.valorRef) : null,
      contaId: values.contaId ?? null,
      marcarRevisao: values.marcarRevisao,
      prioridade: Number(values.prioridade) || 0,
      ativo: values.ativo,
      clienteId,
      centroCustoId,
      filialId,
    });
    onClose();
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Nova regra de classificação</DialogTitle>
      <form onSubmit={onSubmit}>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Nome da regra"
              fullWidth
              error={!!errors.nome}
              helperText={errors.nome?.message}
              {...register('nome')}
            />
            <TextField
              label="Descrição contém"
              fullWidth
              placeholder="ex: TARIFA, PIX, SALARIO"
              {...register('descricaoContains')}
            />
            <Stack direction="row" spacing={2}>
              <Controller
                name="tipoMovimento"
                control={control}
                render={({ field }) => (
                  <FormControl sx={{ minWidth: 160 }}>
                    <InputLabel>Tipo</InputLabel>
                    <Select label="Tipo" {...field}>
                      <MenuItem value="">Qualquer</MenuItem>
                      <MenuItem value="ENTRADA">Entrada</MenuItem>
                      <MenuItem value="SAIDA">Saída</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
              <TextField label="Banco contém" fullWidth {...register('bancoContains')} />
            </Stack>
            <TextField
              label="Documento / código contém"
              fullWidth
              placeholder="ex: número do documento"
              {...register('documentoContains')}
            />
            <Stack direction="row" spacing={2}>
              <Controller
                name="valorOperador"
                control={control}
                render={({ field }) => (
                  <FormControl sx={{ minWidth: 120 }}>
                    <InputLabel>Operador</InputLabel>
                    <Select label="Operador" {...field}>
                      <MenuItem value="">—</MenuItem>
                      {OPERADORES.map((op) => (
                        <MenuItem key={op} value={op}>
                          {op}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
              <TextField label="Valor de referência" type="number" fullWidth {...register('valorRef')} />
            </Stack>
            <Controller
              name="contaId"
              control={control}
              render={({ field }) => (
                <AccountSelect value={field.value ?? null} onChange={field.onChange} label="Conta de destino" />
              )}
            />
            <TextField label="Prioridade" type="number" fullWidth {...register('prioridade')} />
            <ClientScopeSelect value={clienteId} onChange={setClienteId} />
            <CostCenterSelect value={centroCustoId} onChange={setCentroCustoId} />
            <BranchSelect value={filialId} onChange={setFilialId} />
            <Controller
              name="marcarRevisao"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Switch checked={field.value} onChange={field.onChange} />}
                  label="Marcar para revisão manual"
                />
              )}
            />
            <Controller
              name="ativo"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Switch checked={field.value} onChange={field.onChange} />}
                  label="Regra ativa"
                />
              )}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={create.isPending}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={create.isPending}>
            Salvar
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
