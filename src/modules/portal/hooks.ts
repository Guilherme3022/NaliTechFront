import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { PageParams } from '@/shared/types';
import { portalApi } from './api';
import type { UploadStatus } from '@/modules/uploads/types';

const KEY = 'portal';
const FINAL: UploadStatus[] = ['CONCLUIDO', 'ERRO'];

export function usePortalUploadMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ file, onProgress }: { file: File; onProgress?: (pct: number) => void }) =>
      portalApi.upload(file, onProgress),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function usePortalStatusQuery(params: PageParams) {
  return useQuery({
    queryKey: [KEY, params],
    queryFn: () => portalApi.status(params),
    refetchInterval: (query) => {
      const processing = query.state.data?.content.some((u) => !FINAL.includes(u.status));
      return processing ? 4000 : false;
    },
  });
}
