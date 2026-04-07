'use client';

import { Box, CircularProgress, Typography } from '@mui/material';

interface Props {
  label?: string;
}
export default function LoadingState({ label = '로딩 중...' }: Props) {
  return (
    <Box
      sx={{ display: 'grid', placeItems: 'center' }}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-busy="true"
    >
      <Box textAlign="center">
        <CircularProgress aria-hidden />
        <Typography color="text.secondary">{label}</Typography>
      </Box>
    </Box>
  );
}
