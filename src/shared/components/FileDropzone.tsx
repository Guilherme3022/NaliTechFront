import { useCallback, useRef, useState } from 'react';
import { Box, Typography } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

interface FileDropzoneProps {
  onFiles: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  hint?: string;
}

// Dropzone genérico com drag-and-drop e múltiplos arquivos (E0.8).
// Aceita PDF, CSV, XLSX, OFX, XML, TXT, ZIP e imagens por padrão.
const DEFAULT_ACCEPT = '.pdf,.csv,.xlsx,.xls,.ofx,.xml,.txt,.zip,.png,.jpg,.jpeg';

export function FileDropzone({
  onFiles,
  accept = DEFAULT_ACCEPT,
  multiple = true,
  disabled = false,
  hint = 'PDF, CSV, XLSX, OFX, XML, TXT, ZIP ou imagens',
}: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = useCallback(
    (list: FileList | null) => {
      if (!list || list.length === 0) return;
      onFiles(Array.from(list));
    },
    [onFiles],
  );

  return (
    <Box
      onClick={() => !disabled && inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        if (!disabled) handleFiles(e.dataTransfer.files);
      }}
      sx={{
        border: '2px dashed',
        borderColor: dragOver ? 'secondary.main' : 'divider',
        borderRadius: 2,
        p: 5,
        textAlign: 'center',
        bgcolor: dragOver ? 'action.hover' : 'background.paper',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        transition: 'all .15s ease',
      }}
    >
      <input
        ref={inputRef}
        type="file"
        hidden
        accept={accept}
        multiple={multiple}
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = '';
        }}
      />
      <CloudUploadIcon fontSize="large" color="action" />
      <Typography variant="subtitle1" sx={{ mt: 1 }}>
        Arraste arquivos aqui ou clique para selecionar
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {hint}
      </Typography>
    </Box>
  );
}
