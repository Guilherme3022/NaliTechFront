import { Card, CardContent, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

export function MetricCard({
  label,
  value,
  icon,
  color = 'text.primary',
}: {
  label: string;
  value: number | string;
  icon: ReactNode;
  color?: string;
}) {
  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <div>
            <Typography variant="body2" color="text.secondary">
              {label}
            </Typography>
            <Typography variant="h4" sx={{ mt: 0.5, color }}>
              {value}
            </Typography>
          </div>
          <Stack sx={{ color: 'text.secondary' }}>{icon}</Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
