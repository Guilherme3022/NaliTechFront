import { Step, StepLabel, Stepper } from '@mui/material';
import type { UploadStatus } from '../types';

// Etapas do pipeline: Upload → OCR → Parser → Normalização → Conciliação.
const STEPS = ['Upload', 'OCR', 'Parser', 'Normalização', 'Conciliação'];

// Mapeia o status/etapa atual do backend para o índice ativo do stepper.
function activeIndex(status: UploadStatus, etapa: string | null): number {
  if (status === 'RECEBIDO') return 0;
  if (status === 'CONCLUIDO') return STEPS.length;
  const e = (etapa ?? '').toLowerCase();
  if (e.includes('ocr')) return 1;
  if (e.includes('pars')) return 2;
  if (e.includes('normal')) return 3;
  if (e.includes('concil')) return 4;
  if (status === 'VALIDANDO') return 1;
  return 1; // PROCESSANDO genérico
}

export function PipelineStepper({ status, etapa }: { status: UploadStatus; etapa: string | null }) {
  const active = activeIndex(status, etapa);
  const isError = status === 'ERRO';

  return (
    <Stepper activeStep={active} alternativeLabel>
      {STEPS.map((label, idx) => {
        const failedHere = isError && idx === active;
        return (
          <Step key={label} completed={active > idx && !failedHere}>
            <StepLabel error={failedHere}>{label}</StepLabel>
          </Step>
        );
      })}
    </Stepper>
  );
}
