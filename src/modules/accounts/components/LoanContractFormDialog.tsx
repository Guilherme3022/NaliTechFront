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
import { useCreateLoanContractMutation, useUpdateLoanContractMutation } from '../hooks';
import type { LoanContractResponse } from '../types';
import { AccountSelect } from './AccountSelect';
import { ClientScopeSelect } from './ClientScopeSelect';

interface Props {
  open: boolean;
  contract: LoanContractResponse | null;
  onClose: () => void;
}

const num = (v: string): number | null => (v.trim() === '' ? null : Number(v));

export function LoanContractFormDialog({ open, contract, onClose }: Props) {
  const isEdit = !!contract;
  const create = useCreateLoanContractMutation();
  const update = useUpdateLoanContractMutation();

  const [descricao, setDescricao] = useState('');
  const [valorTotal, setValorTotal] = useState('');
  const [taxaJuros, setTaxaJuros] = useState('');
  const [parcelas, setParcelas] = useState('');
  const [contaPrincipalId, setContaPrincipalId] = useState<string | null>(null);
  const [contaJurosId, setContaJurosId] = useState<string | null>(null);
  const [contaEncargosId, setContaEncargosId] = useState<string | null>(null);
  const [classificacaoPrazo, setClassificacaoPrazo] = useState('');
  const [ativo, setAtivo] = useState(true);
  const [clienteId, setClienteId] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setDescricao(contract?.descricao ?? '');
      setValorTotal(contract?.valorTotal?.toString() ?? '');
      setTaxaJuros(contract?.taxaJuros?.toString() ?? '');
      setParcelas(contract?.parcelas?.toString() ?? '');
      setContaPrincipalId(contract?.contaPrincipalId ?? null);
      setContaJurosId(contract?.contaJurosId ?? null);
      setContaEncargosId(contract?.contaEncargosId ?? null);
      setClassificacaoPrazo(contract?.classificacaoPrazo ?? '');
      setAtivo(contract?.ativo ?? true);
      setClienteId(contract?.clienteId ?? null);
    }
  }, [open, contract]);

  const pending = create.isPending || update.isPending;
  const valid = descricao.trim().length > 0;

  const onSubmit = async () => {
    if (!valid) return;
    const body = {
      descricao: descricao.trim(),
      valorTotal: num(valorTotal),
      taxaJuros: num(taxaJuros),
      parcelas: num(parcelas),
      contaPrincipalId,
      contaJurosId,
      contaEncargosId,
      classificacaoPrazo: classificacaoPrazo || null,
      ativo,
      clienteId,
    };
    if (isEdit && contract) {
      await update.mutateAsync({ id: contract.id, body });
    } else {
      await create.mutateAsync(body);
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Editar contrato' : 'Novo contrato de financiamento'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Descrição (ex: Financiamento Banco X)"
            fullWidth
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          />
          <Stack direction="row" spacing={2}>
            <TextField label="Valor total" type="number" fullWidth value={valorTotal} onChange={(e) => setValorTotal(e.target.value)} />
            <TextField label="Taxa de juros (%)" type="number" fullWidth value={taxaJuros} onChange={(e) => setTaxaJuros(e.target.value)} />
            <TextField label="Parcelas" type="number" fullWidth value={parcelas} onChange={(e) => setParcelas(e.target.value)} />
          </Stack>
          <AccountSelect label="Conta do principal" value={contaPrincipalId} onChange={setContaPrincipalId} />
          <AccountSelect label="Conta de juros" value={contaJurosId} onChange={setContaJurosId} />
          <AccountSelect label="Conta de encargos/multas" value={contaEncargosId} onChange={setContaEncargosId} />
          <FormControl fullWidth>
            <InputLabel>Classificação de prazo</InputLabel>
            <Select
              label="Classificação de prazo"
              value={classificacaoPrazo}
              onChange={(e) => setClassificacaoPrazo(e.target.value)}
            >
              <MenuItem value="">—</MenuItem>
              <MenuItem value="CURTO">Curto prazo</MenuItem>
              <MenuItem value="LONGO">Longo prazo</MenuItem>
            </Select>
          </FormControl>
          <ClientScopeSelect value={clienteId} onChange={setClienteId} />
          <FormControlLabel
            control={<Switch checked={ativo} onChange={(e) => setAtivo(e.target.checked)} />}
            label="Ativo"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={pending}>
          Cancelar
        </Button>
        <Button variant="contained" onClick={onSubmit} disabled={pending || !valid}>
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
