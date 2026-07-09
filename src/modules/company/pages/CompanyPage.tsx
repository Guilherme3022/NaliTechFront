import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { useEffect } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { PageHeader } from '@/shared/components/PageHeader';
import { LoadingState, ErrorState } from '@/shared/components/states';
import { FileDropzone } from '@/shared/components/FileDropzone';
import { maskCnpj } from '@/shared/lib/format';
import { notifyInfo } from '@/shared/lib/notify';
import { useCompanyQuery, useCreateCompanyMutation, useUpdateCompanyMutation } from '../hooks';
import type { CompanyStatus } from '../types';

const REGIMES = ['SIMPLES_NACIONAL', 'LUCRO_PRESUMIDO', 'LUCRO_REAL', 'MEI'];
const PLANOS = ['BASICO', 'PROFISSIONAL', 'ENTERPRISE'];

const schema = z.object({
  cnpj: z.string().min(14, 'CNPJ inválido'),
  razaoSocial: z.string().min(1, 'Informe a razão social'),
  inscricaoEstadual: z.string().optional(),
  regimeTributario: z.string().optional(),
  plano: z.string().optional(),
  status: z.enum(['ATIVA', 'SUSPENSA', 'CANCELADA']),
});
type FormValues = z.infer<typeof schema>;

export function CompanyPage() {
  const query = useCompanyQuery();
  const update = useUpdateCompanyMutation();
  const create = useCreateCompanyMutation();
  const company = query.data;
  const isNew = !company;

  const { register, handleSubmit, control, reset, setValue, watch, formState: { errors } } =
    useForm<FormValues>({
      resolver: zodResolver(schema),
      defaultValues: { cnpj: '', razaoSocial: '', inscricaoEstadual: '', regimeTributario: '', plano: '', status: 'ATIVA' },
    });

  useEffect(() => {
    if (company) {
      reset({
        cnpj: company.cnpj,
        razaoSocial: company.razaoSocial,
        inscricaoEstadual: company.inscricaoEstadual ?? '',
        regimeTributario: company.regimeTributario ?? '',
        plano: company.plano ?? '',
        status: company.status,
      });
    }
  }, [company, reset]);

  const onSubmit = handleSubmit(async (values) => {
    if (company) {
      await update.mutateAsync({
        id: company.id,
        body: {
          razaoSocial: values.razaoSocial,
          inscricaoEstadual: values.inscricaoEstadual,
          regimeTributario: values.regimeTributario,
          plano: values.plano,
          status: values.status as CompanyStatus,
          responsavelId: company.responsavelId,
        },
      });
    } else {
      await create.mutateAsync({
        cnpj: values.cnpj.replace(/\D/g, ''),
        razaoSocial: values.razaoSocial,
        inscricaoEstadual: values.inscricaoEstadual,
        regimeTributario: values.regimeTributario,
        plano: values.plano,
      });
    }
  });

  if (query.isLoading) return <LoadingState rows={5} />;
  if (query.isError) return <ErrorState onRetry={query.refetch} />;

  return (
    <>
      <PageHeader
        title="Empresa"
        subtitle={isNew ? 'Cadastre os dados do seu escritório' : 'Dados fiscais e plano'}
      />

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card variant="outlined">
            <CardContent>
              <form onSubmit={onSubmit}>
                <Stack spacing={2}>
                  <TextField
                    label="CNPJ"
                    fullWidth
                    disabled={!isNew}
                    value={watch('cnpj')}
                    onChange={(e) => setValue('cnpj', maskCnpj(e.target.value))}
                    error={!!errors.cnpj}
                    helperText={errors.cnpj?.message}
                  />
                  <TextField
                    label="Razão social"
                    fullWidth
                    error={!!errors.razaoSocial}
                    helperText={errors.razaoSocial?.message}
                    {...register('razaoSocial')}
                  />
                  <TextField label="Inscrição estadual" fullWidth {...register('inscricaoEstadual')} />
                  <Controller
                    name="regimeTributario"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel>Regime tributário</InputLabel>
                        <Select label="Regime tributário" {...field}>
                          <MenuItem value="">—</MenuItem>
                          {REGIMES.map((r) => (
                            <MenuItem key={r} value={r}>
                              {r.replace(/_/g, ' ')}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  />
                  <Controller
                    name="plano"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel>Plano</InputLabel>
                        <Select label="Plano" {...field}>
                          <MenuItem value="">—</MenuItem>
                          {PLANOS.map((p) => (
                            <MenuItem key={p} value={p}>
                              {p}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  />
                  {!isNew && (
                    <Controller
                      name="status"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth>
                          <InputLabel>Status</InputLabel>
                          <Select label="Status" {...field}>
                            <MenuItem value="ATIVA">Ativa</MenuItem>
                            <MenuItem value="SUSPENSA">Suspensa</MenuItem>
                            <MenuItem value="CANCELADA">Cancelada</MenuItem>
                          </Select>
                        </FormControl>
                      )}
                    />
                  )}
                  <Box>
                    <Button type="submit" variant="contained" disabled={update.isPending || create.isPending}>
                      {isNew ? 'Cadastrar empresa' : 'Salvar alterações'}
                    </Button>
                  </Box>
                </Stack>
              </form>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Logo
              </Typography>
              <Stack alignItems="center" spacing={2}>
                <Avatar src={company?.logoUrl ?? undefined} sx={{ width: 96, height: 96 }}>
                  {watch('razaoSocial')?.charAt(0)}
                </Avatar>
                {/* O backend ainda não expõe endpoint de upload de logo. */}
                <FileDropzone
                  accept=".png,.jpg,.jpeg,.svg"
                  multiple={false}
                  hint="PNG, JPG ou SVG"
                  onFiles={() =>
                    notifyInfo('O upload de logo será habilitado quando o endpoint do backend estiver disponível.')
                  }
                />
                <Alert severity="info" sx={{ width: '100%' }}>
                  Recurso de upload de logo aguardando endpoint no backend.
                </Alert>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
}
